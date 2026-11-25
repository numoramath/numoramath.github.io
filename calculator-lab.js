(() => {
  const root = document.querySelector('#app-content');
  const pageTitle = document.querySelector('#page-title');
  if (!root || !pageTitle) return;

  const es = () => localStorage.getItem('numoraLanguage') === 'es';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  const state = {
    expr: '2*(3+4)^2 - sqrt(16)',
    angleMode: 'deg',
    ans: 0,
    history: []
  };

  function tokenize(source) {
    const tokens = [];
    let i = 0;
    while (i < source.length) {
      const ch = source[i];
      if (/\s/.test(ch)) { i++; continue; }
      if (/[0-9.]/.test(ch)) {
        let j = i;
        while (j < source.length && /[0-9.]/.test(source[j])) j++;
        const num = Number(source.slice(i, j));
        if (!Number.isFinite(num)) throw new Error('Invalid number');
        tokens.push({ type: 'num', value: num });
        i = j;
        continue;
      }
      if (/[a-zA-Z]/.test(ch)) {
        let j = i;
        while (j < source.length && /[a-zA-Z]/.test(source[j])) j++;
        tokens.push({ type: 'id', value: source.slice(i, j).toLowerCase() });
        i = j;
        continue;
      }
      if ('+-*/^%()'.includes(ch)) {
        tokens.push({ type: 'op', value: ch });
        i++;
        continue;
      }
      if (ch === '×') { tokens.push({ type: 'op', value: '*' }); i++; continue; }
      if (ch === '÷') { tokens.push({ type: 'op', value: '/' }); i++; continue; }
      if (ch === '−') { tokens.push({ type: 'op', value: '-' }); i++; continue; }
      if (ch === 'π') { tokens.push({ type: 'id', value: 'pi' }); i++; continue; }
      if (ch === '√') { tokens.push({ type: 'id', value: 'sqrt' }); i++; continue; }
      throw new Error('Unexpected character');
    }
    return tokens;
  }

  function evaluateExpression(source, ansValue, angleMode) {
    const tokens = tokenize(source);
    if (!tokens.length) return { ok: false, error: es() ? 'Escribe una expresión.' : 'Enter an expression.' };
    let pos = 0;
    const peek = () => tokens[pos];
    const consume = () => tokens[pos++];

    function parseExpr() {
      let left = parseTerm();
      while (peek()?.type === 'op' && (peek().value === '+' || peek().value === '-')) {
        const op = consume().value;
        const right = parseTerm();
        left = op === '+' ? left + right : left - right;
      }
      return left;
    }

    function parseTerm() {
      let left = parsePower();
      while (peek()?.type === 'op' && (peek().value === '*' || peek().value === '/' || peek().value === '%')) {
        const op = consume().value;
        const right = parsePower();
        if ((op === '/' || op === '%') && right === 0) throw new Error(es() ? 'División por cero' : 'Division by zero');
        left = op === '*' ? left * right : op === '/' ? left / right : left % right;
      }
      return left;
    }

    function parsePower() {
      let base = parseUnary();
      if (peek()?.type === 'op' && peek().value === '^') {
        consume();
        const exp = parsePower();
        base = Math.pow(base, exp);
      }
      return base;
    }

    function parseUnary() {
      if (peek()?.type === 'op' && (peek().value === '+' || peek().value === '-')) {
        const op = consume().value;
        return op === '-' ? -parseUnary() : parseUnary();
      }
      return parsePrimary();
    }

    function parsePrimary() {
      const tok = peek();
      if (!tok) throw new Error(es() ? 'Expresión incompleta' : 'Incomplete expression');
      if (tok.type === 'num') {
        consume();
        return tok.value;
      }
      if (tok.type === 'id') {
        consume();
        if (tok.value === 'pi') return Math.PI;
        if (tok.value === 'e') return Math.E;
        if (tok.value === 'ans') return ansValue;
        if (peek()?.type !== 'op' || peek().value !== '(') {
          throw new Error(es() ? `Falta "(" después de ${tok.value}` : `Missing "(" after ${tok.value}`);
        }
        consume();
        const arg = parseExpr();
        if (peek()?.type !== 'op' || peek().value !== ')') throw new Error(es() ? 'Falta ")"' : 'Missing ")"');
        consume();
        const toRad = angleMode === 'deg' ? Math.PI / 180 : 1;
        if (tok.value === 'sqrt') {
          if (arg < 0) throw new Error(es() ? 'Raíz de número negativo' : 'Square root of negative');
          return Math.sqrt(arg);
        }
        if (tok.value === 'abs') return Math.abs(arg);
        if (tok.value === 'sin') return Math.sin(arg * toRad);
        if (tok.value === 'cos') return Math.cos(arg * toRad);
        if (tok.value === 'tan') return Math.tan(arg * toRad);
        if (tok.value === 'log') {
          if (arg <= 0) throw new Error(es() ? 'Logaritmo inválido' : 'Invalid log input');
          return Math.log10(arg);
        }
        if (tok.value === 'ln') {
          if (arg <= 0) throw new Error(es() ? 'Logaritmo inválido' : 'Invalid ln input');
          return Math.log(arg);
        }
        throw new Error(es() ? `Función desconocida: ${tok.value}` : `Unknown function: ${tok.value}`);
      }
      if (tok.type === 'op' && tok.value === '(') {
        consume();
        const val = parseExpr();
        if (peek()?.type !== 'op' || peek().value !== ')') throw new Error(es() ? 'Falta ")"' : 'Missing ")"');
        consume();
        return val;
      }
      throw new Error(es() ? 'Sintaxis no válida' : 'Invalid syntax');
    }

    try {
      const value = parseExpr();
      if (pos !== tokens.length) throw new Error(es() ? 'Sintaxis no válida' : 'Invalid syntax');
      if (!Number.isFinite(value)) throw new Error(es() ? 'Resultado indefinido' : 'Undefined result');
      const rounded = Math.abs(value) < 1e-12 ? 0 : Number(value.toPrecision(12));
      return { ok: true, value: rounded };
    } catch (err) {
      return { ok: false, error: err.message || (es() ? 'Expresión no válida' : 'Invalid expression') };
    }
  }

  function formatNumber(n) {
    return Number.isFinite(n) ? new Intl.NumberFormat(es() ? 'es' : 'en', { maximumSignificantDigits: 10 }).format(n) : '—';
  }

  function render() {
    const isEs = es();
    pageTitle.textContent = isEs ? 'Calculadora científica' : 'Scientific calculator';
    const preview = evaluateExpression(state.expr, state.ans, state.angleMode);
    const keys = [
      ['sin(', 'sin'], ['cos(', 'cos'], ['tan(', 'tan'], ['sqrt(', '√'], ['^', 'xʸ'],
      ['log(', 'log'], ['ln(', 'ln'], ['(', '('], [')', ')'], ['/', '÷'],
      ['7', '7'], ['8', '8'], ['9', '9'], ['*', '×'], ['pi', 'π'],
      ['4', '4'], ['5', '5'], ['6', '6'], ['-', '−'], ['e', 'e'],
      ['1', '1'], ['2', '2'], ['3', '3'], ['+', '+'], ['ans', 'Ans'],
      ['0', '0'], ['.', '.'], ['%', '%'], ['abs(', '|x|'], ['=', '=']
    ];
    const historyHtml = state.history.length
      ? state.history.map((item, idx) => `<button type="button" class="calc-history-item" data-calc-history="${idx}"><span>${esc(item.expr)}</span><strong>= ${esc(formatNumber(item.result))}</strong></button>`).join('')
      : `<p class="calc-empty">${isEs ? 'Tus cálculos guardados aparecerán aquí.' : 'Your evaluated expressions will appear here.'}</p>`;

    root.innerHTML = `<div class="page-wrap calc-lab-page">
      <div class="hero-row">
        <div>
          <span class="eyebrow">${isEs ? 'HERRAMIENTA DE CÁLCULO' : 'COMPUTATION TOOL'}</span>
          <h1>${isEs ? 'Calculadora científica' : 'Scientific calculator'}</h1>
          <p>${isEs ? 'Evalúa expresiones con paréntesis, potencias, raíces y trigonometría.' : 'Evaluate expressions with parentheses, powers, roots, logs, and trigonometry.'}</p>
        </div>
        <div class="calc-mode-toggle" role="group" aria-label="${isEs ? 'Modo de ángulo' : 'Angle mode'}">
          <button type="button" class="secondary-btn ${state.angleMode === 'deg' ? 'active' : ''}" data-calc-angle="deg">DEG</button>
          <button type="button" class="secondary-btn ${state.angleMode === 'rad' ? 'active' : ''}" data-calc-angle="rad">RAD</button>
        </div>
      </div>
      <div class="calc-layout">
        <section class="card calc-card">
          <div class="calc-display">
            <input id="calc-input" type="text" value="${esc(state.expr)}" aria-label="${isEs ? 'Expresión matemática' : 'Math expression'}" autocomplete="off" spellcheck="false" />
            <div class="calc-preview ${preview.ok ? '' : 'error'}" aria-live="polite">${preview.ok ? `= ${esc(formatNumber(preview.value))}` : esc(preview.error)}</div>
          </div>
          <div class="calc-top-actions">
            <button type="button" class="secondary-btn" data-calc-action="clear">${isEs ? 'Borrar' : 'Clear'}</button>
            <button type="button" class="secondary-btn" data-calc-action="back">⌫ ${isEs ? 'Atrás' : 'Backspace'}</button>
            <button type="button" class="primary-btn" data-calc-action="eval">${isEs ? 'Calcular =' : 'Evaluate ='}</button>
          </div>
          <div class="calc-keypad">
            ${keys.map(([val, label]) => `<button type="button" class="calc-key ${val === '=' ? 'equals' : ''}" data-calc-key="${esc(val)}">${esc(label)}</button>`).join('')}
          </div>
        </section>
        <section class="card calc-history-card">
          <div class="calc-history-head">
            <div><span class="report-kicker">${isEs ? 'HISTORIAL' : 'HISTORY'}</span><h2>${isEs ? 'Cálculos recientes' : 'Recent calculations'}</h2></div>
            <button type="button" class="text-link" data-calc-action="clear-history" ${state.history.length ? '' : 'disabled'}>${isEs ? 'Limpiar' : 'Clear'}</button>
          </div>
          <div class="calc-history-list">${historyHtml}</div>
        </section>
      </div>
    </div>`;
  }

  function updatePreview() {
    const previewEl = root.querySelector('.calc-preview');
    if (!previewEl) return;
    const preview = evaluateExpression(state.expr, state.ans, state.angleMode);
    previewEl.classList.toggle('error', !preview.ok);
    previewEl.textContent = preview.ok ? `= ${formatNumber(preview.value)}` : preview.error;
  }

  function commitEvaluation() {
    const res = evaluateExpression(state.expr, state.ans, state.angleMode);
    if (!res.ok) {
      window.showToast?.(res.error);
      return;
    }
    state.ans = res.value;
    state.history.unshift({ expr: state.expr, result: res.value });
    state.history = state.history.slice(0, 15);
    state.expr = String(res.value);
    render();
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const nav = target.closest('[data-view="calculator-lab"]');
    if (nav) {
      event.preventDefault();
      event.stopImmediatePropagation();
      render();
      document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item === nav));
      return;
    }
    if (!root.querySelector('.calc-lab-page')) return;

    const angleBtn = target.closest('[data-calc-angle]');
    if (angleBtn) {
      state.angleMode = angleBtn.dataset.calcAngle === 'rad' ? 'rad' : 'deg';
      render();
      return;
    }
    const actionBtn = target.closest('[data-calc-action]');
    if (actionBtn) {
      const action = actionBtn.dataset.calcAction;
      if (action === 'clear') { state.expr = ''; render(); }
      else if (action === 'back') { state.expr = state.expr.slice(0, -1); render(); }
      else if (action === 'eval') { commitEvaluation(); }
      else if (action === 'clear-history') { state.history = []; render(); }
      return;
    }
    const keyBtn = target.closest('[data-calc-key]');
    if (keyBtn) {
      const key = keyBtn.dataset.calcKey;
      if (key === '=') commitEvaluation();
      else {
        state.expr += key;
        const input = root.querySelector('#calc-input');
        if (input) { input.value = state.expr; input.focus(); }
        updatePreview();
      }
      return;
    }
    const histBtn = target.closest('[data-calc-history]');
    if (histBtn) {
      const item = state.history[Number(histBtn.dataset.calcHistory)];
      if (item) { state.expr = item.expr; render(); }
    }
  }, true);

  document.addEventListener('input', event => {
    if (event.target instanceof HTMLInputElement && event.target.id === 'calc-input') {
      state.expr = event.target.value;
      updatePreview();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.target instanceof HTMLInputElement && event.target.id === 'calc-input' && event.key === 'Enter') {
      event.preventDefault();
      commitEvaluation();
    }
  });
})();
