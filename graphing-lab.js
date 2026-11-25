(() => {
  const root = document.querySelector('#app-content');
  const pageTitle = document.querySelector('#page-title');
  if (!root || !pageTitle) return;

  const es = () => localStorage.getItem('numoraLanguage') === 'es';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  const state = {
    m1: 1,
    b1: 2,
    showLine2: false,
    m2: -0.5,
    b2: 4,
    px: 3,
    py: 5,
    points: [{ x: 0, y: 2 }, { x: 2, y: 4 }]
  };

  function toSvgX(x) { return 200 + x * 18; }
  function toSvgY(y) { return 200 - y * 18; }

  function lineSegment(m, b) {
    const x1 = -10, y1 = m * x1 + b;
    const x2 = 10, y2 = m * x2 + b;
    return { x1: toSvgX(x1), y1: toSvgY(y1), x2: toSvgX(x2), y2: toSvgY(y2) };
  }

  function formatEq(m, b) {
    const mStr = m === 1 ? 'x' : m === -1 ? '−x' : m === 0 ? '' : `${m}x`;
    if (m === 0) return `y = ${b}`;
    if (b === 0) return `y = ${mStr}`;
    return b > 0 ? `y = ${mStr} + ${b}` : `y = ${mStr} − ${Math.abs(b)}`;
  }

  function intersection() {
    if (!state.showLine2 || state.m1 === state.m2) return null;
    const x = (state.b2 - state.b1) / (state.m1 - state.m2);
    const y = state.m1 * x + state.b1;
    return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
  }

  function buildGridSvg() {
    let lines = '';
    for (let i = -10; i <= 10; i++) {
      const pos = toSvgX(i);
      const yPos = toSvgY(i);
      const isAxis = i === 0;
      lines += `<line x1="${pos}" y1="20" x2="${pos}" y2="380" class="${isAxis ? 'graph-axis' : 'graph-grid'}" />`;
      lines += `<line x1="20" y1="${yPos}" x2="380" y2="${yPos}" class="${isAxis ? 'graph-axis' : 'graph-grid'}" />`;
      if (i !== 0 && i % 2 === 0) {
        lines += `<text x="${pos}" y="214" class="graph-tick">${i}</text>`;
        lines += `<text x="188" y="${yPos + 4}" class="graph-tick end">${i}</text>`;
      }
    }
    const l1 = lineSegment(state.m1, state.b1);
    const l2 = state.showLine2 ? lineSegment(state.m2, state.b2) : null;
    const inter = intersection();
    const pts = state.points.map(p => `<g class="graph-point"><circle cx="${toSvgX(p.x)}" cy="${toSvgY(p.y)}" r="5" /><text x="${toSvgX(p.x) + 8}" y="${toSvgY(p.y) - 6}">(${p.x}, ${p.y})</text></g>`).join('');
    const interSvg = inter && Math.abs(inter.x) <= 10 && Math.abs(inter.y) <= 10
      ? `<g class="graph-inter"><circle cx="${toSvgX(inter.x)}" cy="${toSvgY(inter.y)}" r="6" /><text x="${toSvgX(inter.x) + 8}" y="${toSvgY(inter.y) + 14}">(${inter.x}, ${inter.y})</text></g>`
      : '';

    return `<svg viewBox="0 0 400 400" class="graph-svg" role="img" aria-label="${es() ? 'Plano de coordenadas' : 'Coordinate plane'}">
      <defs><clipPath id="graph-clip"><rect x="20" y="20" width="360" height="360" /></clipPath></defs>
      ${lines}
      <g clip-path="url(#graph-clip)">
        <line x1="${l1.x1}" y1="${l1.y1}" x2="${l1.x2}" y2="${l1.y2}" class="graph-line-1" />
        ${l2 ? `<line x1="${l2.x1}" y1="${l2.y1}" x2="${l2.x2}" y2="${l2.y2}" class="graph-line-2" />` : ''}
        ${pts}
        ${interSvg}
      </g>
    </svg>`;
  }

  function render() {
    const isEs = es();
    pageTitle.textContent = isEs ? 'Plano cartesiano y gráficas' : 'Coordinate grapher';
    const xInt = state.m1 === 0 ? (isEs ? 'Ninguno (horizontal)' : 'None (horizontal)') : Number((-state.b1 / state.m1).toFixed(2));
    const inter = intersection();
    const tableRows = [-2, -1, 0, 1, 2].map(x => `<tr><td>${x}</td><td>${Number((state.m1 * x + state.b1).toFixed(2))}</td></tr>`).join('');
    const pointChips = state.points.map((p, i) => `<button type="button" class="graph-point-chip" data-graph-remove="${i}">(${p.x}, ${p.y}) ×</button>`).join('');

    root.innerHTML = `<div class="page-wrap graph-lab-page">
      <div class="hero-row">
        <div>
          <span class="eyebrow">${isEs ? 'ÁLGEBRA VISUAL' : 'VISUAL ALGEBRA'}</span>
          <h1>${isEs ? 'Plano cartesiano y gráficas' : 'Coordinate plane & line grapher'}</h1>
          <p>${isEs ? 'Explora la pendiente, la intersección con y, y grafica puntos en el plano.' : 'Explore slope, y-intercept, intersections, and plot ordered pairs on the grid.'}</p>
        </div>
      </div>
      <div class="graph-layout">
        <section class="card graph-canvas-card">
          <div class="graph-eq-banner">
            <span class="eq-pill eq1">${esc(formatEq(state.m1, state.b1))}</span>
            ${state.showLine2 ? `<span class="eq-pill eq2">${esc(formatEq(state.m2, state.b2))}</span>` : ''}
          </div>
          ${buildGridSvg()}
          <div class="graph-facts">
            <span><strong>${isEs ? 'Pendiente (m)' : 'Slope (m)'}:</strong> ${state.m1}</span>
            <span><strong>${isEs ? 'Intersección y' : 'y-intercept'}:</strong> (0, ${state.b1})</span>
            <span><strong>${isEs ? 'Intersección x' : 'x-intercept'}:</strong> ${typeof xInt === 'number' ? `(${xInt}, 0)` : xInt}</span>
            ${state.showLine2 ? `<span><strong>${isEs ? 'Cruce' : 'Intersection'}:</strong> ${inter ? `(${inter.x}, ${inter.y})` : (isEs ? 'Paralelas' : 'Parallel lines')}</span>` : ''}
          </div>
        </section>
        <section class="card graph-controls-card">
          <h2>${isEs ? 'Recta principal' : 'Primary line'}</h2>
          <label class="graph-slider">
            <span>${isEs ? 'Pendiente (m)' : 'Slope (m)'}: <strong>${state.m1}</strong></span>
            <input type="range" min="-5" max="5" step="0.5" value="${state.m1}" data-graph-range="m1" />
          </label>
          <label class="graph-slider">
            <span>${isEs ? 'Intersección y (b)' : 'y-intercept (b)'}: <strong>${state.b1}</strong></span>
            <input type="range" min="-8" max="8" step="1" value="${state.b1}" data-graph-range="b1" />
          </label>
          <label class="graph-toggle">
            <input type="checkbox" id="graph-line2-toggle" ${state.showLine2 ? 'checked' : ''} />
            <span>${isEs ? 'Comparar con una segunda recta' : 'Compare a second line'}</span>
          </label>
          ${state.showLine2 ? `<div class="graph-line2-box">
            <label class="graph-slider"><span>m₂: <strong>${state.m2}</strong></span><input type="range" min="-5" max="5" step="0.5" value="${state.m2}" data-graph-range="m2" /></label>
            <label class="graph-slider"><span>b₂: <strong>${state.b2}</strong></span><input type="range" min="-8" max="8" step="1" value="${state.b2}" data-graph-range="b2" /></label>
          </div>` : ''}
          <hr class="graph-divider" />
          <h3>${isEs ? 'Graficar un punto (x, y)' : 'Plot a point (x, y)'}</h3>
          <div class="graph-point-form">
            <label>x <input type="number" min="-10" max="10" step="1" value="${state.px}" id="graph-px" /></label>
            <label>y <input type="number" min="-10" max="10" step="1" value="${state.py}" id="graph-py" /></label>
            <button type="button" class="primary-btn" data-graph-action="add-point">${isEs ? 'Añadir' : 'Plot'}</button>
          </div>
          <div class="graph-point-chips">${pointChips || `<small>${isEs ? 'Sin puntos aún.' : 'No plotted points.'}</small>`}</div>
          <table class="graph-table" aria-label="${isEs ? 'Tabla de valores' : 'Table of values'}">
            <thead><tr><th>x</th><th>y</th></tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </section>
      </div>
    </div>`;
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const nav = target.closest('[data-view="graphing-lab"]');
    if (nav) {
      event.preventDefault();
      event.stopImmediatePropagation();
      render();
      document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item === nav));
      return;
    }
    if (!root.querySelector('.graph-lab-page')) return;

    const removeBtn = target.closest('[data-graph-remove]');
    if (removeBtn) {
      state.points.splice(Number(removeBtn.dataset.graphRemove), 1);
      render();
      return;
    }
    const actionBtn = target.closest('[data-graph-action="add-point"]');
    if (actionBtn) {
      const x = Math.max(-10, Math.min(10, Number(root.querySelector('#graph-px')?.value) || 0));
      const y = Math.max(-10, Math.min(10, Number(root.querySelector('#graph-py')?.value) || 0));
      state.px = x;
      state.py = y;
      if (!state.points.some(p => p.x === x && p.y === y)) state.points.push({ x, y });
      render();
    }
  }, true);

  document.addEventListener('input', event => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !root.querySelector('.graph-lab-page')) return;
    if (target.dataset.graphRange) {
      state[target.dataset.graphRange] = Number(target.value);
      render();
    }
  });

  document.addEventListener('change', event => {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.id === 'graph-line2-toggle') {
      state.showLine2 = target.checked;
      render();
    }
  });
})();
