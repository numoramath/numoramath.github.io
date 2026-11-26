(() => {
  const root = document.querySelector('#app-content');
  const pageTitle = document.querySelector('#page-title');
  if (!root || !pageTitle) return;

  const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const num = (v, fallback = 0) => { const n = Number(v); return Number.isFinite(n) ? n : fallback; };

  const state = {
    quad: { a: 1, b: -2, c: -3 },
    pyth: { a: 3, b: 4 },
    matrix: { a11: 2, a12: 1, a21: 3, a22: 4, b11: 1, b12: 5, b21: 2, b22: 0, op: 'add' },
    seq: { type: 'arith', a1: 2, step: 3, n: 6 },
    roman: { decimal: 2026, roman: 'MMXXVI' },
    venn: { a: '1, 2, 3, 4, 5', b: '3, 4, 5, 6, 7' },
    time: { start: '09:15', end: '14:40', addMin: 45 },
    stats: { raw: '4, 8, 6, 5, 3, 8, 9, 8' },
    vol: { shape: 'cylinder', r: 3, h: 7, l: 5, w: 4 },
    slopeQuiz: { x1: 1, y1: 3, x2: 3, y2: 7, mInput: '', bInput: '', feedback: '', score: 0, solved: false }
  };

  function newSlopeQuestion() {
    const m = [-3, -2, -1, 1, 2, 3][Math.floor(Math.random() * 6)];
    const b = Math.floor(Math.random() * 9) - 4;
    const x1 = Math.floor(Math.random() * 5) - 2;
    const x2 = x1 + 1 + Math.floor(Math.random() * 3);
    state.slopeQuiz = {
      ...state.slopeQuiz,
      x1, y1: m * x1 + b,
      x2, y2: m * x2 + b,
      mInput: '', bInput: '', feedback: '', solved: false
    };
  }

  function toRoman(n) {
    n = Math.max(1, Math.min(3999, Math.floor(n)));
    const map = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
    let out = '';
    for (const [val, sym] of map) { while (n >= val) { out += sym; n -= val; } }
    return out;
  }

  function fromRoman(str) {
    const vals = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
    const s = String(str || '').toUpperCase().replace(/[^IVXLCDM]/g, '');
    if (!s) return null;
    let total = 0;
    for (let i = 0; i < s.length; i++) {
      const cur = vals[s[i]], next = vals[s[i + 1]] || 0;
      total += cur < next ? -cur : cur;
    }
    return total > 0 && total <= 3999 && toRoman(total) === s ? total : null;
  }

  const views = {
    'quadratic-lab'() {
      pageTitle.textContent = 'Quadratic & parabola lab';
      const { a, b, c } = state.quad;
      const safeA = a === 0 ? 0.5 : a;
      const vx = Number((-b / (2 * safeA)).toFixed(2));
      const vy = Number((safeA * vx * vx + b * vx + c).toFixed(2));
      const disc = Number((b * b - 4 * safeA * c).toFixed(2));
      let rootsText = 'No real roots';
      if (disc === 0) rootsText = `x = ${vx}`;
      else if (disc > 0) {
        const r1 = Number(((-b - Math.sqrt(disc)) / (2 * safeA)).toFixed(2));
        const r2 = Number(((-b + Math.sqrt(disc)) / (2 * safeA)).toFixed(2));
        rootsText = `x = ${r1}, ${r2}`;
      }
      const pts = [];
      for (let x = -10; x <= 10; x += 0.25) {
        const y = safeA * x * x + b * x + c;
        pts.push(`${(180 + x * 16).toFixed(1)},${(180 - y * 16).toFixed(1)}`);
      }
      let grid = '';
      for (let i = -10; i <= 10; i++) {
        const p = 180 + i * 16;
        grid += `<line x1="${p}" y1="20" x2="${p}" y2="340" class="${i === 0 ? 'ml-axis' : 'ml-grid'}"/>`;
        grid += `<line x1="20" y1="${p}" x2="340" y2="${p}" class="${i === 0 ? 'ml-axis' : 'ml-grid'}"/>`;
      }
      root.innerHTML = `<div class="page-wrap ml-page"><div class="hero-row"><div><span class="eyebrow">ALGEBRA II</span><h1>Quadratic &amp; parabola lab</h1><p>Explore y = ax² + bx + c, vertex, discriminant, and real roots.</p></div></div>
      <div class="ml-two-col">
        <section class="card ml-card">
          <div class="ml-eq-tag">y = ${safeA}x² ${b >= 0 ? '+' : '−'} ${Math.abs(b)}x ${c >= 0 ? '+' : '−'} ${Math.abs(c)}</div>
          <svg viewBox="0 0 360 360" class="ml-svg"><defs><clipPath id="qclip"><rect x="20" y="20" width="320" height="320"/></clipPath></defs>${grid}<g clip-path="url(#qclip)"><polyline fill="none" stroke="var(--violet,#6356eb)" stroke-width="2.8" points="${pts.join(' ')}"/><circle cx="${180 + vx * 16}" cy="${180 - vy * 16}" r="5" fill="#e05b48"/></g></svg>
        </section>
        <section class="card ml-card">
          <label class="ml-slider">a: <strong>${safeA}</strong><input type="range" min="-3" max="3" step="0.5" value="${safeA}" data-ml="quad:a"></label>
          <label class="ml-slider">b: <strong>${b}</strong><input type="range" min="-6" max="6" step="1" value="${b}" data-ml="quad:b"></label>
          <label class="ml-slider">c: <strong>${c}</strong><input type="range" min="-6" max="6" step="1" value="${c}" data-ml="quad:c"></label>
          <div class="ml-stat-box"><div><small>Vertex</small><strong>(${vx}, ${vy})</strong></div><div><small>Discriminant</small><strong>${disc}</strong></div><div><small>Real roots</small><strong>${rootsText}</strong></div></div>
        </section>
      </div></div>`;
    },

    'pythagoras-lab'() {
      pageTitle.textContent = 'Pythagorean theorem lab';
      const { a, b } = state.pyth;
      const c = Number(Math.sqrt(a * a + b * b).toFixed(3));
      const isTriple = Number.isInteger(c);
      const scale = 180 / Math.max(a, b, 6);
      const w = a * scale, h = b * scale;
      root.innerHTML = `<div class="page-wrap ml-page"><div class="hero-row"><div><span class="eyebrow">GEOMETRY</span><h1>Pythagorean theorem lab</h1><p>Explore right triangles and see how a² + b² = c² works.</p></div></div>
      <div class="ml-two-col">
        <section class="card ml-card">
          <svg viewBox="0 0 280 240" class="ml-svg">
            <polygon points="40,200 ${40 + w},200 40,${200 - h}" fill="color-mix(in srgb,var(--violet,#6356eb) 14%,transparent)" stroke="var(--violet,#6356eb)" stroke-width="2.5"/>
            <rect x="40" y="186" width="14" height="14" fill="none" stroke="var(--ink,#18263b)" stroke-width="1.5"/>
            <text x="${40 + w / 2}" y="220" class="ml-svg-label">a = ${a}</text>
            <text x="26" y="${200 - h / 2}" class="ml-svg-label">b = ${b}</text>
            <text x="${48 + w / 2}" y="${195 - h / 2}" class="ml-svg-label">c = ${c}</text>
          </svg>
        </section>
        <section class="card ml-card">
          <label class="ml-slider">Leg a: <strong>${a}</strong><input type="range" min="1" max="15" step="1" value="${a}" data-ml="pyth:a"></label>
          <label class="ml-slider">Leg b: <strong>${b}</strong><input type="range" min="1" max="15" step="1" value="${b}" data-ml="pyth:b"></label>
          <div class="ml-result-card"><span>a² + b² = ${a * a} + ${b * b} = ${a * a + b * b}</span><strong>c = ${c}</strong><small>${isTriple ? '✦ Exact Pythagorean triple!' : `√${a * a + b * b} ≈ ${c}`}</small></div>
        </section>
      </div></div>`;
    },

    'matrix-lab'() {
      pageTitle.textContent = '2×2 Matrix lab';
      const m = state.matrix;
      let r11, r12, r21, r22;
      if (m.op === 'add') { r11 = m.a11 + m.b11; r12 = m.a12 + m.b12; r21 = m.a21 + m.b21; r22 = m.a22 + m.b22; }
      else if (m.op === 'sub') { r11 = m.a11 - m.b11; r12 = m.a12 - m.b12; r21 = m.a21 - m.b21; r22 = m.a22 - m.b22; }
      else { r11 = m.a11 * m.b11 + m.a12 * m.b21; r12 = m.a11 * m.b12 + m.a12 * m.b22; r21 = m.a21 * m.b11 + m.a22 * m.b21; r22 = m.a21 * m.b12 + m.a22 * m.b22; }
      const detA = m.a11 * m.a22 - m.a12 * m.a21;
      root.innerHTML = `<div class="page-wrap ml-page"><div class="hero-row"><div><span class="eyebrow">LINEAR ALGEBRA</span><h1>2×2 Matrix calculator</h1><p>Add, subtract, multiply 2×2 matrices and check determinants.</p></div></div>
      <section class="card ml-card">
        <div class="ml-matrix-row">
          <div><h3>Matrix A</h3><div class="ml-matrix-grid">${['a11','a12','a21','a22'].map(k => `<input type="number" value="${m[k]}" data-ml="matrix:${k}">`).join('')}</div><small>det(A) = ${detA} ${detA === 0 ? '(Singular)' : '(Invertible)'}</small></div>
          <div class="ml-matrix-ops">
            <button type="button" class="secondary-btn ${m.op==='add'?'active':''}" data-ml-op="add">A + B</button>
            <button type="button" class="secondary-btn ${m.op==='sub'?'active':''}" data-ml-op="sub">A − B</button>
            <button type="button" class="secondary-btn ${m.op==='mul'?'active':''}" data-ml-op="mul">A × B</button>
          </div>
          <div><h3>Matrix B</h3><div class="ml-matrix-grid">${['b11','b12','b21','b22'].map(k => `<input type="number" value="${m[k]}" data-ml="matrix:${k}">`).join('')}</div></div>
          <div class="ml-matrix-res"><h3>Result</h3><div class="ml-matrix-out"><span>${r11}</span><span>${r12}</span><span>${r21}</span><span>${r22}</span></div></div>
        </div>
      </section></div>`;
    },

    'sequence-lab'() {
      pageTitle.textContent = 'Sequences & patterns lab';
      const { type, a1, step, n } = state.seq;
      const terms = Array.from({ length: 8 }, (_, i) => type === 'arith' ? a1 + i * step : Number((a1 * Math.pow(step, i)).toFixed(3)));
      const nth = type === 'arith' ? a1 + (n - 1) * step : Number((a1 * Math.pow(step, n - 1)).toFixed(3));
      const sum = type === 'arith' ? (n * (a1 + nth)) / 2 : (step === 1 ? a1 * n : Number((a1 * (1 - Math.pow(step, n)) / (1 - step)).toFixed(3)));
      root.innerHTML = `<div class="page-wrap ml-page"><div class="hero-row"><div><span class="eyebrow">PATTERNS</span><h1>Sequences &amp; series lab</h1><p>Explore arithmetic and geometric progressions, nth terms, and sums.</p></div></div>
      <section class="card ml-card">
        <div class="ml-btn-group">
          <button type="button" class="secondary-btn ${type==='arith'?'active':''}" data-ml-seq="arith">Arithmetic (+ d)</button>
          <button type="button" class="secondary-btn ${type==='geom'?'active':''}" data-ml-seq="geom">Geometric (× r)</button>
        </div>
        <div class="ml-inputs-3">
          <label>First term (a₁)<input type="number" value="${a1}" data-ml="seq:a1"></label>
          <label>${type==='arith'?'Common difference (d)':'Common ratio (r)'}<input type="number" step="any" value="${step}" data-ml="seq:step"></label>
          <label>Find term n<input type="number" min="1" max="30" value="${n}" data-ml="seq:n"></label>
        </div>
        <div class="ml-chips">${terms.map((t, i) => `<span class="ml-chip">a<sub>${i + 1}</sub> = ${t}</span>`).join('')}</div>
        <div class="ml-result-card"><span>Term a<sub>${n}</sub> = <strong>${nth}</strong></span><small>Sum of first ${n} terms: <b>${sum}</b></small></div>
      </section></div>`;
    },

    'roman-lab'() {
      pageTitle.textContent = 'Roman numerals & bases';
      const d = Math.max(1, Math.min(3999, Math.floor(num(state.roman.decimal, 1))));
      const r = toRoman(d);
      const parsed = fromRoman(state.roman.roman);
      root.innerHTML = `<div class="page-wrap ml-page"><div class="hero-row"><div><span class="eyebrow">NUMBER SYSTEMS</span><h1>Roman numerals &amp; bases</h1><p>Convert between standard numbers, Roman numerals, binary, and hex.</p></div></div>
      <div class="ml-two-col">
        <section class="card ml-card">
          <h2>Decimal → Bases</h2>
          <label class="ml-field">Number (1–3999)<input type="number" min="1" max="3999" value="${d}" data-ml-raw="roman:decimal"></label>
          <div class="ml-stat-box"><div><small>Roman</small><strong>${r}</strong></div><div><small>Binary (Base 2)</small><strong>${d.toString(2)}</strong></div><div><small>Hex (Base 16)</small><strong>${d.toString(16).toUpperCase()}</strong></div></div>
        </section>
        <section class="card ml-card">
          <h2>Roman → Decimal</h2>
          <label class="ml-field">Roman numeral<input type="text" value="${esc(state.roman.roman)}" data-ml-raw="roman:roman" placeholder="MMXXVI"></label>
          <div class="ml-result-card"><strong>${parsed ?? 'Invalid Roman numeral'}</strong><small>Valid symbols: I, V, X, L, C, D, M</small></div>
        </section>
      </div></div>`;
    },

    'venn-lab'() {
      pageTitle.textContent = 'Venn diagram & sets lab';
      const parseSet = s => [...new Set(String(s || '').split(',').map(x => x.trim()).filter(Boolean))];
      const A = parseSet(state.venn.a), B = parseSet(state.venn.b);
      const setB = new Set(B), setA = new Set(A);
      const inter = A.filter(x => setB.has(x));
      const onlyA = A.filter(x => !setB.has(x));
      const onlyB = B.filter(x => !setA.has(x));
      const union = [...new Set([...A, ...B])];
      root.innerHTML = `<div class="page-wrap ml-page"><div class="hero-row"><div><span class="eyebrow">SET THEORY</span><h1>Venn diagram &amp; sets lab</h1><p>Compare two sets to find their union, intersection, and differences.</p></div></div>
      <div class="ml-two-col">
        <section class="card ml-card">
          <svg viewBox="0 0 320 200" class="ml-svg">
            <circle cx="120" cy="100" r="70" fill="color-mix(in srgb,#6356eb 22%,transparent)" stroke="#6356eb" stroke-width="2.5"/>
            <circle cx="200" cy="100" r="70" fill="color-mix(in srgb,#0e9f7e 22%,transparent)" stroke="#0e9f7e" stroke-width="2.5"/>
            <text x="85" y="100" class="ml-svg-label">${onlyA.join(', ') || '∅'}</text>
            <text x="160" y="100" class="ml-svg-label">${inter.join(', ') || '∅'}</text>
            <text x="235" y="100" class="ml-svg-label">${onlyB.join(', ') || '∅'}</text>
          </svg>
        </section>
        <section class="card ml-card">
          <label class="ml-field">Set A (comma-separated)<input type="text" value="${esc(state.venn.a)}" data-ml-raw="venn:a"></label>
          <label class="ml-field">Set B (comma-separated)<input type="text" value="${esc(state.venn.b)}" data-ml-raw="venn:b"></label>
          <div class="ml-list-results">
            <p><strong>A ∪ B (Union):</strong> { ${esc(union.join(', '))} }</p>
            <p><strong>A ∩ B (Intersection):</strong> { ${esc(inter.join(', '))} }</p>
            <p><strong>A − B (Only A):</strong> { ${esc(onlyA.join(', '))} }</p>
            <p><strong>B − A (Only B):</strong> { ${esc(onlyB.join(', '))} }</p>
          </div>
        </section>
      </div></div>`;
    },

    'time-lab'() {
      pageTitle.textContent = 'Elapsed time & clock lab';
      const toMins = t => { const [h, m] = String(t || '00:00').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
      const s = toMins(state.time.start), e = toMins(state.time.end);
      const diff = e >= s ? e - s : 1440 - s + e;
      const dh = Math.floor(diff / 60), dm = diff % 60;
      const added = (s + Math.floor(num(state.time.addMin, 0))) % 1440;
      const ah = String(Math.floor((added + 1440) % 1440 / 60)).padStart(2, '0');
      const am = String((added + 1440) % 60).padStart(2, '0');
      root.innerHTML = `<div class="page-wrap ml-page"><div class="hero-row"><div><span class="eyebrow">MEASUREMENT</span><h1>Elapsed time &amp; clock lab</h1><p>Find exact elapsed hours and minutes or add minutes to any time.</p></div></div>
      <div class="ml-two-col">
        <section class="card ml-card">
          <h2>Elapsed time</h2>
          <div class="ml-inputs-2">
            <label>Start time<input type="time" value="${esc(state.time.start)}" data-ml-raw="time:start"></label>
            <label>End time<input type="time" value="${esc(state.time.end)}" data-ml-raw="time:end"></label>
          </div>
          <div class="ml-result-card"><strong>${dh} hr ${dm} min</strong><small>Total: ${diff} minutes</small></div>
        </section>
        <section class="card ml-card">
          <h2>Add minutes to start time</h2>
          <label class="ml-field">Minutes to add<input type="number" value="${num(state.time.addMin, 0)}" data-ml-raw="time:addMin"></label>
          <div class="ml-result-card"><strong>${ah}:${am}</strong><small>24-hour clock result</small></div>
        </section>
      </div></div>`;
    },

    'stats-lab'() {
      pageTitle.textContent = 'Statistics & summary lab';
      const vals = String(state.stats.raw || '').split(',').map(x => Number(x.trim())).filter(Number.isFinite).sort((a, b) => a - b);
      const n = vals.length;
      const mean = n ? Number((vals.reduce((a, b) => a + b, 0) / n).toFixed(2)) : 0;
      const median = !n ? 0 : n % 2 ? vals[(n - 1) / 2] : Number(((vals[n / 2 - 1] + vals[n / 2]) / 2).toFixed(2));
      const freq = new Map();
      vals.forEach(v => freq.set(v, (freq.get(v) || 0) + 1));
      const maxF = Math.max(0, ...freq.values());
      const modes = maxF > 1 ? [...freq.entries()].filter(([, c]) => c === maxF).map(([v]) => v).join(', ') : 'None';
      const range = n ? Number((vals[n - 1] - vals[0]).toFixed(2)) : 0;
      const sd = n ? Number(Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / n).toFixed(2)) : 0;
      root.innerHTML = `<div class="page-wrap ml-page"><div class="hero-row"><div><span class="eyebrow">DATA &amp; STATISTICS</span><h1>Statistics &amp; summary lab</h1><p>Enter a dataset to compute mean, median, mode, range, and standard deviation.</p></div></div>
      <section class="card ml-card">
        <label class="ml-field">Numbers (comma-separated)<input type="text" value="${esc(state.stats.raw)}" data-ml-raw="stats:raw"></label>
        <div class="ml-stat-box">
          <div><small>Mean</small><strong>${mean}</strong></div>
          <div><small>Median</small><strong>${median}</strong></div>
          <div><small>Mode</small><strong>${modes}</strong></div>
          <div><small>Range</small><strong>${range}</strong></div>
          <div><small>Std Dev (σ)</small><strong>${sd}</strong></div>
          <div><small>Count (n)</small><strong>${n}</strong></div>
        </div>
      </section></div>`;
    },

    'volume3d-lab'() {
      pageTitle.textContent = '3D Volume & surface area';
      const { shape, r, h, l, w } = state.vol;
      let vol = 0, sa = 0, formula = '';
      if (shape === 'cube') { vol = r ** 3; sa = 6 * r * r; formula = 'V = s³, SA = 6s²'; }
      else if (shape === 'prism') { vol = l * w * h; sa = 2 * (l * w + l * h + w * h); formula = 'V = lwh, SA = 2(lw + lh + wh)'; }
      else if (shape === 'cylinder') { vol = Math.PI * r * r * h; sa = 2 * Math.PI * r * (r + h); formula = 'V = πr²h, SA = 2πr(r + h)'; }
      else if (shape === 'cone') { const slant = Math.sqrt(r * r + h * h); vol = (Math.PI * r * r * h) / 3; sa = Math.PI * r * (r + slant); formula = 'V = ⅓πr²h, SA = πr(r + l)'; }
      else { vol = (4 / 3) * Math.PI * r ** 3; sa = 4 * Math.PI * r * r; formula = 'V = ⁴⁄₃πr³, SA = 4πr²'; }
      root.innerHTML = `<div class="page-wrap ml-page"><div class="hero-row"><div><span class="eyebrow">3D GEOMETRY</span><h1>3D Volume &amp; surface area</h1><p>Explore solids, dimensions, formulas, volume, and surface area.</p></div></div>
      <section class="card ml-card">
        <div class="ml-btn-group">${[['cube','Cube'],['prism','Prism'],['cylinder','Cylinder'],['cone','Cone'],['sphere','Sphere']].map(([id, label]) => `<button type="button" class="secondary-btn ${shape===id?'active':''}" data-ml-shape="${id}">${label}</button>`).join('')}</div>
        <div class="ml-inputs-3">
          <label>${shape==='cube'?'Side (s)':'Radius (r)'}<input type="number" min="0.5" step="0.5" value="${r}" data-ml="vol:r"></label>
          ${['prism','cylinder','cone'].includes(shape) ? `<label>Height (h)<input type="number" min="0.5" step="0.5" value="${h}" data-ml="vol:h"></label>` : ''}
          ${shape === 'prism' ? `<label>Length (l)<input type="number" min="0.5" step="0.5" value="${l}" data-ml="vol:l"></label><label>Width (w)<input type="number" min="0.5" step="0.5" value="${w}" data-ml="vol:w"></label>` : ''}
        </div>
        <div class="ml-stat-box"><div><small>Volume</small><strong>${vol.toFixed(2)}</strong></div><div><small>Surface Area</small><strong>${sa.toFixed(2)}</strong></div><div><small>Formulas</small><strong>${formula}</strong></div></div>
      </section></div>`;
    },

    'slope-quiz-lab'() {
      pageTitle.textContent = 'Slope & equation challenge';
      const q = state.slopeQuiz;
      root.innerHTML = `<div class="page-wrap ml-page"><div class="hero-row"><div><span class="eyebrow">ALGEBRA CHALLENGE</span><h1>Slope &amp; equation challenge</h1><p>Find the line y = mx + b passing through the two points and earn +10 XP.</p></div><div class="ml-score"><strong>${q.score}</strong><span>solved</span></div></div>
      <section class="card ml-card">
        <h2 class="ml-quiz-prompt">Points: (${q.x1}, ${q.y1}) and (${q.x2}, ${q.y2})</h2>
        <div class="ml-inputs-2">
          <label>Slope (m)<input type="number" step="any" value="${esc(q.mInput)}" data-ml-raw="slopeQuiz:mInput" placeholder="e.g. 2"></label>
          <label>y-intercept (b)<input type="number" step="any" value="${esc(q.bInput)}" data-ml-raw="slopeQuiz:bInput" placeholder="e.g. 1"></label>
        </div>
        <div class="ml-btn-group" style="margin-top:14px">
          <button type="button" class="primary-btn" data-ml-slope="check" ${q.solved?'disabled':''}>Check equation</button>
          <button type="button" class="secondary-btn" data-ml-slope="new">New points →</button>
        </div>
        <p class="ml-feedback">${esc(q.feedback)}</p>
      </section></div>`;
    }
  };

  let activeView = null;
  function renderCurrent() { if (activeView && views[activeView]) views[activeView](); }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const nav = target.closest('[data-view]');
    if (nav && views[nav.dataset.view]) {
      event.preventDefault();
      event.stopImmediatePropagation();
      activeView = nav.dataset.view;
      renderCurrent();
      document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item === nav));
      return;
    }
    if (!root.querySelector('.ml-page')) return;

    const op = target.closest('[data-ml-op]');
    if (op) { state.matrix.op = op.dataset.mlOp; renderCurrent(); return; }
    const seq = target.closest('[data-ml-seq]');
    if (seq) { state.seq.type = seq.dataset.mlSeq; renderCurrent(); return; }
    const shape = target.closest('[data-ml-shape]');
    if (shape) { state.vol.shape = shape.dataset.mlShape; renderCurrent(); return; }
    const slopeAct = target.closest('[data-ml-slope]');
    if (slopeAct) {
      if (slopeAct.dataset.mlSlope === 'new') { newSlopeQuestion(); renderCurrent(); return; }
      const q = state.slopeQuiz;
      const trueM = (q.y2 - q.y1) / (q.x2 - q.x1);
      const trueB = q.y1 - trueM * q.x1;
      if (Number(q.mInput) === trueM && Number(q.bInput) === trueB) {
        q.solved = true; q.score++;
        q.feedback = `Correct! y = ${trueM}x ${trueB >= 0 ? '+' : '−'} ${Math.abs(trueB)} (+10 XP)`;
        if (typeof window.setXpBalance === 'function' && typeof window.getXpBalance === 'function') {
          window.setXpBalance(window.getXpBalance() + 10, 'Slope challenge');
        }
        window.showToast?.('Correct! +10 XP');
      } else {
        q.feedback = `Not quite — use m = (${q.y2} − ${q.y1}) ÷ (${q.x2} − ${q.x1}).`;
      }
      renderCurrent();
    }
  }, true);

  document.addEventListener('input', event => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !root.querySelector('.ml-page')) return;
    if (target.dataset.ml) {
      const [group, key] = target.dataset.ml.split(':');
      state[group][key] = Number(target.value);
      renderCurrent();
    } else if (target.dataset.mlRaw) {
      const [group, key] = target.dataset.mlRaw.split(':');
      state[group][key] = target.value;
      if (group !== 'slopeQuiz') renderCurrent();
    }
  });
})();
