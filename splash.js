(function () {
      var splashEl = document.getElementById('chatxSplash');
      var titleEl  = document.getElementById('chatxSplashTitle');
      if (!splashEl || !titleEl) return;
      var APP_NAME = 'Chat X';
      var LETTER_DELAY_MS = 130;
      var HOLD_MS = 1400;
      var SESSION_KEY = 'chatx_splash_shown';
      if (sessionStorage.getItem(SESSION_KEY)) { splashEl.remove(); return; }
      sessionStorage.setItem(SESSION_KEY, '1');
      APP_NAME.split('').forEach(function (ch, i) {
        var span = document.createElement('span');
        span.className = 'chatx-letter' + (ch === ' ' ? ' chatx-space' : '');
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        span.style.animationDelay = (i * LETTER_DELAY_MS) + 'ms';
        titleEl.appendChild(span);
      });
      var totalMs = APP_NAME.length * LETTER_DELAY_MS + 450 + HOLD_MS;
      setTimeout(function () {
        splashEl.classList.add('chatx-hide');
        setTimeout(function () { splashEl.remove(); }, 550);
      }, totalMs);
    })();
