@echo off
REM Sync manuel ponctuel : double-clique ce fichier pour pousser maintenant.
cd /d "C:\Users\User\OneDrive\Documents\Claude\Projects\app"
git add .
git commit -m "sync manuel %date% %time%"
git push
echo.
echo Termine. Vercel va redeployer.
pause
