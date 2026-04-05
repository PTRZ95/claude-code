# Twitch Bits Keyboard Extension

Zuschauer koennen fuer **100 Bits** eine Taste auf dem PC des Streamers druecken, um ihn zu stoeren (z.B. R zum Nachladen, ESC fuer Menue, Space zum Springen).

## Architektur

```
Zuschauer (Twitch Extension Panel)
        |
        | Bits-Transaktion + Tastenwahl
        v
  Backend Server (EBS)
        |
        | WebSocket
        v
  Desktop Client (auf Streamer-PC)
        |
        | robotjs keyTap()
        v
  Spiel / Anwendung
```

## Komponenten

### 1. Extension (Frontend)
Das Twitch Extension Panel, das Zuschauer im Chat-Bereich sehen.

- `extension/index.html` - Haupt-HTML
- `extension/style.css` - Styling (Twitch-Dark-Theme)
- `extension/config.js` - Konfiguration (Tasten, Kosten, Cooldown)
- `extension/app.js` - Logik (Bits API, Backend-Kommunikation)

### 2. Backend Server (EBS)
Node.js Server, der Bits-Transaktionen validiert und an den Desktop-Client weiterleitet.

### 3. Desktop Client
Laeuft auf dem PC des Streamers, empfaengt Tastendruecke via WebSocket und simuliert sie mit `robotjs`.

## Setup

### Backend starten

```bash
cd backend
npm install
cp .env.example .env
# .env Datei mit deinen Twitch-Extension-Daten ausfuellen
node server.js
```

### Desktop Client starten

```bash
cd desktop-client
npm install
cp .env.example .env
# .env Datei anpassen (Token muss mit Backend uebereinstimmen)
node client.js
```

### Twitch Extension einrichten

1. Gehe zu https://dev.twitch.tv/console/extensions
2. Erstelle eine neue Extension (Typ: Panel)
3. Lade die Dateien aus `extension/` hoch
4. Trage die Backend-URL in `extension/config.js` ein
5. Aktiviere Bits-Support in den Extension-Einstellungen
6. Installiere die Extension auf deinem Kanal

## Konfiguration

### Tasten anpassen (`extension/config.js`)

Du kannst Tasten hinzufuegen, entfernen oder aendern:

```javascript
{ id: "r", key: "r", icon: "icon", label: "R", desc: "Nachladen" }
```

**Wichtig:** Neue Tasten muessen auch in der `ALLOWED_KEYS`-Whitelist im Backend (`backend/server.js`) eingetragen werden.

### Cooldown aendern

- Frontend: `globalCooldownSeconds` in `config.js`
- Backend: `GLOBAL_COOLDOWN_MS` in `server.js`

## Sicherheit

- JWT-Verifizierung aller Anfragen vom Twitch-Frontend
- Tasten-Whitelist im Backend (nur erlaubte Tasten werden akzeptiert)
- Desktop-Client-Authentifizierung via Token
- Globaler Cooldown gegen Spam
- Keine Modifier-Tasten (Ctrl, Alt, Shift) erlaubt
