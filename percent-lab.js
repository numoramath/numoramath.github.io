(() => {
  const root = document.querySelector('#app-content');
  const pageTitle = document.querySelector('#page-title');
  if (!root || !pageTitle) return;

  const es = () => localStorage.getItem('numoraLanguage') === 'es';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  const state = {
    percent: 35,
    base: 120
  };

  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a || 1;
  }

  function render() {
    const isEs = es();
    pageTitle.textContent = isEs ? 'Laboratorio de porcentajes' : 'Percent visualizer';
    const p = Math.max(0, Math.min(100, Math.round(Number(state.percent) || 0)));
    const base = Number(state.base) || 0;
    const part = Number(((p / 100) * base).toFixed(4));
    const discount = Number((base - part).toFixed(4));
    const tipTotal = Number((base + part).toFixed(4));
    const d = gcd(p, 100);
    const frac = `${p / d}/${100 / d}`;
    const dec = (p / 100).toFixed(2);

    const cells = Array.from({ length: 100 }, (_, idx) => `<span class="percent-cell ${idx < p ? 'filled' : ''}" data-percent-cell="${idx + 1}"></span>`).join('');

    root.innerHTML = `<div class="page-wrap percent-lab-page">
      <div class="hero-row">
        <div>
          <span class="eyebrow">${isEs ? 'RAZONES Y PORCENTAJES' : 'RATIOS & PERCENTS'}</span>
          <h1>${isEs ? 'Visualizador de porcentajes' : 'Percent & ratio visualizer'}</h1>
          <p>${isEs ? 'Conecta porcentajes, fracciones, decimales y cálculos reales en una cuadrícula de 10×10.' : 'Connect percents, fractions, decimals, and real-world totals on a 10×10 hundredths grid.'}</p>
        </div>
      </div>
      <div class="percent-layout">
        <section class="card percent-grid-card">
          <div class="percent-stats">
            <div><small>${isEs ? 'PORCENTAJE' : 'PERCENT'}</small><strong>${p}%</strong></div>
            <div><small>${isEs ? 'FRACCIÓN' : 'FRACTION'}</small><strong>${frac}</strong></div>
            <div><small>${isEs ? 'DECIMAL' : 'DECIMAL'}</small><strong>${dec}</strong></div>
          </div>
          <div class="percent-grid" role="img" aria-label="${p}% (${p} ${isEs ? 'de 100 cuadros' : 'of 100 squares'})">${cells}</div>
          <label class="percent-slider">
            <span>${isEs ? 'Ajustar porcentaje' : 'Adjust percent'}: <strong>${p}%</strong></span>
            <input type="range" min="0" max="100" step="1" value="${p}" id="percent-range" />
          </label>
          <div class="percent-presets">
            ${[10, 20, 25, 33, 50, 75, 100].map(val => `<button type="button" class="secondary-btn" data-percent-preset="${val}">${val}%</button>`).join('')}
          </div>
        </section>
        <section class="card percent-calc-card">
          <h2>${isEs ? 'Porcentaje de una cantidad' : 'Percent of a quantity'}</h2>
          <div class="percent-inputs">
            <label>${isEs ? 'Porcentaje (%)' : 'Percent (%)'}<input type="number" min="0" max="100" step="1" value="${p}" id="percent-num" /></label>
            <label>${isEs ? 'Cantidad total' : 'Whole amount'}<input type="number" step="any" value="${esc(state.base)}" id="percent-base" /></label>
          </div>
          <div class="percent-result-box" aria-live="polite">
            <span>${p}% ${isEs ? 'de' : 'of'} ${esc(base)} =</span>
            <strong>${esc(part)}</strong>
            <p>${isEs ? `Paso: (${p} ÷ 100) × ${base} = ${dec} × ${base} = ${part}` : `Step: (${p} ÷ 100) × ${base} = ${dec} × ${base} = ${part}`}</p>
          </div>
          <div class="percent-realworld">
            <div><span>${isEs ? `Con ${p}% de descuento` : `With ${p}% discount`}</span><strong>${esc(discount)}</strong></div>
            <div><span>${isEs ? `Con ${p}% de impuesto/propina` : `With ${p}% tax or tip`}</span><strong>${esc(tipTotal)}</strong></div>
          </div>
        </section>
      </div>
    </div>`;
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const nav = target.closest('[data-view="percent-lab"]');
    if (nav) {
      event.preventDefault();
      event.stopImmediatePropagation();
      render();
      document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item === nav));
      return;
    }
    if (!root.querySelector('.percent-lab-page')) return;

    const preset = target.closest('[data-percent-preset]');
    if (preset) { state.percent = Number(preset.dataset.percentPreset); render(); return; }
    const cell = target.closest('[data-percent-cell]');
    if (cell) { state.percent = Number(cell.dataset.percentCell); render(); }
  }, true);

  document.addEventListener('input', event => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !root.querySelector('.percent-lab-page')) return;
    if (target.id === 'percent-range' || target.id === 'percent-num') {
      state.percent = Math.max(0, Math.min(100, Number(target.value) || 0));
      render();
    } else if (target.id === 'percent-base') {
      state.base = target.value;
      render();
    }
  });
})();
