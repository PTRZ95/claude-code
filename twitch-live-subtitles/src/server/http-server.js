import express from 'express';
import { resolve } from 'path';
import config from '../config.js';
import SUPPORTED_LANGUAGES from '../translation/languages.js';

export default function createHttpServer(subtitleManager) {
  const app = express();

  // Statische Dateien für Overlay und Panel
  app.use('/overlay', express.static(resolve(config.projectRoot, 'overlay')));
  app.use('/panel', express.static(resolve(config.projectRoot, 'panel')));

  // API: Verfügbare Sprachen
  app.get('/api/languages', (_req, res) => {
    res.json({
      source: config.vosk.sourceLanguage,
      languages: SUPPORTED_LANGUAGES,
    });
  });

  // API: Aktuelle Statistiken
  app.get('/api/stats', (_req, res) => {
    res.json({
      activeLanguages: subtitleManager.getActiveLanguages(),
      viewerStats: subtitleManager.getLanguageStats(),
      totalClients: subtitleManager.clientLanguages.size,
    });
  });

  // Health Check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  return app;
}
