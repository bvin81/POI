@echo off
cd /d "%~dp0"

:: Ha itt nincs git repo, menjunk egy szinttel feljebb
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    cd ..
    git rev-parse --git-dir >nul 2>&1
    if errorlevel 1 (
        echo Hiba: nem talalhato git repository!
        echo Ellenorizd, hogy a GitHub Desktop beallitotta-e a repot.
        pause
        exit /b 1
    )
)

git add -A
git diff --cached --quiet && (
    echo Nincsenek valtozasok, nincs mit feltolteni.
) || (
    git commit -m "frissites %date% %time%"
    git push
    echo Sikeresen feltoltve GitHub-ra!
)
pause
