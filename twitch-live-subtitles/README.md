# Twitch Live Subtitles

Echtzeit-Übersetzung deiner Sprache als Untertitel für Twitch-Streams. Sprich Deutsch, und deine Zuschauer sehen Untertitel in ihrer gewählten Sprache.

## Features

- **Echtzeit-Spracherkennung** - Vosk erkennt dein Deutsch offline und ohne Cloud
- **30+ Sprachen** - Englisch, Französisch, Spanisch, Japanisch, Koreanisch, Chinesisch, und viele mehr
- **OBS Overlay** - Browser Source mit animierten Untertiteln
- **Twitch Chat-Befehle** - Zuschauer wählen ihre Sprache mit `!lang en`
- **Web-Panel** - Zuschauer können auch über eine Webseite ihre Sprache wählen
- **Untertitel deaktivierbar** - Zuschauer können Untertitel jederzeit ausschalten
- **Windows, macOS & Linux** - Läuft auf allen Plattformen

---

## Windows-Installation (Schritt für Schritt)

### 1. Voraussetzungen installieren

#### Node.js (erforderlich)
1. Gehe zu **https://nodejs.org**
2. Lade die **LTS-Version** (empfohlen) herunter
3. Installiere mit Standardeinstellungen (alle Haken gesetzt lassen)
4. Prüfe danach in **PowerShell** oder **Eingabeaufforderung**:
   ```
   node --version
   npm --version
   ```

#### SoX - Sound eXchange (erforderlich für Mikrofon-Aufnahme)

**Option A: Installer (empfohlen)**
1. Gehe zu **https://sourceforge.net/projects/sox/files/sox/**
2. Lade die neueste `.exe`-Datei herunter (z.B. `sox-14.4.2-win32.exe`)
3. Installiere und wähle **"Add to PATH"**
4. **PC neu starten** (damit PATH wirksam wird)

**Option B: Über Paketmanager**
```powershell
# Mit winget (Windows 11 / Windows 10 mit winget):
winget install sox

# Oder mit Chocolatey (falls installiert):
choco install sox.portable
```

Prüfe nach Installation:
```
sox --version
```

#### Docker Desktop (erforderlich für LibreTranslate)
1. Gehe zu **https://www.docker.com/products/docker-desktop/**
2. Lade Docker Desktop für Windows herunter
3. Installiere und starte Docker Desktop
4. Warte bis Docker Desktop "Running" anzeigt (grünes Symbol unten links)

#### Git (optional, zum Klonen des Repos)
```
winget install Git.Git
```

### 2. Projekt herunterladen

**Option A: Mit Git**
```powershell
git clone https://github.com/PTRZ95/claude-code.git
cd claude-code/twitch-live-subtitles
```

**Option B: Als ZIP**
1. Repository als ZIP herunterladen
2. Entpacken
3. In den Ordner `twitch-live-subtitles` navigieren

### 3. Schnell-Setup (automatisch)

Doppelklick auf `setup.bat` im Projektordner, oder in der Eingabeaufforderung:

```cmd
setup.bat
```

Das Script macht automatisch:
- npm install
- Vosk-Modell herunterladen
- .env aus Vorlage erstellen
- LibreTranslate in Docker starten
- Konfiguration prüfen

### 4. Manuelles Setup (alternativ)

```powershell
# Im Ordner twitch-live-subtitles:

# Dependencies installieren
npm install

# Vosk Deutsch-Modell herunterladen (~50 MB)
npm run download-model

# Konfiguration erstellen
copy .env.example .env
# .env Datei mit Notepad oder Editor öffnen und anpassen

# LibreTranslate starten (Docker muss laufen!)
docker run -d -p 5000:5000 libretranslate/libretranslate

# Tool starten
npm start
```

### 5. Konfiguration anpassen (.env)

Öffne die Datei `.env` mit einem Texteditor (z.B. Notepad, VS Code):

```env
# Twitch-Einstellungen - DIESE MUSST DU ANPASSEN:
TWITCH_BOT_USERNAME=dein_bot_name
TWITCH_OAUTH_TOKEN=oauth:dein_token_hier
TWITCH_CHANNEL=dein_kanal_name

# Den Rest kannst du erstmal so lassen
```

### 6. Starten

```cmd
npm start
```

Du siehst dann:
```
===========================================
  Twitch Live Subtitles
  Echtzeit-Übersetzung für deinen Stream
===========================================

[Server] Läuft auf http://0.0.0.0:3000

  URLs:
  OBS Overlay:    http://localhost:3000/overlay/?lang=en
  Viewer Panel:   http://localhost:3000/panel/
```

---

## Linux/macOS-Installation

### Voraussetzungen

- **Node.js** 18+: `sudo apt install nodejs npm` / `brew install node`
- **SoX**: `sudo apt install sox` / `brew install sox`
- **Docker**: `sudo apt install docker.io` / `brew install --cask docker`

### Installation

```bash
cd twitch-live-subtitles
npm install
npm run download-model
cp .env.example .env
# .env anpassen
docker run -d -p 5000:5000 libretranslate/libretranslate
npm start
```

---

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

### Twitch OAuth Token erstellen

1. Gehe zu **https://twitchapps.com/tmi/**
2. Melde dich mit deinem Bot-Account an (oder deinem Haupt-Account)
3. Klicke "Connect"
4. Kopiere den Token (Format: `oauth:xxxxxxxxxxxx`)
5. Füge ihn in `.env` bei `TWITCH_OAUTH_TOKEN` ein

## Verwendung

### OBS Overlay einrichten

1. In OBS: **Quellen** -> **+** -> **Browser** (Browser Source hinzufügen)
2. URL: `http://localhost:3000/overlay/?lang=en`
3. Breite: **1920**, Höhe: **200**
4. Benutzerdefiniertes CSS: leer lassen
5. Position: An den unteren Rand des Streams ziehen

**URL-Parameter (anpassbar):**
- `?lang=en` - Sprache (z.B. `en`, `fr`, `es`, `ja`)
- `?size=36` - Schriftgröße in Pixel
- `?duration=8000` - Anzeigedauer in Millisekunden
- `?partial=false` - Partielle Ergebnisse ausblenden

### Zuschauer-Befehle (Twitch Chat)

| Befehl | Beschreibung |
|---|---|
| `!lang en` | Sprache auf Englisch setzen |
| `!lang fr` | Sprache auf Französisch setzen |
| `!lang ja` | Sprache auf Japanisch setzen |
| `!lang list` | Alle verfügbaren Sprachen anzeigen |
| `!lang off` | Untertitel deaktivieren |
| `!lang` | Hilfe anzeigen |

### Web-Panel für Zuschauer

Zuschauer können auch über den Browser ihre Sprache wählen:
`http://localhost:3000/panel/`

Dort gibt es ein Dropdown-Menü mit allen Sprachen, einen Ein/Aus-Schalter, und einen Verlauf der letzten Untertitel.

## Architektur

```
Mikrofon -> Vosk (STT) -> Subtitle Manager -> LibreTranslate -> WebSocket -> OBS Overlay
                                                                          -> Web Panel
                              Twitch Chat Bot <-> Subtitle Manager
```

## Unterstützte Sprachen

Englisch, Französisch, Spanisch, Portugiesisch, Italienisch, Niederländisch, Polnisch, Russisch, Ukrainisch, Tschechisch, Dänisch, Schwedisch, Finnisch, Norwegisch, Ungarisch, Rumänisch, Bulgarisch, Griechisch, Türkisch, Arabisch, Hindi, Japanisch, Koreanisch, Chinesisch, Vietnamesisch, Thai, Indonesisch, Hebräisch, Slowakisch, Irisch

## Problemlösung (Windows)

### "sox" wird nicht erkannt
- SoX neu installieren mit **"Add to PATH"**
- Oder manuell zum PATH hinzufügen: Systemsteuerung -> System -> Erweiterte Systemeinstellungen -> Umgebungsvariablen -> Path -> den SoX-Installationspfad hinzufügen
- **PC neu starten** nach PATH-Änderung

### "docker" wird nicht erkannt
- Docker Desktop starten und warten bis es "Running" anzeigt
- Falls gerade erst installiert: PC neu starten

### Mikrofon wird nicht erkannt
- Windows-Einstellungen -> System -> Sound -> Eingabe prüfen
- Mikrofon muss als Standard-Eingabegerät gesetzt sein
- In `.env` kannst du ein spezifisches Gerät angeben: `AUDIO_DEVICE=Mikrofon (USB Audio)`

### LibreTranslate startet nicht / Übersetzung schlägt fehl
- Prüfe ob Docker läuft: `docker ps`
- Container neustarten: `docker restart <container-id>`
- Erster Start dauert länger (Modelle werden heruntergeladen)

### Port 3000 bereits belegt
- In `.env` den Port ändern: `PORT=3001`
- Oder den Prozess auf Port 3000 beenden: `netstat -ano | findstr :3000`

## Tipps

- **Bessere Erkennung**: Verwende das große Vosk-Modell (`vosk-model-de-0.21`, ~1.8 GB)
- **Weniger Latenz**: Verwende eine lokale LibreTranslate-Instanz statt einer öffentlichen
- **Audio-Qualität**: Nutze ein dediziertes Mikrofon, nicht das Desktop-Audio
- **Mehrere Overlays**: Du kannst mehrere Browser Sources mit verschiedenen Sprachen in OBS hinzufügen
