(() => {
  const content = document.querySelector('#app-content');
  if (!content) return;

  const isEs = () => localStorage.getItem('numoraLanguage') === 'es';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  let wrongStreak = 0;
  let lastQuestionText = '';

  const promptBackdrop = document.createElement('div');
  promptBackdrop.className = 'calc-offer-backdrop';
  promptBackdrop.hidden = true;
  document.body.appendChild(promptBackdrop);

  const miniCalcBackdrop = document.createElement('div');
  miniCalcBackdrop.className = 'calc-offer-backdrop';
  miniCalcBackdrop.hidden = true;
  document.body.appendChild(miniCalcBackdrop);

  function evalSimpleExpr(raw) {
    const cleaned = String(raw || '').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\s+/g, '');
    if (!cleaned || /[^0-9.+\-*/()^]/.test(cleaned)) return null;
    const tokens = [];
    let i = 0;
    while (i < cleaned.length) {
      const ch = cleaned[i];
      if (/[0-9.]/.test(ch)) {
        let j = i;
        while (j < cleaned.length && /[0-9.]/.test(cleaned[j])) j++;
        const n = Number(cleaned.slice(i, j));
        if (!Number.isFinite(n)) return null;
        tokens.push({ t: 'n', v: n });
        i = j;
      } else {
        tokens.push({ t: 'o', v: ch });
        i++;
      }
    }
    let pos = 0;
    const peek = () => tokens[pos];
    const eat = () => tokens[pos++];
    function expr() {
      let v = term();
      while (peek()?.t === 'o' && (peek().v === '+' || peek().v === '-')) {
        const op = eat().v;
        const r = term();
        v = op === '+' ? v + r : v - r;
      }
      return v;
    }
    function term() {
      let v = power();
      while (peek()?.t === 'o' && (peek().v === '*' || peek().v === '/')) {
        const op = eat().v;
        const r = power();
        if (op === '/' && r === 0) return NaN;
        v = op === '*' ? v * r : v / r;
      }
      return v;
    }
    function power() {
      let v = unary();
      if (peek()?.t === 'o' && peek().v === '^') { eat(); v = Math.pow(v, power()); }
      return v;
    }
    function unary() {
      if (peek()?.t === 'o' && (peek().v === '+' || peek().v === '-')) {
        return eat().v === '-' ? -unary() : unary();
      }
      const tok = peek();
      if (tok?.t === 'n') { eat(); return tok.v; }
      if (tok?.t === 'o' && tok.v === '(') {
        eat();
        const v = expr();
        if (peek()?.t !== 'o' || peek().v !== ')') return NaN;
        eat();
        return v;
      }
      return NaN;
    }
    const res = expr();
    if (pos !== tokens.length || !Number.isFinite(res)) return null;
    return Math.abs(res) < 1e-12 ? 0 : Number(res.toPrecision(12));
  }

  function showCalculatorOffer() {
    const es = isEs();
    promptBackdrop.innerHTML = `<section class="card calc-offer-dialog" role="dialog" aria-modal="true" aria-labelledby="calc-offer-title">
      <div class="calc-offer-icon" aria-hidden="true">🖩</div>
      <h2 id="calc-offer-title">${es ? '¿Quieres usar la calculadora para esta pregunta?' : 'Do you want to use the calculator for this question?'}</h2>
      <p>${es ? 'Has fallado 4 veces seguidas en esta pregunta.' : 'You have missed this question 4 times in a row.'}</p>
      <div class="calc-offer-actions">
        <button type="button" class="primary-btn" data-calc-offer="yes">${es ? '¿Quieres usar la calculadora para esta pregunta?' : 'Do you want to use the calculator for this question?'}</button>
        <button type="button" class="secondary-btn" data-calc-offer="no">${es ? 'No' : 'Not'}</button>
      </div>
    </section>`;
    promptBackdrop.hidden = false;
    promptBackdrop.querySelector('[data-calc-offer="yes"]')?.focus();
  }

  function showMiniCalculator() {
    const es = isEs();
    const keys = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '(', ')', '+', '^', 'C', '='];
    miniCalcBackdrop.innerHTML = `<section class="card mini-calc-dialog" role="dialog" aria-modal="true" aria-labelledby="mini-calc-title">
      <div class="mini-calc-head">
        <h2 id="mini-calc-title">${es ? 'Calculadora' : 'Calculator'}</h2>
        <button type="button" class="mini-calc-close" data-mini-calc-close aria-label="${es ? 'Cerrar' : 'Close'}">×</button>
      </div>
      <input type="text" class="mini-calc-input" id="mini-calc-input" placeholder="0" autocomplete="off" spellcheck="false" aria-label="${es ? 'Expresión' : 'Expression'}">
      <div class="mini-calc-preview" id="mini-calc-preview">= 0</div>
      <div class="mini-calc-keys">
        ${keys.map(k => `<button type="button" class="mini-calc-key ${k === '=' ? 'eq' : ''}" data-mini-key="${esc(k)}">${esc(k)}</button>`).join('')}
      </div>
      <div class="mini-calc-footer">
        <button type="button" class="secondary-btn" data-mini-calc-close>${es ? 'Cerrar' : 'Close'}</button>
        <button type="button" class="primary-btn" data-mini-calc-use>${es ? 'Usar resultado' : 'Use answer'}</button>
      </div>
    </section>`;
    miniCalcBackdrop.hidden = false;
    miniCalcBackdrop.querySelector('#mini-calc-input')?.focus();
  }

  function updateMiniPreview() {
    const input = miniCalcBackdrop.querySelector('#mini-calc-input');
    const preview = miniCalcBackdrop.querySelector('#mini-calc-preview');
    if (!input || !preview) return;
    if (!input.value.trim()) { preview.textContent = '= 0'; return; }
    const val = evalSimpleExpr(input.value);
    preview.textContent = val === null ? (isEs() ? 'Expresión no válida' : 'Invalid expression') : `= ${val}`;
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const offerBtn = target.closest('[data-calc-offer]');
    if (offerBtn) {
      promptBackdrop.hidden = true;
      if (offerBtn.dataset.calcOffer === 'yes') {
        showMiniCalculator();
      } else {
        document.querySelector('.practice-shell .answer-input')?.focus();
      }
      return;
    }

    if (target.closest('[data-mini-calc-close]') || target === miniCalcBackdrop) {
      miniCalcBackdrop.hidden = true;
      document.querySelector('.practice-shell .answer-input')?.focus();
      return;
    }

    if (target.closest('[data-mini-calc-use]')) {
      const input = miniCalcBackdrop.querySelector('#mini-calc-input');
      const val = evalSimpleExpr(input?.value || '');
      const answerBox = document.querySelector('.practice-shell .answer-input');
      if (val !== null && answerBox) {
        answerBox.value = String(val);
        answerBox.focus();
      }
      miniCalcBackdrop.hidden = true;
      return;
    }

    const keyBtn = target.closest('[data-mini-key]');
    if (keyBtn) {
      const k = keyBtn.dataset.miniKey;
      const input = miniCalcBackdrop.querySelector('#mini-calc-input');
      if (!input) return;
      if (k === 'C') input.value = '';
      else if (k === '=') {
        const val = evalSimpleExpr(input.value);
        if (val !== null) input.value = String(val);
      } else {
        input.value += k;
      }
      updateMiniPreview();
      input.focus();
      return;
    }

    if (target.closest('.practice-shell .check-btn') && !content.querySelector('[data-challenge-time]')) {
      const qText = content.querySelector('.practice-shell .question-card h1')?.textContent?.trim() || '';
      if (qText !== lastQuestionText) {
        lastQuestionText = qText;
        wrongStreak = 0;
      }
      setTimeout(() => {
        const feedback = content.querySelector('.practice-shell .feedback');
        if (!feedback) return;
        if (feedback.classList.contains('success')) {
          wrongStreak = 0;
        } else if (feedback.classList.contains('error')) {
          wrongStreak++;
          if (wrongStreak >= 4) {
            wrongStreak = 0;
            showCalculatorOffer();
          }
        }
      }, 0);
    }
  });

  document.addEventListener('input', event => {
    if (event.target instanceof HTMLInputElement && event.target.id === 'mini-calc-input') {
      updateMiniPreview();
    }
  });

  const qObserver = new MutationObserver(() => {
    const qText = content.querySelector('.practice-shell .question-card h1')?.textContent?.trim() || '';
    if (qText && qText !== lastQuestionText) {
      lastQuestionText = qText;
      wrongStreak = 0;
    }
  });
  qObserver.observe(content, { childList: true, subtree: true });
})();
