/**
 * SacTrack — webhook Google Apps Script
 *
 * INSTALLATION (5 min) :
 *  1. Ouvre Google Sheets, crée une nouvelle feuille vide
 *  2. Menu Extensions > Apps Script
 *  3. Colle ce code (remplace tout ce qu'il y a déjà)
 *  4. Clique sur "Déployer" (en haut à droite) > "Nouveau déploiement"
 *  5. Roue crantée > "Application Web"
 *  6. Description : SacTrack v1
 *     Exécuter en tant que : Moi
 *     Qui a accès : Tout le monde
 *  7. Clique "Déployer", autorise l'accès Google
 *  8. Copie l'URL "Application Web" (...exec)
 *  9. Colle cette URL dans SacTrack > ⚙️ > URL du webhook
 * 10. Clique "Tester la connexion" dans l'app → tu dois voir ✓
 */

const SHEET_NAME = 'Sacs';
const HEADERS = [
  'Date événement',
  'Date sac',
  'Type',
  'BagID',
  'Région',
  'Couleur région',
  'Étiquette',
  'Appareil'
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Ping de test
    if (data.test) {
      return jsonResponse({ ok: true, message: 'test reçu', timestamp: data.timestamp });
    }

    const sheet = getOrCreateSheet();
    const events = Array.isArray(data.events) ? data.events : [data];

    const rows = events.map(ev => [
      ev.eventTime ? new Date(ev.eventTime) : new Date(),
      ev.timestamp ? new Date(ev.timestamp) : '',
      ev.event || '',
      ev.bagId || '',
      ev.regionName || '',
      ev.regionColor || '',
      ev.hasLabel ? 'oui' : 'non',
      ev.device || ''
    ]);

    if (rows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    }

    return jsonResponse({ ok: true, written: rows.length });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doGet() {
  // utile pour vérifier que le webhook est en ligne dans un navigateur
  return jsonResponse({ ok: true, service: 'SacTrack', status: 'ready' });
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, HEADERS.length);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
