(() => {
  const root = document.querySelector('#app-content');
  const pageTitle = document.querySelector('#page-title');
  if (!root || !pageTitle) return;

  const es = () => localStorage.getItem('numoraLanguage') === 'es';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  const state = { a: 24, b: 36 };

  function clampInt(val) {
    const n = Math.floor(Number(val));
    if (!Number.isFinite(n) || n < 1) return 1;
    return Math.min(999999, n);
  }

  function primeFactors(n) {
    const map = new Map();
    let rem = n;
    for (let d = 2; d * d <= rem; d++) {
      while (rem % d === 0) {
        map.set(d, (map.get(d) || 0) + 1);
        rem /= d;
      }
    }
    if (rem > 1) map.set(rem, (map.get(rem) || 0) + 1);
    return map;
  }

  function formatFactors(map) {
    if (!map.size) return '1';
    const sup = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
    const toSup = k => String(k).split('').map(c => sup[c] || c).join('');
    return [...map.entries()].map(([p, e]) => (e > 1 ? `${p}${toSup(e)}` : `${p}`)).join(' × ');
  }

  function allDivisors(n) {
    const small = [], large = [];
    for (let d = 1; d * d <= n; d++) {
      if (n % d === 0) {
        small.push(d);
        if (d !== n / d) large.unshift(n / d);
      }
    }
    return small.concat(large);
  }

  function gcd(a, b) {
    while (b) [a, b] = [b, a % b];
    return a;
  }

  function render() {
    const isEs = es();
    pageTitle.textContent = isEs ? 'Factores primos, MCD y MCM' : 'Factors, GCF & LCM lab';
    const a = clampInt(state.a);
    const b = clampInt(state.b);
    const fa = primeFactors(a);
    const fb = primeFactors(b);
    const da = allDivisors(a);
    const db = allDivisors(b);
    const g = gcd(a, b);
    const l = (a / g) * b;
    const isPrimeA = a > 1 && fa.size === 1 && fa.get(a) === 1;
    const isPrimeB = b > 1 && fb.size === 1 && fb.get(b) === 1;

    root.innerHTML = `<div class="page-wrap factor-lab-page">
      <div class="hero-row">
        <div>
          <span class="eyebrow">${isEs ? 'TEORÍA DE NÚMEROS' : 'NUMBER THEORY'}</span>
          <h1>${isEs ? 'Factores primos, MCD y MCM' : 'Prime factors, GCF & LCM lab'}</h1>
          <p>${isEs ? 'Descompón números en factores primos y encuentra su máximo común divisor y mínimo común múltiplo.' : 'Break numbers into prime factors and compute their Greatest Common Factor (GCF) and Least Common Multiple (LCM).'}</p>
        </div>
      </div>
      <section class="card factor-input-card">
        <div class="factor-inputs">
          <label>${isEs ? 'Primer número' : 'First number'}<input type="number" min="1" max="999999" value="${a}" id="factor-a" /></label>
          <label>${isEs ? 'Segundo número' : 'Second number'}<input type="number" min="1" max="999999" value="${b}" id="factor-b" /></label>
          <button type="button" class="secondary-btn" data-factor-random>${isEs ? '🎲 Aleatorio' : '🎲 Random pair'}</button>
        </div>
        <div class="factor-pair-results">
          <div class="factor-highlight">
            <span>${isEs ? 'Máximo Común Divisor (MCD)' : 'Greatest Common Factor (GCF)'}</span>
            <strong>${g.toLocaleString()}</strong>
            <small>${isEs ? `El mayor número que divide a ${a} y a ${b}` : `Largest number dividing both ${a} and ${b}`}</small>
          </div>
          <div class="factor-highlight">
            <span>${isEs ? 'Mínimo Común Múltiplo (MCM)' : 'Least Common Multiple (LCM)'}</span>
            <strong>${l.toLocaleString()}</strong>
            <small>${isEs ? `El menor múltiplo común de ${a} y ${b}` : `Smallest shared multiple of ${a} and ${b}`}</small>
          </div>
        </div>
      </section>
      <div class="factor-cards-grid">
        ${[{ num: a, f: fa, divs: da, prime: isPrimeA }, { num: b, f: fb, divs: db, prime: isPrimeB }].map(item => `
          <section class="card factor-detail-card">
            <div class="factor-detail-head">
              <h2>${item.num.toLocaleString()}</h2>
              <span class="factor-badge ${item.prime ? 'prime' : ''}">${item.num === 1 ? (isEs ? 'Unidad' : 'Unit') : item.prime ? (isEs ? 'Primo' : 'Prime') : (isEs ? 'Compuesto' : 'Composite')}</span>
            </div>
            <p class="factor-prime-expr"><strong>${isEs ? 'Factorización prima:' : 'Prime factorization:'}</strong> ${esc(formatFactors(item.f))}</p>
            <p class="factor-div-label">${isEs ? `Todos los divisores (${item.divs.length}):` : `All factors (${item.divs.length}):`}</p>
            <div class="factor-chips">${item.divs.slice(0, 48).map(d => `<span class="factor-chip ${g % d === 0 && d > 1 ? 'common' : ''}">${d}</span>`).join('')}${item.divs.length > 48 ? '<span class="factor-chip">…</span>' : ''}</div>
          </section>
        `).join('')}
      </div>
    </div>`;
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const nav = target.closest('[data-view="factor-lab"]');
    if (nav) {
      event.preventDefault();
      event.stopImmediatePropagation();
      render();
      document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item === nav));
      return;
    }
    if (!root.querySelector('.factor-lab-page')) return;

    if (target.closest('[data-factor-random]')) {
      const pairs = [[18, 24], [28, 42], [36, 48], [15, 25], [45, 75], [32, 80], [21, 35], [54, 72]];
      const pick = pairs[Math.floor(Math.random() * pairs.length)];
      state.a = pick[0]; state.b = pick[1];
      render();
    }
  }, true);

  document.addEventListener('input', event => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !root.querySelector('.factor-lab-page')) return;
    if (target.id === 'factor-a') { state.a = target.value; render(); }
    else if (target.id === 'factor-b') { state.b = target.value; render(); }
  });
})();
