// Twitch Bits Keyboard Extension - Frontend
(function () {
  "use strict";

  let token = null;
  let userId = null;
  let cooldownActive = false;
  let cooldownEnd = 0;

  // --- Twitch Auth ---
  if (window.Twitch && window.Twitch.ext) {
    Twitch.ext.onAuthorized(function (auth) {
      token = auth.token;
      userId = auth.userId;
      console.log("[KeyboardTroll] Authentifiziert:", userId);
    });
  }

  // --- UI aufbauen ---
  const grid = document.getElementById("key-grid");
  const statusEl = document.getElementById("status");
  const cooldownBanner = document.getElementById("cooldown-banner");
  const cooldownTimer = document.getElementById("cooldown-timer");

  EXT_CONFIG.keys.forEach(function (keyDef) {
    const btn = document.createElement("button");
    btn.className = "key-btn";
    btn.dataset.keyId = keyDef.id;
    btn.innerHTML =
      '<span class="key-icon">' + keyDef.icon + "</span>" +
      '<span class="key-label">' + keyDef.label + "</span>" +
      '<span class="key-desc">' + keyDef.desc + "</span>" +
      '<span class="bits-cost">' + EXT_CONFIG.bitsCost + " Bits</span>";
    btn.addEventListener("click", function () {
      onKeyClick(keyDef);
    });
    grid.appendChild(btn);
  });

  // --- Bits-Transaktion starten ---
  function onKeyClick(keyDef) {
    if (cooldownActive) {
      showStatus("Bitte warte den Cooldown ab!", "error");
      return;
    }

    if (!window.Twitch || !window.Twitch.ext || !Twitch.ext.bits) {
      showStatus("Bits API nicht verfuegbar.", "error");
      return;
    }

    // Bits-Transaktion via Twitch Bits API
    Twitch.ext.bits.useBits(EXT_CONFIG.bitsCost);

    // Twitch ruft onTransactionComplete auf, wenn erfolgreich
    Twitch.ext.bits.onTransactionComplete(function (transaction) {
      console.log("[KeyboardTroll] Transaktion:", transaction);
      sendKeypress(keyDef, transaction);
    });

    Twitch.ext.bits.onTransactionCancelled(function () {
      showStatus("Transaktion abgebrochen.", "error");
    });
  }

  // --- Tastendruck an Backend senden ---
  function sendKeypress(keyDef, transaction) {
    var payload = {
      key: keyDef.key,
      keyId: keyDef.id,
      label: keyDef.label,
      transactionId: transaction.transactionID || transaction.id,
      userId: userId,
    };

    fetch(EXT_CONFIG.backendUrl + "/api/keypress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (data.success) {
          showStatus(keyDef.label + " gedrueckt! Der Streamer wird's merken.", "success");
          startCooldown();
        } else {
          showStatus("Fehler: " + (data.error || "Unbekannt"), "error");
        }
      })
      .catch(function (err) {
        console.error("[KeyboardTroll] Fehler:", err);
        showStatus("Verbindungsfehler zum Server.", "error");
      });
  }

  // --- Cooldown ---
  function startCooldown() {
    cooldownActive = true;
    cooldownEnd = Date.now() + EXT_CONFIG.globalCooldownSeconds * 1000;
    cooldownBanner.classList.remove("hidden");

    document.querySelectorAll(".key-btn").forEach(function (btn) {
      btn.classList.add("disabled");
    });

    var interval = setInterval(function () {
      var remaining = Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 1000));
      cooldownTimer.textContent = remaining;

      if (remaining <= 0) {
        clearInterval(interval);
        cooldownActive = false;
        cooldownBanner.classList.add("hidden");
        document.querySelectorAll(".key-btn").forEach(function (btn) {
          btn.classList.remove("disabled");
        });
      }
    }, 200);
  }

  // --- Status-Meldung ---
  function showStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = type;
    statusEl.classList.remove("hidden");
    setTimeout(function () {
      statusEl.classList.add("hidden");
    }, 3000);
  }
})();
