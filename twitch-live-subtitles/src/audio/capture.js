import { EventEmitter } from 'events';
import record from 'node-record-lpcm16';
import { execSync } from 'child_process';
import config from '../config.js';

function detectRecorder() {
  const platform = process.platform;

  if (platform === 'win32') {
    // Windows: SoX muss installiert sein
    try {
      execSync('sox --version', { stdio: 'ignore' });
      console.log('[Audio] SoX gefunden (Windows).');
      return 'sox';
    } catch {
      console.error('[Audio] FEHLER: SoX nicht gefunden!');
      console.error('[Audio] Bitte SoX installieren:');
      console.error('[Audio]   1. https://sourceforge.net/projects/sox/files/sox/ herunterladen');
      console.error('[Audio]   2. Installieren und "Add to PATH" waehlen');
      console.error('[Audio]   ODER: winget install sox');
      console.error('[Audio]   ODER: choco install sox.portable');
      throw new Error('SoX nicht installiert. Siehe Anleitung oben.');
    }
  }

  if (platform === 'darwin') {
    // macOS: sox oder rec
    try {
      execSync('sox --version', { stdio: 'ignore' });
      return 'sox';
    } catch {
      console.error('[Audio] SoX nicht gefunden. Installiere mit: brew install sox');
      throw new Error('SoX nicht installiert.');
    }
  }

  // Linux: arecord (ALSA) oder sox
  try {
    execSync('arecord --version', { stdio: 'ignore' });
    return 'arecord';
  } catch {
    try {
      execSync('sox --version', { stdio: 'ignore' });
      return 'sox';
    } catch {
      console.error('[Audio] Weder arecord noch SoX gefunden.');
      console.error('[Audio] Installiere mit: sudo apt install sox alsa-utils');
      throw new Error('Kein Audio-Recorder gefunden.');
    }
  }
}

export default class AudioCapture extends EventEmitter {
  constructor() {
    super();
    this.recording = null;
  }

  start() {
    const recorder = detectRecorder();

    console.log(`[Audio] Starte Mikrofon-Aufnahme (${recorder})...`);
    console.log(`[Audio] Geraet: ${config.audio.device}, Sample Rate: ${config.audio.sampleRate} Hz`);
    console.log(`[Audio] Plattform: ${process.platform}`);

    const recordOptions = {
      sampleRate: config.audio.sampleRate,
      channels: 1,
      audioType: 'raw',
      recorder: recorder,
      silence: 0,
      threshold: 0,
    };

    // Device nur setzen wenn nicht "default"
    if (config.audio.device !== 'default') {
      recordOptions.device = config.audio.device;
    }

    this.recording = record.record(recordOptions);

    const stream = this.recording.stream();

    stream.on('data', (chunk) => {
      this.emit('audio', chunk);
    });

    stream.on('error', (err) => {
      console.error('[Audio] Fehler bei der Aufnahme:', err.message);
      if (process.platform === 'win32') {
        console.error('[Audio] Windows-Tipp: Stelle sicher, dass SoX im PATH ist');
        console.error('[Audio] und dein Mikrofon in den Windows-Soundeinstellungen aktiv ist.');
      }
      this.emit('error', err);
    });

    stream.on('end', () => {
      console.log('[Audio] Aufnahme beendet.');
      this.emit('end');
    });

    console.log('[Audio] Mikrofon aktiv - Aufnahme laeuft.');
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
