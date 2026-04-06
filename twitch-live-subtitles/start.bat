@echo off
chcp 65001 >nul 2>&1
title Twitch Live Subtitles

echo ============================================
echo   Twitch Live Subtitles
echo ============================================
echo.

REM Pruefe ob .env existiert
if not exist ".env" (
    echo FEHLER: .env Datei nicht gefunden!
    echo Bitte zuerst setup.bat ausfuehren.
    pause
    exit /b 1
)

REM Pruefe ob node_modules existiert
if not exist "node_modules" (
    echo Abhaengigkeiten werden installiert...
    call npm install
)

REM Pruefe ob Vosk Modell existiert
if not exist "models\vosk-model-small-de-0.15" (
    echo Vosk-Modell wird heruntergeladen...
    call npm run download-model
)

echo Starte Twitch Live Subtitles...
echo.
node src/index.js

pause
