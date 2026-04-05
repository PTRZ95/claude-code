import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

dotenvConfig({ path: resolve(projectRoot, '.env') });

const config = {
  audio: {
    device: process.env.AUDIO_DEVICE || 'default',
    sampleRate: parseInt(process.env.SAMPLE_RATE, 10) || 16000,
  },

  vosk: {
    modelPath: resolve(projectRoot, process.env.VOSK_MODEL_PATH || './models/vosk-model-small-de-0.15'),
    sourceLanguage: process.env.SOURCE_LANGUAGE || 'de',
  },

  translation: {
    url: process.env.LIBRETRANSLATE_URL || 'http://localhost:5000',
    apiKey: process.env.LIBRETRANSLATE_API_KEY || '',
  },

  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
    host: process.env.HOST || '0.0.0.0',
  },

  twitch: {
    botUsername: process.env.TWITCH_BOT_USERNAME || '',
    oauthToken: process.env.TWITCH_OAUTH_TOKEN || '',
    channel: process.env.TWITCH_CHANNEL || '',
  },

  subtitles: {
    displayDuration: parseInt(process.env.SUBTITLE_DISPLAY_DURATION_MS, 10) || 6000,
    maxLength: parseInt(process.env.MAX_SUBTITLE_LENGTH, 10) || 250,
  },

  projectRoot,
};

export default config;
