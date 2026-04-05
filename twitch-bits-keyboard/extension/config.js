// Konfiguration der Twitch Extension
const EXT_CONFIG = {
  // URL deines Backend-Servers (EBS)
  backendUrl: "https://dein-server.example.com",

  // Bits-Kosten pro Tastendruck
  bitsCost: 100,

  // Globaler Cooldown in Sekunden (verhindert Spam)
  globalCooldownSeconds: 5,

  // Verfuegbare Tasten, die Zuschauer druecken koennen
  keys: [
    { id: "r",     key: "r",      icon: "\uD83D\uDD04", label: "R",         desc: "Nachladen" },
    { id: "esc",   key: "Escape", icon: "\u274C",        label: "ESC",       desc: "Menue oeffnen" },
    { id: "space", key: "space",  icon: "\u2B06\uFE0F",  label: "SPACE",     desc: "Springen" },
    { id: "tab",   key: "Tab",    icon: "\u21B9",        label: "TAB",       desc: "Scoreboard" },
    { id: "e",     key: "e",      icon: "\uD83D\uDD13",  label: "E",         desc: "Interagieren" },
    { id: "q",     key: "q",      icon: "\uD83D\uDCA3",  label: "Q",         desc: "Ability" },
    { id: "f",     key: "f",      icon: "\uD83D\uDE97",  label: "F",         desc: "Fahrzeug" },
    { id: "g",     key: "g",      icon: "\uD83D\uDCA5",  label: "G",         desc: "Granate" },
    { id: "m",     key: "m",      icon: "\uD83D\uDDFA\uFE0F", label: "M",    desc: "Karte" },
  ],
};
