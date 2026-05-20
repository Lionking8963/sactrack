# ============================================================
#  SacTrack - Auto-sync local -> GitHub -> Vercel
# ------------------------------------------------------------
#  Surveille le dossier du projet. Des qu'un fichier change
#  (nouveau fichier genere, modif, suppression), commit + push
#  automatiquement sur GitHub. Vercel redeploie tout seul.
#
#  LANCEMENT :
#    Clic droit sur ce fichier > "Executer avec PowerShell"
#    OU dans un terminal :
#    powershell -ExecutionPolicy Bypass -File auto-sync.ps1
#
#  ARRET : Ctrl + C
# ============================================================

$folder   = "C:\Users\User\OneDrive\Documents\Claude\Projects\app"
$interval = 15   # secondes entre chaque verification

Set-Location $folder

# Verifs de base
if (-not (Test-Path ".git")) {
    Write-Host "ERREUR : ce dossier n'est pas un depot git." -ForegroundColor Red
    Write-Host "Lance d'abord : git init / git remote add origin ..." -ForegroundColor Yellow
    Read-Host "Entree pour quitter"
    exit
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Auto-sync SacTrack actif" -ForegroundColor Cyan
Write-Host " Dossier : $folder"
Write-Host " Verification toutes les $interval s"
Write-Host " Ctrl+C pour arreter"
Write-Host "=========================================" -ForegroundColor Cyan

while ($true) {
    try {
        $changes = git status --porcelain
        if ($changes) {
            git add .
            $msg = "auto-sync " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
            git commit -m $msg | Out-Null
            git push 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Pousse sur GitHub -> Vercel redeploie." -ForegroundColor Green
            } else {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Push echoue (reseau ? auth ?). Nouvel essai au prochain cycle." -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Erreur : $_" -ForegroundColor Red
    }
    Start-Sleep -Seconds $interval
}
