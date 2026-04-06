@echo off
chcp 65001 >nul 2>&1
title Twitch Live Subtitles - Setup

echo ============================================
echo   Twitch Live Subtitles - Windows Setup
echo ============================================
echo.

REM --- Prüfe Node.js ---
echo [1/6] Pruefe Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   FEHLER: Node.js nicht gefunden!
    echo   Bitte installiere Node.js von https://nodejs.org
    echo   Starte danach dieses Script erneut.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo   Gefunden: Node.js %%i

REM --- Prüfe SoX ---
echo.
echo [2/6] Pruefe SoX...
where sox >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   WARNUNG: SoX nicht gefunden!
    echo   SoX wird fuer die Mikrofon-Aufnahme benoetigt.
    echo.
    echo   Installiere SoX:
    echo     - https://sourceforge.net/projects/sox/files/sox/
    echo     - Oder: winget install sox
    echo     - Oder: choco install sox.portable
    echo.
    echo   Nach der Installation PC neu starten und dieses Script erneut ausfuehren.
    echo.
    set /p CONTINUE="Trotzdem fortfahren? (j/n): "
    if /i not "%CONTINUE%"=="j" exit /b 1
) else (
    echo   SoX gefunden.
)

REM --- Prüfe Docker ---
echo.
echo [3/6] Pruefe Docker...
where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   WARNUNG: Docker nicht gefunden!
    echo   Docker wird fuer LibreTranslate benoetigt.
    echo   Installiere Docker Desktop: https://www.docker.com/products/docker-desktop/
    echo.
    echo   Du kannst auch eine oeffentliche LibreTranslate-Instanz nutzen.
) else (
    echo   Docker gefunden.
)

REM --- npm install ---
echo.
echo [4/6] Installiere Abhaengigkeiten (npm install)...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo   FEHLER: npm install fehlgeschlagen!
    pause
    exit /b 1
)
echo   Abhaengigkeiten installiert.

REM --- Vosk Modell ---
echo.
echo [5/6] Lade Vosk Deutsch-Modell herunter (~50 MB)...
if exist "models\vosk-model-small-de-0.15" (
    echo   Modell bereits vorhanden. Ueberspringe.
) else (
    call npm run download-model
    if %ERRORLEVEL% NEQ 0 (
        echo   FEHLER: Modell-Download fehlgeschlagen!
        echo   Manuell herunterladen:
        echo     https://alphacephei.com/vosk/models/vosk-model-small-de-0.15.zip
        echo     Entpacken nach: models\vosk-model-small-de-0.15\
    )
)

REM --- .env erstellen ---
echo.
echo [6/6] Erstelle Konfigurationsdatei...
if exist ".env" (
    echo   .env existiert bereits. Ueberspringe.
) else (
    copy .env.example .env >nul
    echo   .env erstellt aus .env.example
    echo.
    echo   WICHTIG: Oeffne .env mit einem Texteditor und passe an:
    echo     - TWITCH_BOT_USERNAME
    echo     - TWITCH_OAUTH_TOKEN  (https://twitchapps.com/tmi/)
    echo     - TWITCH_CHANNEL
)

REM --- LibreTranslate starten ---
echo.
echo ============================================
echo   Setup abgeschlossen!
echo ============================================
echo.
echo   Naechste Schritte:
echo.
echo   1. .env Datei bearbeiten (Twitch-Daten eintragen)
echo.
echo   2. LibreTranslate starten (Docker muss laufen):
echo      docker run -d -p 5000:5000 libretranslate/libretranslate
echo.
echo   3. Tool starten:
echo      npm start
echo.
echo   4. In OBS Browser Source hinzufuegen:
echo      http://localhost:3000/overlay/?lang=en
echo.

set /p STARTDOCKER="LibreTranslate jetzt mit Docker starten? (j/n): "
if /i "%STARTDOCKER%"=="j" (
    echo.
    echo Starte LibreTranslate...
    echo (Erster Start kann einige Minuten dauern - Modelle werden heruntergeladen)
    docker run -d -p 5000:5000 --name libretranslate libretranslate/libretranslate
    if %ERRORLEVEL% EQU 0 (
        echo LibreTranslate gestartet! Erreichbar unter http://localhost:5000
    ) else (
        echo Fehler beim Starten. Ist Docker Desktop gestartet?
    )
)

echo.
echo Druecke eine Taste zum Beenden...
pause >nul
