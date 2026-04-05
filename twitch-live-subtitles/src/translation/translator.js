import fetch from 'node-fetch';
import config from '../config.js';

const CACHE_MAX_SIZE = 500;

export default class Translator {
  constructor() {
    this.cache = new Map();
  }

  _cacheKey(text, targetLang) {
    return `${targetLang}:${text}`;
  }

  _evictCache() {
    if (this.cache.size > CACHE_MAX_SIZE) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  async translate(text, targetLang, sourceLang = 'de') {
    const key = this._cacheKey(text, targetLang);
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const body = {
      q: text,
      source: sourceLang,
      target: targetLang,
      format: 'text',
    };

    if (config.translation.apiKey) {
      body.api_key = config.translation.apiKey;
    }

    const response = await fetch(`${config.translation.url}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LibreTranslate Fehler (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const translated = data.translatedText;

    this.cache.set(key, translated);
    this._evictCache();

    return translated;
  }

  async translateBatch(text, targetLanguages, sourceLang = 'de') {
    const results = {};

    const translations = await Promise.allSettled(
      targetLanguages.map(async (lang) => {
        const translated = await this.translate(text, lang, sourceLang);
        return { lang, translated };
      })
    );

    for (const result of translations) {
      if (result.status === 'fulfilled') {
        results[result.value.lang] = result.value.translated;
      } else {
        console.error(`[Translation] Fehler:`, result.reason.message);
      }
    }

    // Das Original (Deutsch) immer mitliefern
    results[sourceLang] = text;

    return results;
  }

  async checkHealth() {
    try {
      const response = await fetch(`${config.translation.url}/languages`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
