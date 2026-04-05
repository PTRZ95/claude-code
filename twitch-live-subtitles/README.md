# Twitch Live Subtitles

Echtzeit-Übersetzung deiner Sprache als Untertitel für Twitch-Streams. Sprich Deutsch, und deine Zuschauer sehen Untertitel in ihrer gewählten Sprache.

## Features

- **Echtzeit-Spracherkennung** - Vosk erkennt dein Deutsch offline und ohne Cloud
- **30+ Sprachen** - Englisch, Französisch, Spanisch, Japanisch, Koreanisch, Chinesisch, und viele mehr
- **OBS Overlay** - Browser Source mit animierten Untertiteln
- **Twitch Chat-Befehle** - Zuschauer wählen ihre Sprache mit `!lang en`
- **Web-Panel** - Zuschauer können auch über eine Webseite ihre Sprache wählen
- **Untertitel deaktivierbar** - Zuschauer können Untertitel jederzeit ausschalten

## Voraussetzungen

- **Node.js** 18+
- **SoX** (Audio-Aufnahme): `sudo apt install sox` / `brew install sox`
- **LibreTranslate** (Übersetzung): `docker run -d -p 5000:5000 libretranslate/libretranslate`

## Installation

```bash
# 1. Dependencies installieren
npm install

# 2. Vosk Deutsch-Modell herunterladen (~50 MB)
npm run download-model

# 3. Konfiguration erstellen
cp .env.example .env
# .env Datei mit deinen Werten anpassen

# 4. LibreTranslate starten (Docker)
docker run -d -p 5000:5000 libretranslate/libretranslate

# 5. Starten
npm start
```

## Konfiguration (.env)

| Variable | Beschreibung | Standard |
|---|---|---|
| `AUDIO_DEVICE` | Mikrofon-Gerät | `default` |
| `VOSK_MODEL_PATH` | Pfad zum Vosk-Modell | `./models/vosk-model-small-de-0.15` |
| `LIBRETRANSLATE_URL` | LibreTranslate URL | `http://localhost:5000` |
| `PORT` | Server-Port | `3000` |
| `TWITCH_BOT_USERNAME` | Twitch Bot Name | - |
| `TWITCH_OAUTH_TOKEN` | Twitch OAuth Token | - |
| `TWITCH_CHANNEL` | Dein Twitch-Kanal | - |

### Twitch OAuth Token

1. Gehe zu https://twitchapps.com/tmi/
2. Melde dich mit deinem Bot-Account an
3. Kopiere den Token (Format: `oauth:xxxxxxxxxxxx`)

## Verwendung

### OBS Overlay einrichten

1. In OBS: Quellen → Browser Source hinzufügen
2. URL: `http://localhost:3000/overlay/?lang=en`
3. Breite: 1920, Höhe: 200
4. Benutzerdefiniertes CSS: leer lassen

**URL-Parameter:**
- `?lang=en` - Sprache (z.B. `en`, `fr`, `es`, `ja`)
- `?size=36` - Schriftgröße in Pixel
- `?duration=8000` - Anzeigedauer in Millisekunden
- `?partial=false` - Partielle Ergebnisse ausblenden

### Zuschauer-Befehle (Twitch Chat)

| Befehl | Beschreibung |
|---|---|
| `!lang en` | Sprache auf Englisch setzen |
| `!lang fr` | Sprache auf Französisch setzen |
| `!lang list` | Alle verfügbaren Sprachen anzeigen |
| `!lang off` | Untertitel deaktivieren |
| `!lang` | Hilfe anzeigen |

### Web-Panel für Zuschauer

Zuschauer können auch über den Browser ihre Sprache wählen:
`http://localhost:3000/panel/`

Dort gibt es ein Dropdown-Menü mit allen Sprachen, einen Ein/Aus-Schalter, und einen Verlauf der letzten Untertitel.

## Architektur

```
Mikrofon → Vosk (STT) → Subtitle Manager → LibreTranslate → WebSocket → OBS Overlay
                                                                      → Web Panel
                              Twitch Chat Bot ←→ Subtitle Manager
```

## Unterstützte Sprachen

Englisch, Französisch, Spanisch, Portugiesisch, Italienisch, Niederländisch, Polnisch, Russisch, Ukrainisch, Tschechisch, Dänisch, Schwedisch, Finnisch, Norwegisch, Ungarisch, Rumänisch, Bulgarisch, Griechisch, Türkisch, Arabisch, Hindi, Japanisch, Koreanisch, Chinesisch, Vietnamesisch, Thai, Indonesisch, Hebräisch, Slowakisch, Irisch

## Tipps

- **Bessere Erkennung**: Verwende das große Vosk-Modell (`vosk-model-de-0.21`, ~1.8 GB)
- **Weniger Latenz**: Verwende eine lokale LibreTranslate-Instanz statt einer öffentlichen
- **Audio-Qualität**: Nutze ein dediziertes Mikrofon, nicht das Desktop-Audio
- **Mehrere Overlays**: Du kannst mehrere Browser Sources mit verschiedenen Sprachen in OBS hinzufügen
