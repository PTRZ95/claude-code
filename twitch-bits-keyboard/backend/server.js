const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { WebSocketServer } = require("ws");
const http = require("http");

// --- Konfiguration ---
const PORT = process.env.PORT || 3000;
const EXTENSION_SECRET = Buffer.from(
  process.env.TWITCH_EXTENSION_SECRET || "",
  "base64"
);
const CLIENT_ID = process.env.TWITCH_EXTENSION_CLIENT_ID || "";
const OWNER_ID = process.env.TWITCH_OWNER_ID || "";
const DESKTOP_TOKEN = process.env.DESKTOP_CLIENT_TOKEN || "changeme";

// Erlaubte Tasten (Whitelist)
const ALLOWED_KEYS = new Set([
  "r", "Escape", "space", "Tab", "e", "q", "f", "g", "m",
]);

// Rate-Limit: max 1 Tastendruck pro 5 Sekunden global
let lastKeypressTime = 0;
const GLOBAL_COOLDOWN_MS = 5000;

// --- Express + HTTP Server ---
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// --- WebSocket Server fuer Desktop-Client ---
const wss = new WebSocketServer({ server, path: "/ws" });
const desktopClients = new Set();

wss.on("connection", function (ws, req) {
  // Desktop-Client muss sich mit Token authentifizieren
  const url = new URL(req.url, "http://localhost");
  const clientToken = url.searchParams.get("token");

  if (clientToken !== DESKTOP_TOKEN) {
    console.log("[WS] Unautorisierter Verbindungsversuch abgelehnt.");
    ws.close(4001, "Unauthorized");
    return;
  }

  console.log("[WS] Desktop-Client verbunden.");
  desktopClients.add(ws);

  ws.on("close", function () {
    console.log("[WS] Desktop-Client getrennt.");
    desktopClients.delete(ws);
  });

  ws.on("message", function (msg) {
    console.log("[WS] Nachricht vom Client:", msg.toString());
  });

  // Willkommensnachricht
  ws.send(JSON.stringify({ type: "connected", message: "Verbunden mit EBS" }));
});

// --- JWT-Verifizierung ---
function verifyTwitchToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Kein Token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, EXTENSION_SECRET);
    req.twitchUser = decoded;
    next();
  } catch (err) {
    console.error("[Auth] Token ungueltig:", err.message);
    return res.status(401).json({ success: false, error: "Token ungueltig" });
  }
}

// --- API Endpunkte ---

// Health-Check
app.get("/api/health", function (_req, res) {
  res.json({
    status: "ok",
    desktopConnected: desktopClients.size > 0,
  });
});

// Tastendruck empfangen
app.post("/api/keypress", verifyTwitchToken, function (req, res) {
  const { key, keyId, label, transactionId, userId } = req.body;

  // Validierung
  if (!key || !ALLOWED_KEYS.has(key)) {
    return res.status(400).json({ success: false, error: "Ungueltige Taste" });
  }

  if (!transactionId) {
    return res.status(400).json({ success: false, error: "Keine Transaktions-ID" });
  }

  // Globaler Cooldown
  const now = Date.now();
  if (now - lastKeypressTime < GLOBAL_COOLDOWN_MS) {
    return res.status(429).json({ success: false, error: "Cooldown aktiv" });
  }
  lastKeypressTime = now;

  // Kein Desktop-Client verbunden?
  if (desktopClients.size === 0) {
    return res.status(503).json({
      success: false,
      error: "Streamer-Client nicht verbunden",
    });
  }

  // Tastendruck an alle Desktop-Clients senden
  const payload = JSON.stringify({
    type: "keypress",
    key: key,
    keyId: keyId,
    label: label,
    userId: userId,
    transactionId: transactionId,
    timestamp: now,
  });

  let sent = 0;
  desktopClients.forEach(function (ws) {
    if (ws.readyState === ws.OPEN) {
      ws.send(payload);
      sent++;
    }
  });

  console.log(
    "[Keypress] Taste '%s' von User %s (Tx: %s) -> %d Client(s)",
    label, userId, transactionId, sent
  );

  res.json({ success: true, key: label });
});

// --- Server starten ---
server.listen(PORT, function () {
  console.log("===========================================");
  console.log("  Twitch Bits Keyboard - Backend Server");
  console.log("  Port: " + PORT);
  console.log("  WebSocket: ws://localhost:" + PORT + "/ws");
  console.log("===========================================");
});
