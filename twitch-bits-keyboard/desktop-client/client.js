const WebSocket = require("ws");

// --- Konfiguration ---
const SERVER_URL = process.env.SERVER_URL || "ws://localhost:3000/ws";
const CLIENT_TOKEN = process.env.DESKTOP_CLIENT_TOKEN || "changeme";
const RECONNECT_DELAY_MS = 5000;

// Robotjs fuer Tastensimulation
let robot;
try {
  robot = require("robotjs");
} catch (err) {
  console.error("[FEHLER] robotjs konnte nicht geladen werden!");
  console.error("Installiere es mit: npm install robotjs");
  console.error("(Benoetigt Python und C++ Build-Tools)");
  process.exit(1);
}

// Mapping von Extension-Keys zu robotjs-Keys
const KEY_MAP = {
  r: "r",
  Escape: "escape",
  space: "space",
  Tab: "tab",
  e: "e",
  q: "q",
  f: "f",
  g: "g",
  m: "m",
};

let ws = null;
let reconnectTimer = null;

function connect() {
  const url = SERVER_URL + "?token=" + encodeURIComponent(CLIENT_TOKEN);
  console.log("[Client] Verbinde mit " + SERVER_URL + " ...");

  ws = new WebSocket(url);

  ws.on("open", function () {
    console.log("[Client] Verbunden mit Backend-Server!");
    console.log("[Client] Warte auf Tastendruecke von Zuschauern...");
    console.log("");
  });

  ws.on("message", function (data) {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === "connected") {
        console.log("[Server] " + msg.message);
        return;
      }

      if (msg.type === "keypress") {
        handleKeypress(msg);
      }
    } catch (err) {
      console.error("[Client] Fehler beim Verarbeiten:", err.message);
    }
  });

  ws.on("close", function (code, reason) {
    console.log("[Client] Verbindung getrennt (Code: " + code + ")");
    scheduleReconnect();
  });

  ws.on("error", function (err) {
    console.error("[Client] WebSocket-Fehler:", err.message);
  });
}

function handleKeypress(msg) {
  const robotKey = KEY_MAP[msg.key];
  if (!robotKey) {
    console.log("[Client] Unbekannte Taste ignoriert: " + msg.key);
    return;
  }

  console.log(
    "[KEYPRESS] Taste: %s | Von: %s | Tx: %s",
    msg.label,
    msg.userId || "unbekannt",
    msg.transactionId || "-"
  );

  try {
    // Taste druecken und loslassen
    robot.keyTap(robotKey);
    console.log("[Client] Taste '%s' erfolgreich simuliert!", msg.label);
  } catch (err) {
    console.error("[Client] Fehler bei Tastensimulation:", err.message);
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  console.log(
    "[Client] Neuverbindung in " + RECONNECT_DELAY_MS / 1000 + " Sekunden..."
  );
  reconnectTimer = setTimeout(function () {
    reconnectTimer = null;
    connect();
  }, RECONNECT_DELAY_MS);
}

// --- Start ---
console.log("===========================================");
console.log("  Twitch Bits Keyboard - Desktop Client");
console.log("===========================================");
console.log("");

connect();

// Graceful Shutdown
process.on("SIGINT", function () {
  console.log("\n[Client] Beende...");
  if (ws) ws.close();
  process.exit(0);
});
