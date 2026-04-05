import { WebSocketServer } from 'ws';

let clientIdCounter = 0;

export default function createWebSocketServer(httpServer, subtitleManager) {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws) => {
    const clientId = `ws-${++clientIdCounter}`;
    let clientLang = null;

    console.log(`[WS] Neue Verbindung: ${clientId}`);

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        if (msg.type === 'subscribe') {
          clientLang = msg.lang || 'de';
          subtitleManager.setClientLanguage(clientId, clientLang);

          ws.send(JSON.stringify({
            type: 'subscribed',
            lang: clientLang,
          }));
        }

        if (msg.type === 'unsubscribe') {
          clientLang = null;
          subtitleManager.removeClient(clientId);
          ws.send(JSON.stringify({ type: 'unsubscribed' }));
        }
      } catch (err) {
        console.error(`[WS] Ungültige Nachricht von ${clientId}:`, err.message);
      }
    });

    ws.on('close', () => {
      subtitleManager.removeClient(clientId);
      console.log(`[WS] Verbindung geschlossen: ${clientId}`);
    });

    ws.on('error', (err) => {
      console.error(`[WS] Fehler bei ${clientId}:`, err.message);
    });
  });

  // Untertitel an alle relevanten Clients senden
  subtitleManager.on('subtitle', (data) => {
    for (const client of wss.clients) {
      if (client.readyState !== 1) continue; // OPEN

      // Client-ID aus dem Closure finden - wir speichern es direkt am WS-Objekt
      // Workaround: Wir senden alle Übersetzungen, der Client filtert
      client.send(JSON.stringify({
        type: 'subtitle',
        original: data.original,
        translations: data.translations,
        timestamp: data.timestamp,
      }));
    }
  });

  // Partielle Ergebnisse senden (nur Originalsprache)
  subtitleManager.on('partial', (data) => {
    for (const client of wss.clients) {
      if (client.readyState !== 1) continue;
      client.send(JSON.stringify({
        type: 'partial',
        text: data.text,
        lang: data.lang,
      }));
    }
  });

  console.log('[WS] WebSocket-Server bereit.');
  return wss;
}
