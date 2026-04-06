@echo off
REM Vosk Deutsch-Modell herunterladen (Windows Batch)
REM Ruft das PowerShell-Script auf

echo ============================================
echo   Vosk Deutsch-Modell Downloader
echo ============================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0download-model.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo FEHLER: Download fehlgeschlagen!
    echo Alternativ manuell herunterladen:
    echo   https://alphacephei.com/vosk/models/vosk-model-small-de-0.15.zip
    echo   Entpacken nach: models\vosk-model-small-de-0.15\
    pause
    exit /b 1
)

pause
