// Plattformunabhaengiges Vosk Modell Download-Script (Node.js)
// Funktioniert auf Windows, macOS und Linux

import { existsSync, mkdirSync, createWriteStream, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectDir = join(__dirname, '..');
const modelsDir = join(projectDir, 'models');

const MODEL_NAME = 'vosk-model-small-de-0.15';
const MODEL_URL = `https://alphacephei.com/vosk/models/${MODEL_NAME}.zip`;
const zipPath = join(modelsDir, `${MODEL_NAME}.zip`);
const modelPath = join(modelsDir, MODEL_NAME);

console.log('============================================');
console.log('  Vosk Deutsch-Modell Downloader');
console.log('============================================');
console.log('');

// Models-Verzeichnis erstellen
if (!existsSync(modelsDir)) {
  mkdirSync(modelsDir, { recursive: true });
}

// Prüfen ob Modell schon existiert
if (existsSync(modelPath)) {
  console.log(`Modell bereits vorhanden: ${modelPath}`);
  console.log('Zum erneuten Herunterladen erst den Ordner loeschen.');
  process.exit(0);
}

console.log(`Lade Modell herunter: ${MODEL_NAME}`);
console.log(`URL: ${MODEL_URL}`);
console.log(`Ziel: ${modelsDir}`);
console.log('');

// Download mit Fortschritt
function download(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    const request = client.get(url, (response) => {
      // Redirect folgen
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        console.log('Redirect...');
        download(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Download fehlgeschlagen: HTTP ${response.statusCode}`));
        return;
      }

      const totalBytes = parseInt(response.headers['content-length'], 10) || 0;
      let downloadedBytes = 0;
      let lastPercent = -1;

      const file = createWriteStream(dest);

      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        if (totalBytes > 0) {
          const percent = Math.floor((downloadedBytes / totalBytes) * 100);
          if (percent !== lastPercent && percent % 5 === 0) {
            const mb = (downloadedBytes / 1024 / 1024).toFixed(1);
            const totalMb = (totalBytes / 1024 / 1024).toFixed(1);
            process.stdout.write(`\r  Download: ${mb} / ${totalMb} MB (${percent}%)`);
            lastPercent = percent;
          }
        }
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log('\n  Download abgeschlossen!');
        resolve();
      });

      file.on('error', (err) => {
        unlinkSync(dest);
        reject(err);
      });
    });

    request.on('error', reject);
    request.setTimeout(60000, () => {
      request.destroy();
      reject(new Error('Download Timeout (60s)'));
    });
  });
}

// Entpacken - plattformabhaengig
function unzip(zipFile, destDir) {
  console.log('');
  console.log('Entpacke Modell...');

  const platform = process.platform;

  if (platform === 'win32') {
    // Windows: PowerShell Expand-Archive
    execSync(
      `powershell -Command "Expand-Archive -Path '${zipFile}' -DestinationPath '${destDir}' -Force"`,
      { stdio: 'inherit' }
    );
  } else {
    // Linux/macOS: unzip
    execSync(`unzip -q "${zipFile}" -d "${destDir}"`, { stdio: 'inherit' });
  }

  // ZIP loeschen
  unlinkSync(zipFile);
}

// Hauptprogramm
try {
  await download(MODEL_URL, zipPath);
  unzip(zipPath, modelsDir);

  console.log('');
  console.log(`Fertig! Modell installiert: ${modelPath}`);
  console.log('');
  console.log('Fuer bessere Erkennungsqualitaet das grosse Modell verwenden:');
  console.log('  https://alphacephei.com/vosk/models');
  console.log('  -> vosk-model-de-0.21 (~1.8 GB)');
} catch (err) {
  console.error('');
  console.error(`FEHLER: ${err.message}`);
  console.error('');
  console.error('Alternativ manuell herunterladen:');
  console.error(`  ${MODEL_URL}`);
  console.error(`  Entpacken nach: ${modelsDir}`);
  process.exit(1);
}
