# Vosk Deutsch-Modell herunterladen (PowerShell)
# Kleine Version (~50 MB) - fuer bessere Qualitaet das grosse Modell verwenden

$ErrorActionPreference = "Stop"

$ProjectDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$ModelsDir = Join-Path $ProjectDir "models"
$ModelName = "vosk-model-small-de-0.15"
$ModelUrl = "https://alphacephei.com/vosk/models/$ModelName.zip"
$ZipPath = Join-Path $ModelsDir "$ModelName.zip"

Write-Host "============================================"
Write-Host "  Vosk Deutsch-Modell Downloader"
Write-Host "============================================"
Write-Host ""

if (-not (Test-Path $ModelsDir)) {
    New-Item -ItemType Directory -Path $ModelsDir -Force | Out-Null
}

$ModelPath = Join-Path $ModelsDir $ModelName
if (Test-Path $ModelPath) {
    Write-Host "Modell bereits vorhanden: $ModelPath"
    Write-Host "Zum erneuten Herunterladen erst loeschen:"
    Write-Host "  Remove-Item -Recurse -Force '$ModelPath'"
    exit 0
}

Write-Host "Lade Modell herunter: $ModelName"
Write-Host "URL: $ModelUrl"
Write-Host "Ziel: $ModelsDir\"
Write-Host ""

Write-Host "Download laeuft... (ca. 50 MB)"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ProgressPreference = 'SilentlyContinue'
Invoke-WebRequest -Uri $ModelUrl -OutFile $ZipPath -UseBasicParsing
$ProgressPreference = 'Continue'

Write-Host ""
Write-Host "Entpacke Modell..."
Expand-Archive -Path $ZipPath -DestinationPath $ModelsDir -Force
Remove-Item $ZipPath

Write-Host ""
Write-Host "Fertig! Modell installiert: $ModelPath"
Write-Host ""
Write-Host "Fuer bessere Erkennungsqualitaet das grosse Modell verwenden:"
Write-Host "  https://alphacephei.com/vosk/models"
Write-Host "  -> vosk-model-de-0.21 (~1.8 GB)"
