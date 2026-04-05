import { EventEmitter } from 'events';
import config from '../config.js';

export default class SubtitleManager extends EventEmitter {
  constructor(translator) {
    super();
    this.translator = translator;
    // Map<clientId, languageCode>
    this.clientLanguages = new Map();
    // Map<twitchUsername, languageCode>
    this.chatLanguages = new Map();
  }

  setClientLanguage(clientId, langCode) {
    if (langCode === 'off' || !langCode) {
      this.clientLanguages.delete(clientId);
    } else {
      this.clientLanguages.set(clientId, langCode);
    }
    console.log(`[Subtitles] Client ${clientId} -> ${langCode || 'deaktiviert'} (${this.clientLanguages.size} aktive Clients)`);
  }

  removeClient(clientId) {
    this.clientLanguages.delete(clientId);
  }

  setChatLanguage(username, langCode) {
    if (langCode === 'off' || !langCode) {
      this.chatLanguages.delete(username);
    } else {
      this.chatLanguages.set(username, langCode);
    }
  }

  getActiveLanguages() {
    const langs = new Set();
    for (const lang of this.clientLanguages.values()) {
      langs.add(lang);
    }
    for (const lang of this.chatLanguages.values()) {
      langs.add(lang);
    }
    // Immer Deutsch (Original) dabei
    langs.add(config.vosk.sourceLanguage);
    return [...langs];
  }

  getLanguageStats() {
    const stats = {};
    for (const lang of this.clientLanguages.values()) {
      stats[lang] = (stats[lang] || 0) + 1;
    }
    return stats;
  }

  async handleTranscript(text, isPartial = false) {
    if (isPartial) {
      this.emit('partial', {
        text,
        lang: config.vosk.sourceLanguage,
      });
      return;
    }

    // Text kürzen falls nötig
    const trimmed = text.length > config.subtitles.maxLength
      ? text.substring(0, config.subtitles.maxLength) + '...'
      : text;

    const activeLanguages = this.getActiveLanguages();

    // Nur übersetzen wenn es Sprachen gibt, die nicht die Quellsprache sind
    const targetLanguages = activeLanguages.filter(
      lang => lang !== config.vosk.sourceLanguage
    );

    let translations = { [config.vosk.sourceLanguage]: trimmed };

    if (targetLanguages.length > 0) {
      try {
        const results = await this.translator.translateBatch(
          trimmed,
          targetLanguages,
          config.vosk.sourceLanguage
        );
        translations = { ...translations, ...results };
      } catch (err) {
        console.error('[Subtitles] Übersetzungsfehler:', err.message);
      }
    }

    this.emit('subtitle', {
      original: trimmed,
      translations,
      timestamp: Date.now(),
    });
  }
}
