import { EventEmitter } from 'events';
import vosk from 'vosk';
import { existsSync } from 'fs';
import config from '../config.js';

export default class VoskEngine extends EventEmitter {
  constructor() {
    super();
    this.model = null;
    this.recognizer = null;
  }

  init() {
    const modelPath = config.vosk.modelPath;

    if (!existsSync(modelPath)) {
      throw new Error(
        `Vosk-Modell nicht gefunden: ${modelPath}\n` +
        'Bitte lade das Modell herunter mit: npm run download-model'
      );
    }

    console.log(`[STT] Lade Vosk-Modell: ${modelPath}`);
    vosk.setLogLevel(-1);

    this.model = new vosk.Model(modelPath);
    this.recognizer = new vosk.Recognizer({
      model: this.model,
      sampleRate: config.audio.sampleRate,
    });

    console.log('[STT] Vosk-Modell geladen und bereit.');
    return this;
  }

  processAudio(buffer) {
    if (!this.recognizer) {
      throw new Error('VoskEngine wurde nicht initialisiert. Rufe init() auf.');
    }

    const endOfSpeech = this.recognizer.acceptWaveform(buffer);

    if (endOfSpeech) {
      const result = JSON.parse(this.recognizer.resultString());
      if (result.text && result.text.trim().length > 0) {
        this.emit('final', result.text.trim());
      }
    } else {
      const partial = JSON.parse(this.recognizer.partialResultString());
      if (partial.partial && partial.partial.trim().length > 0) {
        this.emit('partial', partial.partial.trim());
      }
    }
  }

  flush() {
    if (this.recognizer) {
      const result = JSON.parse(this.recognizer.finalResultString());
      if (result.text && result.text.trim().length > 0) {
        this.emit('final', result.text.trim());
      }
    }
  }

  destroy() {
    if (this.recognizer) {
      this.recognizer.free();
      this.recognizer = null;
    }
    if (this.model) {
      this.model.free();
      this.model = null;
    }
    console.log('[STT] Vosk-Engine beendet.');
  }
}
