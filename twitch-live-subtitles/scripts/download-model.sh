#!/bin/bash
# Vosk Deutsch-Modell herunterladen
# Kleine Version (~50 MB) - für bessere Qualität das große Modell verwenden

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
MODELS_DIR="$PROJECT_DIR/models"

MODEL_NAME="vosk-model-small-de-0.15"
MODEL_URL="https://alphacephei.com/vosk/models/$MODEL_NAME.zip"

echo "============================================"
echo "  Vosk Deutsch-Modell Downloader"
echo "============================================"
echo ""

mkdir -p "$MODELS_DIR"

if [ -d "$MODELS_DIR/$MODEL_NAME" ]; then
  echo "Modell bereits vorhanden: $MODELS_DIR/$MODEL_NAME"
  echo "Zum erneuten Herunterladen erst löschen: rm -rf $MODELS_DIR/$MODEL_NAME"
  exit 0
fi

echo "Lade Modell herunter: $MODEL_NAME"
echo "URL: $MODEL_URL"
echo "Ziel: $MODELS_DIR/"
echo ""

cd "$MODELS_DIR"

if command -v wget &> /dev/null; then
  wget -q --show-progress "$MODEL_URL" -O "$MODEL_NAME.zip"
elif command -v curl &> /dev/null; then
  curl -L --progress-bar "$MODEL_URL" -o "$MODEL_NAME.zip"
else
  echo "Fehler: Weder wget noch curl gefunden!"
  exit 1
fi

echo ""
echo "Entpacke Modell..."
unzip -q "$MODEL_NAME.zip"
rm "$MODEL_NAME.zip"

echo ""
echo "Fertig! Modell installiert: $MODELS_DIR/$MODEL_NAME"
echo ""
echo "Für bessere Erkennungsqualität das große Modell verwenden:"
echo "  https://alphacephei.com/vosk/models"
echo "  -> vosk-model-de-0.21 (~1.8 GB)"
