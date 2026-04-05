import { createServer } from 'http';
import config from './config.js';
import AudioCapture from './audio/capture.js';
import VoskEngine from './stt/vosk-engine.js';
import Translator from './translation/translator.js';
import SubtitleManager from './subtitles/manager.js';
import createHttpServer from './server/http-server.js';
import createWebSocketServer from './server/websocket-server.js';
import TwitchChatBot from './twitch/chat-bot.js';

console.log('===========================================');
console.log('  Twitch Live Subtitles');
console.log('  Echtzeit-Übersetzung für deinen Stream');
console.log('===========================================');
console.log('');

// 1. Übersetzer initialisieren
const translator = new Translator();
console.log(`[Init] LibreTranslate: ${config.translation.url}`);

const translationOk = await translator.checkHealth();
if (!translationOk) {
  console.warn('[Init] WARNUNG: LibreTranslate ist nicht erreichbar!');
  console.warn(`[Init] Stelle sicher, dass LibreTranslate unter ${config.translation.url} läuft.`);
  console.warn('[Init] Docker: docker run -d -p 5000:5000 libretranslate/libretranslate');
  console.warn('[Init] Fahre trotzdem fort (Übersetzungen werden fehlschlagen)...');
}

// 2. Subtitle Manager
const subtitleManager = new SubtitleManager(translator);

// 3. HTTP- und WebSocket-Server starten
const app = createHttpServer(subtitleManager);
const httpServer = createServer(app);
createWebSocketServer(httpServer, subtitleManager);

httpServer.listen(config.server.port, config.server.host, () => {
  console.log('');
  console.log(`[Server] Läuft auf http://${config.server.host}:${config.server.port}`);
  console.log('');
  console.log('  URLs:');
  console.log(`  OBS Overlay:    http://localhost:${config.server.port}/overlay/?lang=en`);
  console.log(`  Viewer Panel:   http://localhost:${config.server.port}/panel/`);
  console.log(`  API Sprachen:   http://localhost:${config.server.port}/api/languages`);
  console.log(`  API Stats:      http://localhost:${config.server.port}/api/stats`);
  console.log('');
});

// 4. Twitch Chat Bot starten
const chatBot = new TwitchChatBot(subtitleManager);
chatBot.start();

// 5. Speech-to-Text Engine initialisieren
const sttEngine = new VoskEngine();
try {
  sttEngine.init();
} catch (err) {
  console.error(`[Init] ${err.message}`);
  console.error('[Init] Das Programm kann ohne Vosk-Modell nicht starten.');
  console.error('[Init] Bitte lade das Modell herunter: npm run download-model');
  process.exit(1);
}

// 6. STT Events mit Subtitle Manager verbinden
sttEngine.on('final', (text) => {
  console.log(`[STT] "${text}"`);
  subtitleManager.handleTranscript(text, false);
});

sttEngine.on('partial', (text) => {
  subtitleManager.handleTranscript(text, true);
});

// 7. Audio-Aufnahme starten und mit STT verbinden
const audioCapture = new AudioCapture();
audioCapture.on('audio', (buffer) => {
  sttEngine.processAudio(buffer);
});

audioCapture.on('error', (err) => {
  console.error('[Audio] Fehler:', err.message);
});

audioCapture.start();

console.log('');
console.log('[Ready] System bereit! Sprich ins Mikrofon...');
console.log('[Ready] Zuschauer können im Chat !lang <code> eingeben.');
console.log('');

// Graceful Shutdown
function shutdown() {
  console.log('\n[Shutdown] Beende...');
  audioCapture.stop();
  sttEngine.flush();
  sttEngine.destroy();
  chatBot.stop();
  httpServer.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
