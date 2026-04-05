import { EventEmitter } from 'events';
import record from 'node-record-lpcm16';
import config from '../config.js';

export default class AudioCapture extends EventEmitter {
  constructor() {
    super();
    this.recording = null;
  }

  start() {
    console.log('[Audio] Starte Mikrofon-Aufnahme...');
    console.log(`[Audio] Gerät: ${config.audio.device}, Sample Rate: ${config.audio.sampleRate} Hz`);

    this.recording = record.record({
      sampleRate: config.audio.sampleRate,
      channels: 1,
      audioType: 'raw',
      recorder: 'sox',
      device: config.audio.device !== 'default' ? config.audio.device : undefined,
      silence: 0,
      threshold: 0,
    });

    const stream = this.recording.stream();

    stream.on('data', (chunk) => {
      this.emit('audio', chunk);
    });

    stream.on('error', (err) => {
      console.error('[Audio] Fehler bei der Aufnahme:', err.message);
      this.emit('error', err);
    });

    stream.on('end', () => {
      console.log('[Audio] Aufnahme beendet.');
      this.emit('end');
    });

    console.log('[Audio] Mikrofon aktiv - Aufnahme läuft.');
    return this;
  }

  stop() {
    if (this.recording) {
      this.recording.stop();
      this.recording = null;
      console.log('[Audio] Mikrofon gestoppt.');
    }
  }
}
