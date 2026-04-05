import tmi from 'tmi.js';
import config from '../config.js';
import SUPPORTED_LANGUAGES, { isValidLanguageCode, getLanguageByCode } from '../translation/languages.js';

export default class TwitchChatBot {
  constructor(subtitleManager) {
    this.subtitleManager = subtitleManager;
    this.client = null;
  }

  start() {
    if (!config.twitch.channel || !config.twitch.oauthToken) {
      console.log('[Twitch] Keine Twitch-Konfiguration gefunden. Chat-Bot deaktiviert.');
      console.log('[Twitch] Setze TWITCH_CHANNEL und TWITCH_OAUTH_TOKEN in .env');
      return this;
    }

    this.client = new tmi.Client({
      options: { debug: false },
      identity: {
        username: config.twitch.botUsername,
        password: config.twitch.oauthToken,
      },
      channels: [config.twitch.channel],
    });

    this.client.on('message', (channel, tags, message, self) => {
      if (self) return;
      this._handleMessage(channel, tags, message);
    });

    this.client.on('connected', () => {
      console.log(`[Twitch] Bot verbunden mit #${config.twitch.channel}`);
    });

    this.client.on('disconnected', (reason) => {
      console.log(`[Twitch] Bot getrennt: ${reason}`);
    });

    this.client.connect().catch((err) => {
      console.error('[Twitch] Verbindungsfehler:', err.message);
    });

    return this;
  }

  _handleMessage(channel, tags, message) {
    const text = message.trim().toLowerCase();
    const username = tags['display-name'] || tags.username;

    if (!text.startsWith('!lang')) return;

    const parts = text.split(/\s+/);
    const command = parts[1];

    // !lang (ohne Argument) - Hilfe anzeigen
    if (!command) {
      this.client.say(channel,
        `@${username} Benutze !lang <code> um deine Sprache zu wählen. ` +
        `!lang list für alle Sprachen. !lang off zum Deaktivieren. ` +
        `Beispiel: !lang en für Englisch.`
      );
      return;
    }

    // !lang list - Alle Sprachen auflisten
    if (command === 'list') {
      const langList = SUPPORTED_LANGUAGES
        .slice(0, 15)
        .map(l => `${l.code}=${l.name}`)
        .join(', ');
      this.client.say(channel,
        `@${username} Verfügbare Sprachen: ${langList} ... und mehr! ` +
        `Vollständige Liste: http://localhost:${config.server.port}/panel`
      );
      return;
    }

    // !lang off - Untertitel deaktivieren
    if (command === 'off') {
      this.subtitleManager.setChatLanguage(username, null);
      this.client.say(channel, `@${username} Untertitel deaktiviert.`);
      return;
    }

    // !lang <code> - Sprache setzen
    if (isValidLanguageCode(command)) {
      this.subtitleManager.setChatLanguage(username, command);
      const lang = getLanguageByCode(command);
      this.client.say(channel,
        `@${username} Sprache gesetzt: ${lang.name} (${lang.native}). ` +
        `Schau die Untertitel hier: http://localhost:${config.server.port}/panel?lang=${command}`
      );
      return;
    }

    this.client.say(channel,
      `@${username} Unbekannte Sprache "${command}". Benutze !lang list für alle verfügbaren Sprachen.`
    );
  }

  stop() {
    if (this.client) {
      this.client.disconnect();
      console.log('[Twitch] Bot gestoppt.');
    }
  }
}
