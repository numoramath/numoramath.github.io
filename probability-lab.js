(() => {
  const root = document.querySelector('#app-content');
  const pageTitle = document.querySelector('#page-title');
  if (!root || !pageTitle) return;

  const es = () => localStorage.getItem('numoraLanguage') === 'es';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  const palette = ['#6356eb', '#0e9f7e', '#e05b48', '#f59e0b', '#2563eb', '#db2777', '#0891b2', '#65a30d'];
  const state = {
    slices: 4,
    angle: 0,
    lastIndex: null,
    counts: [0, 0, 0, 0]
  };

  function setSlices(n) {
    state.slices = Math.max(2, Math.min(8, n));
    state.counts = Array(state.slices).fill(0);
    state.lastIndex = null;
    state.angle = 0;
  }

  function runTrials(count) {
    let last = 0;
    for (let i = 0; i < count; i++) {
      last = Math.floor(Math.random() * state.slices);
      state.counts[last] = (state.counts[last] || 0) + 1;
    }
    state.lastIndex = last;
    const sliceDeg = 360 / state.slices;
    const targetDeg = 360 - (last * sliceDeg + sliceDeg / 2);
    state.angle = state.angle + 720 + ((targetDeg - (state.angle % 360) + 360) % 360);
  }

  function spinnerSvg() {
    const cx = 140, cy = 140, r = 115;
    const n = state.slices;
    const sliceAngle = (2 * Math.PI) / n;
    let paths = '';
    for (let i = 0; i < n; i++) {
      const a1 = i * sliceAngle - Math.PI / 2;
      const a2 = (i + 1) * sliceAngle - Math.PI / 2;
      const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
      const large = sliceAngle > Math.PI ? 1 : 0;
      const mid = (a1 + a2) / 2;
      const lx = cx + r * 0.62 * Math.cos(mid), ly = cy + r * 0.62 * Math.sin(mid);
      paths += `<path d="M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z" fill="${palette[i % palette.length]}" stroke="#fff" stroke-width="2" />`;
      paths += `<text x="${lx.toFixed(2)}" y="${ly.toFixed(2)}" class="prob-slice-label">${i + 1}</text>`;
    }
    return `<div class="prob-wheel-wrap">
      <div class="prob-pointer" aria-hidden="true">▼</div>
      <svg viewBox="0 0 280 280" class="prob-svg" style="transform: rotate(${state.angle}deg)">
        ${paths}
        <circle cx="${cx}" cy="${cy}" r="16" fill="#fff" stroke="#18263b" stroke-width="3" />
      </svg>
    </div>`;
  }

  function render() {
    const isEs = es();
    pageTitle.textContent = isEs ? 'Laboratorio de probabilidad' : 'Probability lab';
    const total = state.counts.reduce((a, b) => a + b, 0);
    const theoPct = (100 / state.slices).toFixed(1);

    const rows = state.counts.map((c, i) => {
      const expPct = total ? ((c / total) * 100).toFixed(1) : '0.0';
      return `<tr>
        <td><span class="prob-dot" style="background:${palette[i % palette.length]}"></span> ${i + 1}</td>
        <td>1/${state.slices} (${theoPct}%)</td>
        <td>${total ? `${c}/${total}` : '0'} (${expPct}%)</td>
      </tr>`;
    }).join('');

    root.innerHTML = `<div class="page-wrap prob-lab-page">
      <div class="hero-row">
        <div>
          <span class="eyebrow">${isEs ? 'AZAR Y PROBABILIDAD' : 'CHANCE & DATA'}</span>
          <h1>${isEs ? 'Laboratorio de probabilidad' : 'Probability & spinner lab'}</h1>
          <p>${isEs ? 'Haz girar la ruleta, ejecuta simulaciones y compara la probabilidad teórica con la experimental.' : 'Spin the wheel, run trials, and compare theoretical vs. experimental probability.'}</p>
        </div>
      </div>
      <div class="prob-layout">
        <section class="card prob-spinner-card">
          ${spinnerSvg()}
          <div class="prob-outcome" aria-live="polite">
            ${state.lastIndex !== null
              ? `${isEs ? 'Último resultado:' : 'Last outcome:'} <strong>#${state.lastIndex + 1}</strong> · ${total} ${isEs ? 'intentos' : 'trials'}`
              : (isEs ? 'Elige el tamaño y gira la ruleta.' : 'Choose slices and spin to run trials.')}
          </div>
          <div class="prob-actions">
            <button type="button" class="primary-btn" data-prob-spin="1">${isEs ? 'Girar 1 vez' : 'Spin 1×'}</button>
            <button type="button" class="secondary-btn" data-prob-spin="10">${isEs ? 'Girar 10 veces' : 'Spin 10×'}</button>
            <button type="button" class="secondary-btn" data-prob-spin="100">${isEs ? 'Girar 100 veces' : 'Spin 100×'}</button>
            <button type="button" class="text-link" data-prob-reset ${total ? '' : 'disabled'}>${isEs ? 'Reiniciar' : 'Reset'}</button>
          </div>
        </section>
        <section class="card prob-stats-card">
          <h2>${isEs ? 'Configuración y resultados' : 'Setup & results'}</h2>
          <div class="prob-presets">
            <button type="button" class="secondary-btn ${state.slices === 2 ? 'active' : ''}" data-prob-slices="2">${isEs ? 'Moneda (2)' : 'Coin (2)'}</button>
            <button type="button" class="secondary-btn ${state.slices === 4 ? 'active' : ''}" data-prob-slices="4">${isEs ? 'Ruleta (4)' : 'Spinner (4)'}</button>
            <button type="button" class="secondary-btn ${state.slices === 6 ? 'active' : ''}" data-prob-slices="6">${isEs ? 'Dado (6)' : 'Die (6)'}</button>
            <button type="button" class="secondary-btn ${state.slices === 8 ? 'active' : ''}" data-prob-slices="8">${isEs ? 'Ruleta (8)' : 'Spinner (8)'}</button>
          </div>
          <table class="prob-table">
            <thead>
              <tr>
                <th>${isEs ? 'Resultado' : 'Outcome'}</th>
                <th>${isEs ? 'Teórica' : 'Theoretical'}</th>
                <th>${isEs ? 'Experimental' : 'Experimental'}</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </section>
      </div>
    </div>`;
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const nav = target.closest('[data-view="probability-lab"]');
    if (nav) {
      event.preventDefault();
      event.stopImmediatePropagation();
      render();
      document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item === nav));
      return;
    }
    if (!root.querySelector('.prob-lab-page')) return;

    const spinBtn = target.closest('[data-prob-spin]');
    if (spinBtn) { runTrials(Number(spinBtn.dataset.probSpin) || 1); render(); return; }
    const sliceBtn = target.closest('[data-prob-slices]');
    if (sliceBtn) { setSlices(Number(sliceBtn.dataset.probSlices)); render(); return; }
    if (target.closest('[data-prob-reset]')) { setSlices(state.slices); render(); }
  }, true);
})();
