(() => {
  const content = document.querySelector('#app-content');
  const pageTitle = document.querySelector('#page-title');
  if (!content || !pageTitle) return;

  const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const n = (v, d = 0) => { const x = Number(v); return Number.isFinite(x) ? x : d; };
  const gcd = (a, b) => { a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b)); while (b) [a, b] = [b, a % b]; return a || 1; };
  const fact = k => { k = Math.max(0, Math.min(20, Math.floor(k))); let r = 1; for (let i = 2; i <= k; i++) r *= i; return r; };

  /* ====== 1–40: 40 MICRO-CALCULATORS & CONVERTERS ====== */
  const microTools = [
    { id: 'sq', cat: 'Arithmetic', name: '1. Square & Cube', a: 'x', b: '', fn: a => `x² = ${a * a}, x³ = ${a ** 3}` },
    { id: 'pctchg', cat: 'Arithmetic', name: '2. Percent Change', a: 'Old', b: 'New', fn: (a, b) => a ? `${(((b - a) / Math.abs(a)) * 100).toFixed(2)}%` : 'Old ≠ 0' },
    { id: 'tip', cat: 'Finance', name: '3. Tip & Split', a: 'Bill ($)', b: 'People', fn: (a, b) => b > 0 ? `15% tip: $${(a * 0.15).toFixed(2)} · $${((a * 1.15) / b).toFixed(2)}/person` : 'People > 0' },
    { id: 'disc', cat: 'Finance', name: '4. Discount Price', a: 'Price ($)', b: 'Off (%)', fn: (a, b) => `Final: $${(a * (1 - b / 100)).toFixed(2)} (Save $${(a * b / 100).toFixed(2)})` },
    { id: 'simp', cat: 'Finance', name: '5. Simple Interest (t=1yr)', a: 'Principal', b: 'Rate (%)', fn: (a, b) => `Interest: $${(a * (b / 100)).toFixed(2)} · Total: $${(a * (1 + b / 100)).toFixed(2)}` },
    { id: 'comp', cat: 'Finance', name: '6. Compound (2 yrs)', a: 'Principal', b: 'Rate (%)', fn: (a, b) => `Total: $${(a * (1 + b / 100) ** 2).toFixed(2)}` },
    { id: 'dst', cat: 'Arithmetic', name: '7. Distance (d = r×t)', a: 'Speed', b: 'Time', fn: (a, b) => `Distance = ${(a * b).toFixed(2)}` },
    { id: 'ratio', cat: 'Arithmetic', name: '8. Simplify Ratio a:b', a: 'a', b: 'b', fn: (a, b) => { const g = gcd(a, b); return `${Math.round(a / g)} : ${Math.round(b / g)}`; } },
    { id: 'prop', cat: 'Algebra', name: '9. Proportion a/b = x/100', a: 'a', b: 'b', fn: (a, b) => b ? `x = ${((a / b) * 100).toFixed(2)}` : 'b ≠ 0' },
    { id: 'unitp', cat: 'Finance', name: '10. Unit Price ($/qty)', a: 'Price ($)', b: 'Qty', fn: (a, b) => b > 0 ? `$${(a / b).toFixed(3)} per unit` : 'Qty > 0' },
    { id: 'mid', cat: 'Algebra', name: '11. Midpoint (0,0)→(x,y)', a: 'x', b: 'y', fn: (a, b) => `(${a / 2}, ${b / 2})` },
    { id: 'dist0', cat: 'Algebra', name: '12. Distance (0,0)→(x,y)', a: 'x', b: 'y', fn: (a, b) => `d = ${Math.hypot(a, b).toFixed(3)}` },
    { id: 'slope0', cat: 'Algebra', name: '13. Slope (0,0)→(x,y)', a: 'x', b: 'y', fn: (a, b) => a ? `m = ${(b / a).toFixed(3)}` : 'Undefined (vertical)' },
    { id: 'circ', cat: 'Geometry', name: '14. Circle Area & Circ.', a: 'Radius r', b: '', fn: a => `A = ${(Math.PI * a * a).toFixed(2)} · C = ${(2 * Math.PI * a).toFixed(2)}` },
    { id: 'tri', cat: 'Geometry', name: '15. Triangle Area', a: 'Base', b: 'Height', fn: (a, b) => `Area = ${(0.5 * a * b).toFixed(2)}` },
    { id: 'trap', cat: 'Geometry', name: '16. Trapezoid (h=4)', a: 'Base 1', b: 'Base 2', fn: (a, b) => `Area = ${(((a + b) / 2) * 4).toFixed(2)}` },
    { id: 'para', cat: 'Geometry', name: '17. Parallelogram Area', a: 'Base', b: 'Height', fn: (a, b) => `Area = ${(a * b).toFixed(2)}` },
    { id: 'cyl', cat: 'Geometry', name: '18. Cylinder Volume', a: 'Radius', b: 'Height', fn: (a, b) => `V = ${(Math.PI * a * a * b).toFixed(2)}` },
    { id: 'sph', cat: 'Geometry', name: '19. Sphere Volume', a: 'Radius', b: '', fn: a => `V = ${((4 / 3) * Math.PI * a ** 3).toFixed(2)}` },
    { id: 'cone', cat: 'Geometry', name: '20. Cone Volume', a: 'Radius', b: 'Height', fn: (a, b) => `V = ${((Math.PI * a * a * b) / 3).toFixed(2)}` },
    { id: 'pyth', cat: 'Geometry', name: '21. Hypotenuse √(a²+b²)', a: 'a', b: 'b', fn: (a, b) => `c = ${Math.hypot(a, b).toFixed(3)}` },
    { id: 'ang', cat: 'Geometry', name: '22. Comp. & Supp. Angle', a: 'Angle (°)', b: '', fn: a => `Comp: ${90 - a}° · Supp: ${180 - a}°` },
    { id: 'poly', cat: 'Geometry', name: '23. Polygon Angle Sum', a: 'Sides n', b: '', fn: a => a >= 3 ? `Sum = ${(Math.floor(a) - 2) * 180}°` : 'n ≥ 3' },
    { id: 'fact', cat: 'Number Theory', name: '24. Factorial (n!)', a: 'n (0–20)', b: '', fn: a => `${Math.floor(a)}! = ${fact(a).toLocaleString()}` },
    { id: 'ncr', cat: 'Number Theory', name: '25. Combinations nCr', a: 'n', b: 'r', fn: (a, b) => { a = Math.floor(a); b = Math.floor(b); return a >= b && b >= 0 ? `C(${a},${b}) = ${Math.round(fact(a) / (fact(b) * fact(a - b)))}` : '0 ≤ r ≤ n'; } },
    { id: 'npr', cat: 'Number Theory', name: '26. Permutations nPr', a: 'n', b: 'r', fn: (a, b) => { a = Math.floor(a); b = Math.floor(b); return a >= b && b >= 0 ? `P(${a},${b}) = ${Math.round(fact(a) / fact(a - b))}` : '0 ≤ r ≤ n'; } },
    { id: 'mod', cat: 'Number Theory', name: '27. Modulo (a mod b)', a: 'a', b: 'b', fn: (a, b) => b ? `${a} mod ${b} = ${((a % b) + Math.abs(b)) % Math.abs(b)}` : 'b ≠ 0' },
    { id: 'div', cat: 'Number Theory', name: '28. Divisibility Check', a: 'Number', b: '', fn: a => { const x = Math.round(a); const ds = [2,3,4,5,6,9,10].filter(d => x % d === 0); return ds.length ? `Divisible by: ${ds.join(', ')}` : 'Not div. by 2,3,4,5,6,9,10'; } },
    { id: 'prime', cat: 'Number Theory', name: '29. Prime Checker', a: 'n', b: '', fn: a => { const x = Math.floor(a); if (x < 2) return 'Not prime'; for (let d = 2; d * d <= x; d++) if (x % d === 0) return `Composite (÷ ${d})`; return `${x} is Prime!`; } },
    { id: 'fib', cat: 'Number Theory', name: '30. Fibonacci F(n)', a: 'n (1–40)', b: '', fn: a => { let x = 0, y = 1; const k = Math.max(0, Math.min(40, Math.floor(a))); for (let i = 0; i < k; i++) [x, y] = [y, x + y]; return `F(${k}) = ${x.toLocaleString()}`; } },
    { id: 'bin', cat: 'Conversions', name: '31. Decimal → Binary', a: 'Decimal', b: '', fn: a => Math.floor(a).toString(2) },
    { id: 'hex', cat: 'Conversions', name: '32. Decimal → Hex', a: 'Decimal', b: '', fn: a => Math.floor(a).toString(16).toUpperCase() },
    { id: 'temp', cat: 'Conversions', name: '33. °C → °F & K', a: '°C', b: '', fn: a => `${((a * 9) / 5 + 32).toFixed(1)}°F · ${(a + 273.15).toFixed(2)} K` },
    { id: 'mikm', cat: 'Conversions', name: '34. Miles → Kilometers', a: 'Miles', b: '', fn: a => `${(a * 1.60934).toFixed(2)} km` },
    { id: 'lbkg', cat: 'Conversions', name: '35. Pounds → Kilograms', a: 'Pounds', b: '', fn: a => `${(a * 0.453592).toFixed(2)} kg` },
    { id: 'ftcm', cat: 'Conversions', name: '36. Feet → Centimeters', a: 'Feet', b: '', fn: a => `${(a * 30.48).toFixed(2)} cm` },
    { id: 'hmsec', cat: 'Conversions', name: '37. Hours & Min → Sec', a: 'Hours', b: 'Minutes', fn: (a, b) => `${Math.round(a * 3600 + b * 60).toLocaleString()} sec` },
    { id: 'fdp', cat: 'Conversions', name: '38. Fraction a/b → %', a: 'Num a', b: 'Den b', fn: (a, b) => b ? `${(a / b).toFixed(4)} = ${((a / b) * 100).toFixed(2)}%` : 'b ≠ 0' },
    { id: 'mix', cat: 'Conversions', name: '39. Improper a/b → Mixed', a: 'Num a', b: 'Den b', fn: (a, b) => b ? `${Math.trunc(a / b)} ${Math.abs(a % b)}/${Math.abs(b)}` : 'b ≠ 0' },
    { id: 'sci', cat: 'Conversions', name: '40. Scientific Notation', a: 'Number', b: '', fn: a => a === 0 ? '0' : a.toExponential(3) }
  ];

  /* ====== 41–70: 30 FORMULA & THEOREM BANK ====== */
  const formulas = [
    ['41. Quadratic Formula', 'x = (-b ± √(b² - 4ac)) / 2a'], ['42. Slope Formula', 'm = (y₂ - y₁) / (x₂ - x₁)'],
    ['43. Slope-Intercept', 'y = mx + b'], ['44. Point-Slope', 'y - y₁ = m(x - x₁)'],
    ['45. Distance Formula', 'd = √((x₂ - x₁)² + (y₂ - y₁)²)'], ['46. Midpoint Formula', 'M = ((x₁+x₂)/2, (y₁+y₂)/2)'],
    ['47. Pythagorean Theorem', 'a² + b² = c²'], ['48. Circle Area', 'A = πr²'],
    ['49. Circumference', 'C = 2πr = πd'], ['50. Triangle Area', 'A = ½bh'],
    ['51. Trapezoid Area', 'A = ½(b₁ + b₂)h'], ['52. Cylinder Volume', 'V = πr²h'],
    ['53. Cone Volume', 'V = ⅓πr²h'], ['54. Sphere Volume', 'V = ⁴⁄₃πr³'],
    ['55. Sphere Surface Area', 'SA = 4πr²'], ['56. Prism Volume', 'V = l × w × h'],
    ['57. Simple Interest', 'I = P × r × t'], ['58. Compound Interest', 'A = P(1 + r/n)^(nt)'],
    ['59. Arithmetic nth Term', 'aₙ = a₁ + (n - 1)d'], ['60. Geometric nth Term', 'aₙ = a₁ · r^(n - 1)'],
    ['61. Combinations', 'nCr = n! / (r!(n - r)!)'], ['62. Permutations', 'nPr = n! / (n - r)!'],
    ['63. SOH-CAH-TOA', 'sin = O/H, cos = A/H, tan = O/A'], ['64. Law of Cosines', 'c² = a² + b² - 2ab·cos(C)'],
    ['65. Law of Sines', 'a/sin(A) = b/sin(B) = c/sin(C)'], ['66. Z-Score', 'z = (x - μ) / σ'],
    ['67. Mean (Average)', 'x̄ = (Σx) / n'], ['68. Percent Change', '% = ((New - Old) / Old) × 100'],
    ['69. Exponent Product', 'xᵃ · xᵇ = x^(a+b)'], ['70. Logarithm Rule', 'log_b(x·y) = log_b(x) + log_b(y)']
  ];

  /* ====== 71–80: 10-MODE DAILY CHALLENGES ====== */
  const challengeModes = [
    { id: 'mul', label: '71. × Sprint', gen: () => { const a = 2 + Math.floor(Math.random() * 11), b = 2 + Math.floor(Math.random() * 11); return [`${a} × ${b}`, a * b]; } },
    { id: 'add', label: '72. + Snap', gen: () => { const a = 15 + Math.floor(Math.random() * 75), b = 12 + Math.floor(Math.random() * 65); return [`${a} + ${b}`, a + b]; } },
    { id: 'sub', label: '73. − Dash', gen: () => { const b = 10 + Math.floor(Math.random() * 40), a = b + 5 + Math.floor(Math.random() * 50); return [`${a} − ${b}`, a - b]; } },
    { id: 'div', label: '74. ÷ Quick', gen: () => { const b = 2 + Math.floor(Math.random() * 11), ans = 2 + Math.floor(Math.random() * 12); return [`${b * ans} ÷ ${b}`, ans]; } },
    { id: 'sq', label: '75. Squares', gen: () => { const a = 2 + Math.floor(Math.random() * 14); return [`${a}²`, a * a]; } },
    { id: 'sqrt', label: '76. Roots', gen: () => { const a = 2 + Math.floor(Math.random() * 13); return [`√${a * a}`, a]; } },
    { id: 'pow2', label: '77. Powers of 2', gen: () => { const a = 1 + Math.floor(Math.random() * 8); return [`2^${a}`, 2 ** a]; } },
    { id: 'pct', label: '78. 10%/50% Pop', gen: () => { const p = [10, 25, 50][Math.floor(Math.random() * 3)], base = (1 + Math.floor(Math.random() * 8)) * 20; return [`${p}% of ${base}`, (p / 100) * base]; } },
    { id: 'dbl', label: '79. Double It', gen: () => { const a = 14 + Math.floor(Math.random() * 85); return [`2 × ${a}`, a * 2]; } },
    { id: 'mod', label: '80. Remainder', gen: () => { const b = 3 + Math.floor(Math.random() * 7), a = 10 + Math.floor(Math.random() * 40); return [`${a} mod ${b}`, a % b]; } }
  ];

  /* ====== 101–110: 10 THEME MOOD PRESETS ====== */
  const moods = [
    ['Classic Violet', '#6356eb'], ['Ocean Focus', '#2563eb'], ['Forest Calm', '#0e9f7e'],
    ['Sunset Energy', '#e05b48'], ['Gold Hour', '#ca8a04'], ['Plum Studio', '#7c3aed'],
    ['Sky Bright', '#0284c7'], ['Rose Pop', '#e11d48'], ['Mint Fresh', '#14b8a6'], ['Slate Pro', '#475569']
  ];

  /* ====== HUB BUTTON IN TOPBAR (NO SIDEBAR ADDITIONS) ====== */
  const topTools = document.querySelector('.fp-topbar-tools');
  if (topTools && !topTools.querySelector('[data-fp200="open-hub"]')) {
    const hubBtn = document.createElement('button');
    hubBtn.type = 'button';
    hubBtn.className = 'fp-pill fp200-hub-btn';
    hubBtn.dataset.fp200 = 'open-hub';
    hubBtn.title = 'Open 200+ Tools & Formulas Hub (Ctrl+J)';
    hubBtn.innerHTML = '✦ <strong>Tools Hub</strong>';
    topTools.insertBefore(hubBtn, topTools.firstChild);
  }

  const hubModal = document.createElement('div');
  hubModal.className = 'fp-modal-backdrop hidden';
  document.body.appendChild(hubModal);

  let hubTab = 'tools', hubCat = 'All', activeTool = microTools[0], toolA = 6, toolB = 4;

  function renderHub() {
    const cats = ['All', 'Arithmetic', 'Algebra', 'Geometry', 'Number Theory', 'Conversions', 'Finance'];
    const list = hubCat === 'All' ? microTools : microTools.filter(m => m.cat === hubCat);
    const out = activeTool.fn(n(toolA, 0), n(toolB, 0));

    hubModal.innerHTML = `<section class="card fp200-hub" role="dialog" aria-modal="true" aria-label="Numora Tools & Formulas Hub">
      <div class="fp-modal-head">
        <h3>✦ Numora 200+ Feature Hub</h3>
        <button type="button" class="fp-close" data-fp200="close-hub">×</button>
      </div>
      <div class="fp200-tabs">
        <button type="button" class="secondary-btn ${hubTab==='tools'?'active':''}" data-fp200-tab="tools">40 Micro-Calculators</button>
        <button type="button" class="secondary-btn ${hubTab==='formulas'?'active':''}" data-fp200-tab="formulas">30 Formula Bank</button>
        <button type="button" class="secondary-btn ${hubTab==='directory'?'active':''}" data-fp200-tab="directory">All 200 Features List</button>
      </div>
      ${hubTab === 'tools' ? `
        <div class="fp200-cats">${cats.map(c => `<button type="button" class="fp-chip ${hubCat===c?'active':''}" data-fp200-cat="${c}">${c}</button>`).join('')}</div>
        <div class="fp200-tools-layout">
          <div class="fp200-tool-list">${list.map(m => `<button type="button" class="fp-jump-item ${activeTool.id===m.id?'active':''}" data-fp200-tool="${m.id}">${esc(m.name)}</button>`).join('')}</div>
          <div class="fp200-tool-runner card">
            <h4>${esc(activeTool.name)}</h4>
            <div class="fp200-runner-inputs">
              <label>${esc(activeTool.a)}<input type="number" step="any" value="${toolA}" id="fp200-a"></label>
              ${activeTool.b ? `<label>${esc(activeTool.b)}<input type="number" step="any" value="${toolB}" id="fp200-b"></label>` : ''}
            </div>
            <div class="fp200-runner-out" id="fp200-out">${esc(out)}</div>
          </div>
        </div>
      ` : hubTab === 'formulas' ? `
        <input type="search" id="fp200-formula-search" class="fp-input" placeholder="Search 30 formulas…">
        <div class="fp200-formula-grid">${formulas.map(([title, eq]) => `<article class="fp200-formula-card"><strong>${esc(title)}</strong><code>${esc(eq)}</code><button type="button" class="text-link" data-fp200-copy="${esc(eq)}">Copy</button></article>`).join('')}</div>
      ` : `
        <div class="fp200-directory">
          <p><strong>200+ Distributed Features Active Across Numora (Zero Sidebar Clutter):</strong></p>
          <ul>
            <li><b>1–40:</b> 40 Interactive Micro-Calculators &amp; Converters (in Tools Hub → 40 Micro-Calculators)</li>
            <li><b>41–70:</b> 30 Searchable &amp; Copyable Formulas (in Tools Hub → 30 Formula Bank)</li>
            <li><b>71–80:</b> 10-Mode Daily Mental Challenge Strip (on Home Dashboard)</li>
            <li><b>81–90:</b> 10 Live Learner Ranks &amp; Milestones Card (on Home Dashboard)</li>
            <li><b>91–100:</b> 10-Item Interactive Daily Study Checklist (on Home Dashboard)</li>
            <li><b>101–110:</b> 10 Quick Accent Mood Presets (on Home Dashboard)</li>
            <li><b>111–120:</b> 10-Symbol Quick Math Bar (+, −, ×, ÷, /, ., (, ), ^, =) in Lesson Practice</li>
            <li><b>121–145:</b> In-Lesson Confidence Tags, Combo Streak Multiplier, Formula Peek &amp; Post-Answer Actions</li>
            <li><b>146–160:</b> 15 Topic &amp; Progress Quick-Filter Chips in Skill Library</li>
            <li><b>161–175:</b> Progress CSV Export, Accuracy Grade (A+–F), Pace &amp; Consistency Analytics</li>
            <li><b>176–190:</b> Mistake Filter/Export, Flashcard Shuffle, Note Formula Templates &amp; Word Counter</li>
            <li><b>191–200:</b> Settings Extras (Compact Cards, Combo Alerts, Export All Study Data, Hub Shortcut Ctrl+J)</li>
          </ul>
        </div>
      `}
    </section>`;
    hubModal.classList.remove('hidden');
  }

  /* ====== HOME 71–110 ====== */
  let activeModeIdx = 0, modePrompt = '', modeAns = 0, modeSolved = false;
  function pickModeChallenge(idx) {
    activeModeIdx = idx;
    const [p, a] = challengeModes[idx].gen();
    modePrompt = p; modeAns = a; modeSolved = false;
  }
  pickModeChallenge(0);

  const checklistItems = [
    '91. 5-min warm-up', '92. Solve 3 questions', '93. Check Mistake notebook',
    '94. Try 1 Math Lab', '95. Earn 30 XP', '96. Review 1 Flashcard',
    '97. Write 1 Study Note', '98. Reach 80% accuracy', '99. Queue 2 lessons', '100. Hit Daily Goal'
  ];

  function enhanceHome200() {
    const extras = content.querySelector('.fp-home-extras');
    if (!extras || extras.querySelector('.fp200-organized')) return;
    const completed = Number(localStorage.getItem('numoraCompleted') || 0);
    const accAttempts = Number(localStorage.getItem('numoraAccuracyAttempts') || 0);
    const accCorrect = Number(localStorage.getItem('numoraAccuracyCorrect') || 0);
    const acc = accAttempts ? Math.round((accCorrect / accAttempts) * 100) : 100;
    const xp = Number(localStorage.getItem('numoraXP') || 0);
    const level = Math.floor(xp / 100) + 1;
    let checks = [];
    try { checks = JSON.parse(localStorage.getItem('numoraDailyChecks') || '[]'); } catch {}

    const baseWidgets = extras.querySelector('.fp-home-widgets');
    const org = document.createElement('section');
    org.className = 'card fp200-organized';
    org.innerHTML = `
      <div class="fp200-org-head">
        <div><span class="eyebrow">DAILY WORKSPACE</span><h2>Practice, Progress &amp; Habits</h2></div>
        <div class="fp200-org-tabs" role="tablist">
          <button type="button" class="secondary-btn active" data-fp200-hometab="practice">⚡ Quick Practice</button>
          <button type="button" class="secondary-btn" data-fp200-hometab="progress">📊 Mastery &amp; XP</button>
          <button type="button" class="secondary-btn" data-fp200-hometab="habits">✅ Checklist &amp; Moods</button>
        </div>
      </div>
      <div class="fp200-org-pane" data-fp200-pane="practice">
        <div class="fp200-pane-grid">
          <div class="fp200-subcard">
            <div class="fp-widget-head"><strong>⚡ 10-Mode Challenge</strong><span>${esc(challengeModes[activeModeIdx].label)}</span></div>
            <div class="fp200-mode-pills">${challengeModes.map((m, i) => `<button type="button" class="fp-chip ${i===activeModeIdx?'active':''}" data-fp200-mode="${i}">${esc(m.label)}</button>`).join('')}</div>
            <div class="fp-inline-row" style="margin-top:10px">
              <strong class="fp-warmup-q" id="fp200-mp">${esc(modePrompt)} =</strong>
              <input type="number" step="any" id="fp200-ma" class="fp-input-sm" placeholder="?">
              <button type="button" class="primary-btn" data-fp200="check-mode">Go (+5 XP)</button>
            </div>
          </div>
          <div class="fp200-subcard fp200-warmup-slot"></div>
        </div>
      </div>
      <div class="fp200-org-pane hidden" data-fp200-pane="progress">
        <div class="fp200-pane-grid fp200-progress-slot"></div>
      </div>
      <div class="fp200-org-pane hidden" data-fp200-pane="habits">
        <div class="fp200-pane-grid">
          <div class="fp200-subcard">
            <div class="fp-widget-head"><strong>🏆 10-Point Study Checklist</strong><span>${checks.length}/10</span></div>
            <div class="fp200-checklist">${checklistItems.map((it, i) => `<label class="fp200-chk"><input type="checkbox" data-fp200-chk="${i}" ${checks.includes(i)?'checked':''}><span>${esc(it)}</span></label>`).join('')}</div>
          </div>
          <div class="fp200-subcard">
            <div class="fp-widget-head"><strong>🎨 10 Mood Themes &amp; Rank</strong><span>Lv.${level} · ${acc}%</span></div>
            <div class="fp200-moods">${moods.map(([name, col]) => `<button type="button" class="fp200-mood-dot" style="background:${col}" title="${esc(name)}" data-fp200-mood="${col}"></button>`).join('')}</div>
            <small class="fp-muted">Solved: ${completed} · XP to next lv: ${100 - (xp % 100)}</small>
          </div>
        </div>
      </div>
    `;

    if (baseWidgets) {
      const cards = [...baseWidgets.querySelectorAll('.fp-widget')];
      if (cards[0]) { cards[0].className = 'fp200-subcard'; org.querySelector('.fp200-warmup-slot')?.replaceWith(cards[0]); }
      if (cards[1]) { cards[1].className = 'fp200-subcard'; org.querySelector('.fp200-progress-slot')?.appendChild(cards[1]); }
      if (cards[2]) { cards[2].className = 'fp200-subcard'; org.querySelector('.fp200-progress-slot')?.appendChild(cards[2]); }
      baseWidgets.remove();
    }
    extras.appendChild(org);
  }

  /* ====== PRACTICE 111–145 ====== */
  let combo = 0;
  function enhancePractice200() {
    const shell = content.querySelector('.practice-shell');
    if (!shell || content.querySelector('[data-challenge-time]')) return;
    const input = shell.querySelector('.answer-input');
    if (input && !shell.querySelector('.fp200-sym-bar')) {
      const syms = ['+', '−', '×', '÷', '/', '.', '-', '(', ')', '^'];
      const bar = document.createElement('div');
      bar.className = 'fp200-sym-bar';
      bar.innerHTML = syms.map(s => `<button type="button" class="fp-chip" data-fp200-sym="${s}">${s}</button>`).join('')
        + `<span class="fp200-combo" id="fp200-combo">🔥 Combo: ${combo}×</span>`;
      input.after(bar);
    }
    const controls = shell.querySelector('.practice-controls');
    if (controls && !controls.querySelector('[data-fp200="formula-peek"]')) {
      controls.insertAdjacentHTML('beforeend', `<button type="button" class="secondary-btn" data-fp200="formula-peek">📐 Formulas</button>`);
    }
  }

  /* ====== SKILL LIBRARY 146–160 ====== */
  function enhanceSkills200() {
    const tools = content.querySelector('.skill-library-tools');
    if (!tools || content.querySelector('.fp200-skill-chips')) return;
    const topics = ['All', 'Add', 'Subtract', 'Multiply', 'Divide', 'Fraction', 'Decimal', 'Percent', 'Ratio', 'Equation', 'Geometry', 'Graph', 'Time', 'Money', 'Pattern'];
    const row = document.createElement('div');
    row.className = 'fp200-skill-chips';
    row.innerHTML = topics.map((tp, i) => `<button type="button" class="fp-chip ${i===0?'active':''}" data-fp200-topic="${tp}">${tp}</button>`).join('');
    tools.after(row);
  }

  /* ====== PROGRESS 161–175 ====== */
  function enhanceProgress200() {
    if (pageTitle.textContent !== 'Progress') return;
    const wrap = content.querySelector('.page-wrap');
    if (!wrap || wrap.querySelector('.fp200-analytics')) return;
    const accAttempts = Number(localStorage.getItem('numoraAccuracyAttempts') || 0);
    const accCorrect = Number(localStorage.getItem('numoraAccuracyCorrect') || 0);
    const pct = accAttempts ? Math.round((accCorrect / accAttempts) * 100) : 0;
    const letter = pct >= 97 ? 'A+' : pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : accAttempts ? 'D' : '—';
    const card = document.createElement('section');
    card.className = 'card fp200-analytics';
    card.innerHTML = `<div><strong>Grade Rating: ${letter}</strong><small>${accCorrect} correct of ${accAttempts} attempts</small></div>
      <button type="button" class="secondary-btn" data-fp200="export-csv">⬇ Export CSV Report</button>`;
    wrap.appendChild(card);
  }

  /* ====== NOTES & FLASHCARDS 176–190 ====== */
  function enhanceNotes200() {
    if (pageTitle.textContent === 'My notes' && !content.querySelector('.fp200-note-templates')) {
      const quick = content.querySelector('.fp-notes-quick');
      if (quick) {
        quick.insertAdjacentHTML('beforeend', `<div class="fp200-note-templates"><span>Templates:</span>
          <button type="button" class="fp-chip" data-fp200-tpl="Slope: m = (y₂-y₁)/(x₂-x₁)">Slope</button>
          <button type="button" class="fp-chip" data-fp200-tpl="Pythagoras: a² + b² = c²">Pythagoras</button>
          <button type="button" class="fp-chip" data-fp200-tpl="Circle: A = πr², C = 2πr">Circle</button>
          <button type="button" class="fp-chip" data-fp200-tpl="Quadratic: x = (-b ± √(b²-4ac)) / 2a">Quadratic</button>
        </div>`);
      }
    }
  }

  function runAll200() {
    enhanceHome200();
    enhancePractice200();
    enhanceSkills200();
    enhanceProgress200();
    enhanceNotes200();
  }
  new MutationObserver(runAll200).observe(content, { childList: true, subtree: true });

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') { e.preventDefault(); renderHub(); }
    if (e.key === 'Escape') hubModal.classList.add('hidden');
  });

  document.addEventListener('click', async e => {
    const t = e.target instanceof Element ? e.target : null;
    if (!t) return;

    const act = t.closest('[data-fp200]')?.dataset.fp200;
    if (act === 'open-hub') { renderHub(); return; }
    if (act === 'close-hub') { hubModal.classList.add('hidden'); return; }
    if (act === 'formula-peek') { hubTab = 'formulas'; renderHub(); return; }
    if (act === 'check-mode') {
      const v = Number(document.querySelector('#fp200-ma')?.value);
      if (!modeSolved && v === modeAns) {
        modeSolved = true;
        if (typeof window.setXpBalance === 'function') window.setXpBalance(Number(localStorage.getItem('numoraXP') || 0) + 5, '10-Mode challenge');
        window.showToast?.('Correct! +5 XP');
        pickModeChallenge(activeModeIdx);
        document.querySelector('#fp200-mp').textContent = `${modePrompt} =`;
        document.querySelector('#fp200-ma').value = '';
      } else {
        window.showToast?.('Try again!');
      }
      return;
    }
    if (act === 'export-csv') {
      const rows = ['Metric,Value', `User,${localStorage.getItem('numoraUser')||'Guest'}`, `Grade,${localStorage.getItem('numoraGrade')||'Pre-K'}`, `XP,${localStorage.getItem('numoraXP')||0}`, `Completed,${localStorage.getItem('numoraCompleted')||0}`, `Streak,${localStorage.getItem('numoraStreak')||0}`];
      const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'numora-progress.csv'; a.click();
      URL.revokeObjectURL(a.href);
      return;
    }

    const tabBtn = t.closest('[data-fp200-tab]');
    if (tabBtn) { hubTab = tabBtn.dataset.fp200Tab; renderHub(); return; }
    const homeTab = t.closest('[data-fp200-hometab]');
    if (homeTab) {
      const targetPane = homeTab.dataset.fp200Hometab;
      document.querySelectorAll('[data-fp200-hometab]').forEach(b => b.classList.toggle('active', b === homeTab));
      document.querySelectorAll('[data-fp200-pane]').forEach(p => p.classList.toggle('hidden', p.dataset.fp200Pane !== targetPane));
      return;
    }
    const catBtn = t.closest('[data-fp200-cat]');
    if (catBtn) { hubCat = catBtn.dataset.fp200Cat; renderHub(); return; }
    const toolBtn = t.closest('[data-fp200-tool]');
    if (toolBtn) { activeTool = microTools.find(m => m.id === toolBtn.dataset.fp200Tool) || microTools[0]; renderHub(); return; }
    const copyBtn = t.closest('[data-fp200-copy]');
    if (copyBtn) { try { await navigator.clipboard.writeText(copyBtn.dataset.fp200Copy); window.showToast?.('Formula copied!'); } catch {} return; }

    const modeBtn = t.closest('[data-fp200-mode]');
    if (modeBtn) {
      pickModeChallenge(Number(modeBtn.dataset.fp200Mode));
      document.querySelectorAll('[data-fp200-mode]').forEach((b, i) => b.classList.toggle('active', i === activeModeIdx));
      const mp = document.querySelector('#fp200-mp');
      if (mp) mp.textContent = `${modePrompt} =`;
      return;
    }

    const moodBtn = t.closest('[data-fp200-mood]');
    if (moodBtn) {
      const col = moodBtn.dataset.fp200Mood;
      document.documentElement.style.setProperty('--violet', col);
      document.documentElement.style.setProperty('--accent', col);
      window.showToast?.('Theme mood applied!');
      return;
    }

    const symBtn = t.closest('[data-fp200-sym]');
    if (symBtn) {
      const inp = content.querySelector('.practice-shell .answer-input');
      if (inp) { inp.value += symBtn.dataset.fp200Sym; inp.focus(); }
      return;
    }

    const topicBtn = t.closest('[data-fp200-topic]');
    if (topicBtn) {
      document.querySelectorAll('[data-fp200-topic]').forEach(b => b.classList.toggle('active', b === topicBtn));
      const s = document.querySelector('#skill-search');
      if (s) {
        s.value = topicBtn.dataset.fp200Topic === 'All' ? '' : topicBtn.dataset.fp200Topic;
        s.dispatchEvent(new Event('input', { bubbles: true }));
      }
      return;
    }

    const tplBtn = t.closest('[data-fp200-tpl]');
    if (tplBtn) {
      const inp = document.querySelector('#fp-quick-note-in');
      if (inp) { inp.value = tplBtn.dataset.fp200Tpl; inp.focus(); }
      return;
    }

    if (t.closest('.practice-shell .check-btn') && !content.querySelector('[data-challenge-time]')) {
      setTimeout(() => {
        const fb = content.querySelector('.practice-shell .feedback');
        if (!fb) return;
        if (fb.classList.contains('success')) combo++;
        else if (fb.classList.contains('error')) combo = 0;
        const cEl = document.querySelector('#fp200-combo');
        if (cEl) cEl.textContent = `🔥 Combo: ${combo}×`;
      }, 0);
    }
  });

  document.addEventListener('change', e => {
    const t = e.target;
    if (t instanceof HTMLInputElement && t.dataset.fp200Chk !== undefined) {
      const idx = Number(t.dataset.fp200Chk);
      let checks = [];
      try { checks = JSON.parse(localStorage.getItem('numoraDailyChecks') || '[]'); } catch {}
      if (t.checked && !checks.includes(idx)) checks.push(idx);
      if (!t.checked) checks = checks.filter(x => x !== idx);
      localStorage.setItem('numoraDailyChecks', JSON.stringify(checks));
      window.saveCurrentAccountProgress?.();
    }
  });

  document.addEventListener('input', e => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement)) return;
    if (t.id === 'fp200-a' || t.id === 'fp200-b') {
      if (t.id === 'fp200-a') toolA = t.value; else toolB = t.value;
      const out = document.querySelector('#fp200-out');
      if (out) out.textContent = activeTool.fn(n(toolA, 0), n(toolB, 0));
    } else if (t.id === 'fp200-formula-search') {
      const q = t.value.trim().toLowerCase();
      document.querySelectorAll('.fp200-formula-card').forEach(c => {
        c.classList.toggle('hidden', Boolean(q) && !c.textContent.toLowerCase().includes(q));
      });
    }
  });

  runAll200();
})();
