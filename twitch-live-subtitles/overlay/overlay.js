(function () {
  const params = new URLSearchParams(window.location.search);
  const lang = params.get('lang') || 'de';
  const fontSize = params.get('size') || '32';
  const showPartial = params.get('partial') !== 'false';
  const wsHost = params.get('host') || window.location.host;

  document.documentElement.style.setProperty('--font-size', fontSize + 'px');

  const subtitleEl = document.getElementById('subtitle-text');
  const partialEl = document.getElementById('partial-text');

  let fadeTimer = null;
  let ws = null;

  function connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${wsHost}`);

    ws.onopen = function () {
      console.log('[Overlay] Verbunden. Sprache:', lang);
      ws.send(JSON.stringify({ type: 'subscribe', lang: lang }));
    };

    ws.onmessage = function (event) {
      const msg = JSON.parse(event.data);

      if (msg.type === 'subtitle') {
        const text = msg.translations[lang] || msg.original;
        showSubtitle(text);
      }

      if (msg.type === 'partial' && showPartial) {
        showPartialText(msg.text);
      }
    };

    ws.onclose = function () {
      console.log('[Overlay] Verbindung verloren. Neuverbindung in 3s...');
      setTimeout(connect, 3000);
    };

    ws.onerror = function (err) {
      console.error('[Overlay] WebSocket Fehler:', err);
    };
  }

  function showSubtitle(text) {
    // Partial ausblenden
    partialEl.classList.remove('visible');
    partialEl.textContent = '';

    // Vorherigen Timer löschen
    if (fadeTimer) clearTimeout(fadeTimer);

    // Text setzen und einblenden
    subtitleEl.textContent = text;
    subtitleEl.classList.remove('fade-out');
    subtitleEl.classList.add('visible');

    // Nach einiger Zeit ausblenden
    const duration = parseInt(params.get('duration')) || 6000;
    fadeTimer = setTimeout(function () {
      subtitleEl.classList.add('fade-out');
      subtitleEl.classList.remove('visible');
    }, duration);
  }

  function showPartialText(text) {
    partialEl.textContent = text;
    partialEl.classList.add('visible');
  }

  connect();
})();
