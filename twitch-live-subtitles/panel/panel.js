(function () {
  const langPicker = document.getElementById('lang-picker');
  const toggleSubtitles = document.getElementById('toggle-subtitles');
  const liveSubtitle = document.getElementById('live-subtitle');
  const livePartial = document.getElementById('live-partial');
  const historyList = document.getElementById('history-list');
  const statusEl = document.getElementById('status');

  let ws = null;
  let currentLang = localStorage.getItem('subtitle-lang') || 'off';

  // URL-Parameter lesen
  const params = new URLSearchParams(window.location.search);
  if (params.get('lang')) {
    currentLang = params.get('lang');
    localStorage.setItem('subtitle-lang', currentLang);
  }

  // Sprachen laden
  async function loadLanguages() {
    try {
      const res = await fetch('/api/languages');
      const data = await res.json();

      for (const lang of data.languages) {
        const option = document.createElement('option');
        option.value = lang.code;
        option.textContent = lang.native + ' (' + lang.name + ')';
        langPicker.appendChild(option);
      }

      // Deutsch (Original) hinzufügen
      const deOption = document.createElement('option');
      deOption.value = 'de';
      deOption.textContent = 'Deutsch (Original)';
      langPicker.insertBefore(deOption, langPicker.options[1]);

      langPicker.value = currentLang;
      toggleSubtitles.checked = currentLang !== 'off';
    } catch (err) {
      console.error('Fehler beim Laden der Sprachen:', err);
    }
  }

  // WebSocket-Verbindung
  function connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(protocol + '//' + window.location.host);

    ws.onopen = function () {
      statusEl.textContent = 'Verbunden';
      statusEl.className = 'status connected';

      if (currentLang && currentLang !== 'off') {
        ws.send(JSON.stringify({ type: 'subscribe', lang: currentLang }));
      }
    };

    ws.onmessage = function (event) {
      if (!toggleSubtitles.checked) return;

      var msg = JSON.parse(event.data);

      if (msg.type === 'subtitle') {
        var text = msg.translations[currentLang] || msg.original;
        showSubtitle(text);
        addToHistory(text);
      }

      if (msg.type === 'partial') {
        livePartial.textContent = msg.text;
      }
    };

    ws.onclose = function () {
      statusEl.textContent = 'Getrennt - Neuverbindung...';
      statusEl.className = 'status disconnected';
      setTimeout(connect, 3000);
    };

    ws.onerror = function () {
      statusEl.textContent = 'Verbindungsfehler';
      statusEl.className = 'status disconnected';
    };
  }

  function showSubtitle(text) {
    livePartial.textContent = '';
    liveSubtitle.textContent = text;
    liveSubtitle.style.opacity = '1';

    setTimeout(function () {
      liveSubtitle.style.opacity = '0.5';
    }, 5000);
  }

  function addToHistory(text) {
    var li = document.createElement('li');
    var time = new Date().toLocaleTimeString();
    li.innerHTML = '<span class="time">' + time + '</span>' + escapeHtml(text);
    historyList.insertBefore(li, historyList.firstChild);

    // Max 50 Einträge
    while (historyList.children.length > 50) {
      historyList.removeChild(historyList.lastChild);
    }
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Event Listener
  langPicker.addEventListener('change', function () {
    currentLang = langPicker.value;
    localStorage.setItem('subtitle-lang', currentLang);

    if (ws && ws.readyState === WebSocket.OPEN) {
      if (currentLang === 'off') {
        ws.send(JSON.stringify({ type: 'unsubscribe' }));
        toggleSubtitles.checked = false;
      } else {
        ws.send(JSON.stringify({ type: 'subscribe', lang: currentLang }));
        toggleSubtitles.checked = true;
      }
    }
  });

  toggleSubtitles.addEventListener('change', function () {
    if (!toggleSubtitles.checked) {
      liveSubtitle.textContent = '';
      livePartial.textContent = '';
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'unsubscribe' }));
      }
    } else {
      if (currentLang === 'off') {
        currentLang = 'en';
        langPicker.value = 'en';
        localStorage.setItem('subtitle-lang', 'en');
      }
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'subscribe', lang: currentLang }));
      }
    }
  });

  // Start
  loadLanguages();
  connect();
})();
