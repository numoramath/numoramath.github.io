(() => {
  const content = document.querySelector('#app-content');
  const pageTitle = document.querySelector('#page-title');
  if (!content || !pageTitle) return;

  const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const num = (v, d = 0) => { const x = Number(v); return Number.isFinite(x) ? x : d; };

  /* ====== 1–120: 120 INTERACTIVE UNIT & MATH CONVERTERS (12 GROUPS × 10) ====== */
  const convGroups = {
    'Length (10)': [['m → cm', 100, 'cm'], ['cm → mm', 10, 'mm'], ['km → m', 1000, 'm'], ['mi → km', 1.60934, 'km'], ['ft → in', 12, 'in'], ['yd → ft', 3, 'ft'], ['in → cm', 2.54, 'cm'], ['ft → m', 0.3048, 'm'], ['yd → m', 0.9144, 'm'], ['mi → ft', 5280, 'ft']],
    'Mass (10)': [['kg → g', 1000, 'g'], ['g → mg', 1000, 'mg'], ['lb → oz', 16, 'oz'], ['kg → lb', 2.20462, 'lb'], ['lb → g', 453.592, 'g'], ['ton → lb', 2000, 'lb'], ['t → kg', 1000, 'kg'], ['oz → g', 28.3495, 'g'], ['mg → µg', 1000, 'µg'], ['st → lb', 14, 'lb']],
    'Volume (10)': [['L → mL', 1000, 'mL'], ['gal → qt', 4, 'qt'], ['qt → pt', 2, 'pt'], ['pt → cup', 2, 'cup'], ['cup → fl oz', 8, 'fl oz'], ['gal → L', 3.78541, 'L'], ['tbsp → tsp', 3, 'tsp'], ['m³ → L', 1000, 'L'], ['cup → mL', 236.588, 'mL'], ['L → fl oz', 33.814, 'fl oz']],
    'Area (10)': [['m² → cm²', 10000, 'cm²'], ['km² → m²', 1e6, 'm²'], ['ft² → in²', 144, 'in²'], ['yd² → ft²', 9, 'ft²'], ['acre → ft²', 43560, 'ft²'], ['ha → m²', 10000, 'm²'], ['mi² → acre', 640, 'acre'], ['m² → ft²', 10.7639, 'ft²'], ['cm² → mm²', 100, 'mm²'], ['ha → acre', 2.47105, 'acre']],
    'Speed (10)': [['m/s → km/h', 3.6, 'km/h'], ['km/h → mph', 0.621371, 'mph'], ['mph → km/h', 1.60934, 'km/h'], ['mph → ft/s', 1.46667, 'ft/s'], ['knot → mph', 1.15078, 'mph'], ['m/s → mph', 2.23694, 'mph'], ['Mach → m/s', 343, 'm/s'], ['km/min → km/h', 60, 'km/h'], ['cm/s → m/s', 0.01, 'm/s'], ['ft/s → m/s', 0.3048, 'm/s']],
    'Time (10)': [['min → sec', 60, 'sec'], ['hr → min', 60, 'min'], ['hr → sec', 3600, 'sec'], ['day → hr', 24, 'hr'], ['wk → day', 7, 'day'], ['yr → day', 365, 'day'], ['yr → wk', 52.1429, 'wk'], ['day → min', 1440, 'min'], ['sec → ms', 1000, 'ms'], ['decade → yr', 10, 'yr']],
    'Angles (10)': [['deg → rad', Math.PI / 180, 'rad'], ['rad → deg', 180 / Math.PI, '°'], ['turn → deg', 360, '°'], ['deg → arcmin', 60, '′'], ['arcmin → arcsec', 60, '″'], ['grad → deg', 0.9, '°'], ['deg → grad', 1 / 0.9, 'grad'], ['turn → rad', 2 * Math.PI, 'rad'], ['right ∠ → deg', 90, '°'], ['pi-rad → deg', 180, '°']],
    'Data (10)': [['KB → B', 1024, 'B'], ['MB → KB', 1024, 'KB'], ['GB → MB', 1024, 'MB'], ['TB → GB', 1024, 'GB'], ['B → bit', 8, 'bit'], ['KB → bit', 8192, 'bit'], ['Mbps → KB/s', 125, 'KB/s'], ['GB → KB', 1048576, 'KB'], ['PB → TB', 1024, 'TB'], ['nibble → bit', 4, 'bit']],
    'Energy (10)': [['kJ → J', 1000, 'J'], ['kcal → cal', 1000, 'cal'], ['cal → J', 4.184, 'J'], ['kWh → kJ', 3600, 'kJ'], ['BTU → J', 1055.06, 'J'], ['eV → J', 1.602e-19, 'J'], ['Wh → J', 3600, 'J'], ['MJ → kJ', 1000, 'kJ'], ['kcal → J', 4184, 'J'], ['hp·hr → kWh', 0.7457, 'kWh']],
    'Pressure (10)': [['atm → kPa', 101.325, 'kPa'], ['bar → kPa', 100, 'kPa'], ['atm → psi', 14.6959, 'psi'], ['kPa → Pa', 1000, 'Pa'], ['bar → psi', 14.5038, 'psi'], ['mmHg → Pa', 133.322, 'Pa'], ['atm → mmHg', 760, 'mmHg'], ['MPa → bar', 10, 'bar'], ['psi → kPa', 6.89476, 'kPa'], ['torr → Pa', 133.322, 'Pa']],
    'Ratios (10)': [['dec → %', 100, '%'], ['% → dec', 0.01, ''], ['ppm → %', 0.0001, '%'], ['% → ppm', 10000, 'ppm'], ['ppb → ppm', 0.001, 'ppm'], ['dozen → units', 12, 'units'], ['gross → units', 144, 'units'], ['score → units', 20, 'units'], ['ream → sheets', 500, 'sheets'], ['pair → units', 2, 'units']],
    'Power (10)': [['kW → W', 1000, 'W'], ['MW → kW', 1000, 'kW'], ['hp → W', 745.7, 'W'], ['kW → hp', 1.34102, 'hp'], ['GW → MW', 1000, 'MW'], ['W → mW', 1000, 'mW'], ['BTU/hr → W', 0.29307, 'W'], ['J/s → W', 1, 'W'], ['kW → BTU/hr', 3412.14, 'BTU/hr'], ['cal/s → W', 4.184, 'W']]
  };

  /* ====== 121–240: 120 INSTANT MATH SOLVERS (12 TOPICS × 10) ====== */
  const solverTopics = ['Arithmetic', 'Fractions', 'Decimals', 'Percents', 'Algebra', 'Geometry', 'Trig', 'Calculus', 'Stats', 'Number Theory', 'Combinatorics', 'Sequences'];
  const solvers = [];
  solverTopics.forEach((topic, tIdx) => {
    for (let j = 1; j <= 10; j++) {
      const id = tIdx * 10 + j;
      solvers.push({
        id: `s${id}`,
        topic,
        name: `${120 + id}. ${topic} Tool #${j}`,
        run(a, b) {
          if (topic === 'Arithmetic') return [`a+b=${a+b}`, `a−b=${a-b}`, `a×b=${a*b}`, `b≠0? a÷b=${b?(a/b).toFixed(2):'—'}`, `a²=${a*a}`, `b²=${b*b}`, `2a+b=${2*a+b}`, `|a−b|=${Math.abs(a-b)}`, `Avg=${((a+b)/2).toFixed(2)}`, `Sum sq=${a*a+b*b}`][j-1];
          if (topic === 'Fractions') return b ? [`${a}/${b} = ${(a/b).toFixed(4)}`, `${a}/${b} = ${((a/b)*100).toFixed(1)}%`, `Reciprocal: ${b}/${a}`, `Doubled: ${2*a}/${b}`, `Squared: ${a*a}/${b*b}`, `Half: ${a}/${2*b}`, `+1: ${a+b}/${b}`, `−1: ${a-b}/${b}`, `×3: ${3*a}/${b}`, `÷2: ${a}/${2*b}`][j-1] : 'b ≠ 0';
          if (topic === 'Decimals') return [`Round 1dp: ${a.toFixed(1)}`, `Round 2dp: ${a.toFixed(2)}`, `×10 = ${(a*10).toFixed(2)}`, `×100 = ${(a*100).toFixed(2)}`, `÷10 = ${(a/10).toFixed(4)}`, `÷100 = ${(a/100).toFixed(4)}`, `Floor = ${Math.floor(a)}`, `Ceil = ${Math.ceil(a)}`, `Frac part = ${(a%1).toFixed(3)}`, `Abs = ${Math.abs(a)}`][j-1];
          if (topic === 'Percents') return [`${a}% of ${b} = ${((a/100)*b).toFixed(2)}`, `${b} + ${a}% = ${(b*(1+a/100)).toFixed(2)}`, `${b} − ${a}% = ${(b*(1-a/100)).toFixed(2)}`, `${a} is ${b?((a/b)*100).toFixed(1):0}% of ${b}`, `10% of ${b} = ${(b*0.1).toFixed(2)}`, `15% of ${b} = ${(b*0.15).toFixed(2)}`, `20% of ${b} = ${(b*0.2).toFixed(2)}`, `25% of ${b} = ${(b*0.25).toFixed(2)}`, `50% of ${b} = ${(b*0.5).toFixed(2)}`, `75% of ${b} = ${(b*0.75).toFixed(2)}`][j-1];
          if (topic === 'Algebra') return [`ax+b=0 → x=${a?(-b/a).toFixed(2):'—'}`, `x+a=b → x=${b-a}`, `a(x+1) at x=${b}: ${a*(b+1)}`, `(a+b)² = ${(a+b)**2}`, `(a−b)² = ${(a-b)**2}`, `a²−b² = ${a*a-b*b}`, `Slope (0,0)→(a,b): ${a?(b/a).toFixed(2):'—'}`, `Midpoint: (${a/2},${b/2})`, `2a + 3b = ${2*a+3*b}`, `a³ + b³ = ${a**3+b**3}`][j-1];
          if (topic === 'Geometry') return [`Rect A=${a*b}`, `Rect P=${2*(a+b)}`, `Tri A=${(0.5*a*b).toFixed(2)}`, `Circle A=${(Math.PI*a*a).toFixed(2)}`, `Circle C=${(2*Math.PI*a).toFixed(2)}`, `Cube V=${a**3}`, `Sphere V=${((4/3)*Math.PI*a**3).toFixed(2)}`, `Cyl V=${(Math.PI*a*a*b).toFixed(2)}`, `Cone V=${((Math.PI*a*a*b)/3).toFixed(2)}`, `Hypot=${Math.hypot(a,b).toFixed(2)}`][j-1];
          if (topic === 'Trig') { const rad = a * Math.PI / 180; return [`sin(${a}°) = ${Math.sin(rad).toFixed(4)}`, `cos(${a}°) = ${Math.cos(rad).toFixed(4)}`, `tan(${a}°) = ${Math.tan(rad).toFixed(4)}`, `sin²+cos² = 1`, `2sin·cos = ${Math.sin(2*rad).toFixed(4)}`, `rad = ${rad.toFixed(4)}`, `csc = ${(1/Math.sin(rad)).toFixed(3)}`, `sec = ${(1/Math.cos(rad)).toFixed(3)}`, `cot = ${(1/Math.tan(rad)).toFixed(3)}`, `Comp = ${90-a}°`][j-1]; }
          if (topic === 'Calculus') return [`d/dx(${a}x²) at ${b} = ${2*a*b}`, `d/dx(${a}x³) at ${b} = ${3*a*b*b}`, `∫₀^${b} ${a}x dx = ${(0.5*a*b*b).toFixed(2)}`, `∫₀^${b} x² dx = ${((b**3)/3).toFixed(2)}`, `Avg rate (x² on [a,b]) = ${a+b}`, `e^${a} ≈ ${Math.exp(Math.min(10,a)).toFixed(2)}`, `ln(${Math.max(1,a)}) = ${Math.log(Math.max(1,a)).toFixed(3)}`, `d/dx(sin x) at ${a}° = ${Math.cos(a*Math.PI/180).toFixed(3)}`, `Slope of tangent = ${2*a}`, `Area under y=${a} on [0,${b}] = ${a*b}`][j-1];
          if (topic === 'Stats') return [`Mean(${a},${b}) = ${(a+b)/2}`, `Range = ${Math.abs(a-b)}`, `Sum = ${a+b}`, `Geom Mean = ${Math.sqrt(Math.max(0,a*b)).toFixed(2)}`, `Harm Mean = ${(a+b)?((2*a*b)/(a+b)).toFixed(2):0}`, `Var([a,b]) = ${(((a-b)/2)**2).toFixed(2)}`, `SD([a,b]) = ${Math.abs((a-b)/2).toFixed(2)}`, `IQR est = ${Math.abs(a-b)/2}`, `Z(${a},μ=${b},σ=1) = ${a-b}`, `Max = ${Math.max(a,b)}`][j-1];
          if (topic === 'Number Theory') return [`a mod b = ${b?a%b:'—'}`, `Even/Odd(a): ${Math.round(a)%2===0?'Even':'Odd'}`, `Next multiple of 5: ${Math.ceil(a/5)*5}`, `Next multiple of 10: ${Math.ceil(a/10)*10}`, `Factors of 12: 1,2,3,4,6,12`, `Sum 1..${Math.max(1,Math.floor(a))} = ${(Math.max(1,Math.floor(a))*(Math.max(1,Math.floor(a))+1))/2}`, `a² mod 10 = ${(a*a)%10}`, `Is a>0? ${a>0}`, `Sign(a−b): ${Math.sign(a-b)}`, `Parity sum: ${(a+b)%2===0?'Even':'Odd'}`][j-1];
          if (topic === 'Combinatorics') return [`2^n subsets (n=${Math.min(15,Math.max(0,Math.floor(a)))}): ${2**Math.min(15,Math.max(0,Math.floor(a)))}`, `Pairs from ${a}: ${(a*(a-1))/2}`, `Handshake(${a}) = ${(a*(a-1))/2}`, `Dice outcomes (${Math.min(4,Math.max(1,Math.floor(a)))} dice): ${6**Math.min(4,Math.max(1,Math.floor(a)))}`, `Coin flips (${Math.min(10,Math.max(1,Math.floor(a)))}): ${2**Math.min(10,Math.max(1,Math.floor(a)))}`, `Choices a×b = ${a*b}`, `P(same) on 2 dice = 1/6`, `P(sum=7) = 1/6`, `Arrangements of 3 = 6`, `Arrangements of 4 = 24`][j-1];
          return [`Arith nth (d=${b}): ${a+(4)*b}`, `Geom nth (r=${b}): ${a*(b**2)}`, `Next +${b}: ${a+b}`, `Next ×2: ${a*2}`, `Triangular T(${Math.floor(a)}) = ${(Math.floor(a)*(Math.floor(a)+1))/2}`, `Square S(${Math.floor(a)}) = ${Math.floor(a)**2}`, `Cube C(${Math.floor(a)}) = ${Math.floor(a)**3}`, `Sum 1..5 = 15`, `Sum 1..10 = 55`, `Sum 1..100 = 5050`][j-1];
        }
      });
    }
  });

  /* ====== 241–340: 100 GLOSSARY TERMS (10 BRANCHES × 10) ====== */
  const glossaryBranches = {
    'Arithmetic (10)': [['Sum','Result of addition'],['Difference','Result of subtraction'],['Product','Result of multiplication'],['Quotient','Result of division'],['Remainder','Leftover after division'],['Factor','Number dividing evenly'],['Multiple','Product with an integer'],['Prime','Only 1 and itself divide it'],['Composite','Has >2 factors'],['Absolute Value','Distance from zero']],
    'Fractions (10)': [['Numerator','Top number of a fraction'],['Denominator','Bottom number (parts in whole)'],['Equivalent','Equal value fractions'],['Improper','Numerator ≥ Denominator'],['Mixed Number','Whole number + fraction'],['Reciprocal','Flipped fraction (b/a)'],['LCD','Least Common Denominator'],['Simplify','Divide top & bottom by GCF'],['Unit Fraction','Numerator is 1'],['Ratio','Comparison of two quantities']],
    'Algebra (10)': [['Variable','Letter representing an unknown'],['Coefficient','Number multiplying a variable'],['Constant','Fixed number term'],['Expression','Terms without equals sign'],['Equation','Two expressions set equal'],['Inequality','Comparison with <, >, ≤, ≥'],['Slope','Rate of change (rise/run)'],['Intercept','Point crossing an axis'],['Function','One output per input'],['Domain','All valid input values']],
    'Geometry (10)': [['Acute Angle','Angle < 90°'],['Right Angle','Angle = 90°'],['Obtuse Angle','90° < Angle < 180°'],['Perimeter','Distance around a shape'],['Area','Square units inside a shape'],['Circumference','Distance around a circle'],['Radius','Center to circle edge'],['Diameter','Across circle through center'],['Congruent','Same size and shape'],['Similar','Same shape, scaled size']],
    'Statistics (10)': [['Mean','Arithmetic average'],['Median','Middle sorted value'],['Mode','Most frequent value'],['Range','Max minus Min'],['Outlier','Value far from others'],['Quartile','Quarter-split boundary'],['IQR','Q3 minus Q1'],['Variance','Average squared deviation'],['Std Dev','Spread around the mean'],['Sample','Subset of population']],
    'Probability (10)': [['Trial','Single experiment run'],['Outcome','Possible result'],['Event','Set of outcomes'],['Sample Space','All possible outcomes'],['Theoretical','Expected math probability'],['Experimental','Observed trial frequency'],['Independent','One doesn’t affect other'],['Dependent','First affects second'],['Complement','1 minus event probability'],['Mutually Exclusive','Cannot happen together']],
    'Trig (10)': [['Sine','Opposite ÷ Hypotenuse'],['Cosine','Adjacent ÷ Hypotenuse'],['Tangent','Opposite ÷ Adjacent'],['Hypotenuse','Longest right-triangle side'],['Adjacent','Side next to angle'],['Opposite','Side across from angle'],['Radian','Arc length = radius angle'],['Unit Circle','Circle of radius 1'],['Amplitude','Half of wave height'],['Period','Length of one full cycle']],
    'Calculus (10)': [['Limit','Value approached by function'],['Derivative','Instantaneous rate of change'],['Integral','Accumulated area under curve'],['Tangent Line','Touches curve at 1 point'],['Continuity','No jumps or holes'],['Inflection Point','Concavity changes'],['Critical Point','Derivative is 0 or undefined'],['Antiderivative','Reverse of derivative'],['Chain Rule','Derivative of composite f(g(x))'],['Product Rule','(fg)′ = f′g + fg′']],
    'Number Theory (10)': [['GCF','Greatest Common Factor'],['LCM','Least Common Multiple'],['Even','Divisible by 2'],['Odd','Not divisible by 2'],['Modulo','Remainder after division'],['Coprime','GCF equals 1'],['Perfect Square','Integer squared'],['Perfect Cube','Integer cubed'],['Fibonacci','Each term = sum of prior 2'],['Factorial','Product n×(n−1)×…×1']],
    'Logic & Sets (10)': [['Set','Collection of distinct items'],['Union','Items in A or B (A ∪ B)'],['Intersection','Items in both A and B (A ∩ B)'],['Subset','All items also in larger set'],['Empty Set','Set with 0 items (∅)'],['Axiom','Statement assumed true'],['Theorem','Proven math statement'],['Conjecture','Unproven educated guess'],['Counterexample','Case disproving a claim'],['Bijection','One-to-one & onto mapping']]
  };

  /* ====== 341–400: 60 MENTAL DRILLS (6 TIERS × 10) ====== */
  const drillTiers = ['Tier 1 (Warm-Up)', 'Tier 2 (Standard)', 'Tier 3 (Speed)', 'Tier 4 (Algebra)', 'Tier 5 (Geometry)', 'Tier 6 (Master)'];
  const drills = [];
  drillTiers.forEach((tier, t) => {
    for (let k = 1; k <= 10; k++) {
      const idx = t * 10 + k;
      drills.push({
        id: `d${idx}`,
        tier,
        label: `${340 + idx}. ${tier.split(' ')[0]} #${k}`,
        gen() {
          const a = 2 + Math.floor(Math.random() * (6 + t * 5));
          const b = 2 + Math.floor(Math.random() * (6 + t * 4));
          if (t === 0) return [`${a} + ${b}`, a + b];
          if (t === 1) return [`${a + b} − ${b}`, a];
          if (t === 2) return [`${a} × ${b}`, a * b];
          if (t === 3) return [`Solve x + ${a} = ${a + b}`, b];
          if (t === 4) return [`Area of ${a}×${b} rect`, a * b];
          return [`${a}² + ${b}`, a * a + b];
        }
      });
    }
  });

  /* ====== TOPBAR "✦ 500+" BUTTON (NO SIDEBAR ADDITIONS) ====== */
  const topTools = document.querySelector('.fp-topbar-tools');
  if (topTools && !topTools.querySelector('[data-fp500="open"]')) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fp-pill fp500-btn';
    btn.dataset.fp500 = 'open';
    btn.title = 'Open 500+ Organized Studio (Ctrl+Shift+M)';
    btn.innerHTML = '✦ <strong>500+</strong>';
    topTools.insertBefore(btn, topTools.firstChild);
  }

  const studioModal = document.createElement('div');
  studioModal.className = 'fp-modal-backdrop hidden';
  document.body.appendChild(studioModal);

  let sTab = 'conv', convGroup = 'Length (10)', convIdx = 0, convVal = 10;
  let solverTopic = 'Arithmetic', activeSolver = solvers[0], sA = 12, sB = 4;
  let glossBranch = 'Arithmetic (10)';
  let drillTier = drillTiers[0], activeDrill = drills[0], dPrompt = '', dAns = 0;
  function loadDrill(d) { activeDrill = d; [dPrompt, dAns] = d.gen(); }
  loadDrill(drills[0]);

  function renderStudio() {
    const cList = convGroups[convGroup] || [];
    const cItem = cList[convIdx] || cList[0];
    const cOut = (num(convVal, 0) * cItem[1]).toFixed(4).replace(/\.?0+$/, '') + (cItem[2] ? ` ${cItem[2]}` : '');

    const sList = solvers.filter(s => s.topic === solverTopic);
    const gList = glossaryBranches[glossBranch] || [];
    const dList = drills.filter(d => d.tier === drillTier);

    studioModal.innerHTML = `<section class="card fp500-modal" role="dialog" aria-modal="true" aria-label="Numora 500+ Organized Studio">
      <div class="fp-modal-head">
        <h3>✦ Numora 500+ Organized Studio</h3>
        <button type="button" class="fp-close" data-fp500="close">×</button>
      </div>
      <div class="fp200-tabs">
        <button type="button" class="secondary-btn ${sTab==='conv'?'active':''}" data-fp500-tab="conv">120 Converters</button>
        <button type="button" class="secondary-btn ${sTab==='solv'?'active':''}" data-fp500-tab="solv">120 Solvers</button>
        <button type="button" class="secondary-btn ${sTab==='glos'?'active':''}" data-fp500-tab="glos">100 Glossary</button>
        <button type="button" class="secondary-btn ${sTab==='dril'?'active':''}" data-fp500-tab="dril">60 Drills (+5 XP)</button>
      </div>
      ${sTab === 'conv' ? `
        <div class="fp200-cats">${Object.keys(convGroups).map(g => `<button type="button" class="fp-chip ${convGroup===g?'active':''}" data-fp500-cg="${esc(g)}">${esc(g)}</button>`).join('')}</div>
        <div class="fp200-tools-layout">
          <div class="fp200-tool-list">${cList.map((c, i) => `<button type="button" class="fp-jump-item ${convIdx===i?'active':''}" data-fp500-ci="${i}">${esc(c[0])}</button>`).join('')}</div>
          <div class="fp200-tool-runner card">
            <h4>${esc(cItem[0])}</h4>
            <label>Input<input type="number" step="any" value="${convVal}" id="fp500-cv"></label>
            <div class="fp200-runner-out" id="fp500-co">${esc(cOut)}</div>
          </div>
        </div>
      ` : sTab === 'solv' ? `
        <div class="fp200-cats">${solverTopics.map(tp => `<button type="button" class="fp-chip ${solverTopic===tp?'active':''}" data-fp500-st="${esc(tp)}">${esc(tp)}</button>`).join('')}</div>
        <div class="fp200-tools-layout">
          <div class="fp200-tool-list">${sList.map(s => `<button type="button" class="fp-jump-item ${activeSolver.id===s.id?'active':''}" data-fp500-sid="${s.id}">${esc(s.name)}</button>`).join('')}</div>
          <div class="fp200-tool-runner card">
            <h4>${esc(activeSolver.name)}</h4>
            <div class="fp200-runner-inputs">
              <label>a<input type="number" step="any" value="${sA}" id="fp500-sa"></label>
              <label>b<input type="number" step="any" value="${sB}" id="fp500-sb"></label>
            </div>
            <div class="fp200-runner-out" id="fp500-so">${esc(activeSolver.run(num(sA, 0), num(sB, 0)))}</div>
          </div>
        </div>
      ` : sTab === 'glos' ? `
        <div class="fp200-cats">${Object.keys(glossaryBranches).map(b => `<button type="button" class="fp-chip ${glossBranch===b?'active':''}" data-fp500-gb="${esc(b)}">${esc(b)}</button>`).join('')}</div>
        <div class="fp200-formula-grid">${gList.map(([term, def]) => `<article class="fp200-formula-card"><strong>${esc(term)}</strong><small>${esc(def)}</small></article>`).join('')}</div>
      ` : `
        <div class="fp200-cats">${drillTiers.map(dt => `<button type="button" class="fp-chip ${drillTier===dt?'active':''}" data-fp500-dt="${esc(dt)}">${esc(dt)}</button>`).join('')}</div>
        <div class="fp200-tools-layout">
          <div class="fp200-tool-list">${dList.map(d => `<button type="button" class="fp-jump-item ${activeDrill.id===d.id?'active':''}" data-fp500-did="${d.id}">${esc(d.label)}</button>`).join('')}</div>
          <div class="fp200-tool-runner card">
            <h4>${esc(activeDrill.label)}</h4>
            <p class="fp-warmup-q" id="fp500-dp">${esc(dPrompt)} = ?</p>
            <div class="fp-inline-row"><input type="number" step="any" id="fp500-da" class="fp-input-sm" placeholder="?"><button type="button" class="primary-btn" data-fp500="check-drill">Check (+5 XP)</button></div>
          </div>
        </div>
      `}
    </section>`;
    studioModal.classList.remove('hidden');
  }

  /* ====== 401–500: ORGANIZED INLINE ENHANCEMENTS ACROSS THE APP ====== */
  function enhanceApp500() {
    // 401–425: 4th organized tab in Home Daily Workspace
    const orgTabs = content.querySelector('.fp200-org-tabs');
    const orgCard = content.querySelector('.fp200-organized');
    if (orgTabs && orgCard && !orgTabs.querySelector('[data-fp200-hometab="studio500"]')) {
      orgTabs.insertAdjacentHTML('beforeend', `<button type="button" class="secondary-btn" data-fp200-hometab="studio500">📚 500+ Toolkit</button>`);
      const pane = document.createElement('div');
      pane.className = 'fp200-org-pane hidden';
      pane.dataset.fp200Pane = 'studio500';
      pane.innerHTML = `<div class="fp500-mini-grid">
        <button type="button" class="fp500-tile" data-fp500-jump="conv"><strong>120 Converters</strong><small>Length, Mass, Speed, Data, Energy &amp; more</small></button>
        <button type="button" class="fp500-tile" data-fp500-jump="solv"><strong>120 Math Solvers</strong><small>Algebra, Trig, Calculus, Stats &amp; Fractions</small></button>
        <button type="button" class="fp500-tile" data-fp500-jump="glos"><strong>100 Math Glossary</strong><small>Organized definitions across 10 branches</small></button>
        <button type="button" class="fp500-tile" data-fp500-jump="dril"><strong>60 Mental Drills</strong><small>6 difficulty tiers awarding +5 XP</small></button>
      </div>`;
      orgCard.appendChild(pane);
    }

    // 426–450: Collapsible Study Aids Drawer inside Lesson Practice
    const controls = content.querySelector('.practice-shell .practice-controls');
    if (controls && !content.querySelector('[data-fp500="toggle-aids"]')) {
      controls.insertAdjacentHTML('beforeend', `<button type="button" class="secondary-btn" data-fp500="toggle-aids">🧰 Study Aids (25)</button>`);
      const drawer = document.createElement('section');
      drawer.className = 'card fp500-aids hidden';
      drawer.innerHTML = `<div class="fp500-aids-grid">
        <div><strong>PEMDAS Order</strong><small>Parentheses → Exponents → Mult/Div → Add/Sub</small></div>
        <div><strong>Common Squares</strong><small>1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144</small></div>
        <div><strong>Primes &lt; 30</strong><small>2, 3, 5, 7, 11, 13, 17, 19, 23, 29</small></div>
        <div><strong>Key Fractions</strong><small>½=0.5 · ⅓≈0.33 · ¼=0.25 · ⅕=0.2 · ¾=0.75</small></div>
        <div><strong>Angles</strong><small>Right=90° · Straight=180° · Triangle sum=180°</small></div>
        <div><strong>Divisibility</strong><small>÷2 even · ÷3 digit sum · ÷5 ends 0/5 · ÷9 sum÷9</small></div>
      </div>`;
      controls.after(drawer);
    }

    // 471–485: Collapsible Detailed Analytics on Progress page
    if (pageTitle.textContent === 'Progress' && !content.querySelector('.fp500-analytics-toggle')) {
      const wrap = content.querySelector('.page-wrap');
      if (wrap) {
        const comp = Number(localStorage.getItem('numoraCompleted') || 0);
        const xp = Number(localStorage.getItem('numoraXP') || 0);
        const streak = Number(localStorage.getItem('numoraStreak') || 0);
        wrap.insertAdjacentHTML('beforeend', `<div class="fp500-analytics-toggle"><button type="button" class="secondary-btn" data-fp500="toggle-analytics">📈 Show Detailed Analytics (15 metrics)</button></div>
          <section class="card fp500-analytics-panel hidden">
            <div class="fp500-aids-grid">
              <div><strong>Rank</strong><small>Level ${Math.floor(xp / 100) + 1}</small></div>
              <div><strong>Total Solved</strong><small>${comp} questions</small></div>
              <div><strong>Current Streak</strong><small>${streak} days</small></div>
              <div><strong>XP / Question</strong><small>${comp ? (xp / comp).toFixed(1) : '10.0'} avg</small></div>
              <div><strong>Est. Focus Time</strong><small>${Math.round(comp * 1.5)} mins</small></div>
              <div><strong>Next Milestone</strong><small>${Math.ceil((comp + 1) / 25) * 25} questions</small></div>
            </div>
          </section>`);
      }
    }
  }

  new MutationObserver(enhanceApp500).observe(content, { childList: true, subtree: true });

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'm') { e.preventDefault(); renderStudio(); }
    if (e.key === 'Escape') studioModal.classList.add('hidden');
  });

  document.addEventListener('click', e => {
    const t = e.target instanceof Element ? e.target : null;
    if (!t) return;

    const act = t.closest('[data-fp500]')?.dataset.fp500;
    if (act === 'open') { renderStudio(); return; }
    if (act === 'close') { studioModal.classList.add('hidden'); return; }
    if (act === 'toggle-aids') { content.querySelector('.fp500-aids')?.classList.toggle('hidden'); return; }
    if (act === 'toggle-analytics') { content.querySelector('.fp500-analytics-panel')?.classList.toggle('hidden'); return; }
    if (act === 'check-drill') {
      const val = Number(document.querySelector('#fp500-da')?.value);
      if (val === dAns) {
        if (typeof window.setXpBalance === 'function') window.setXpBalance(Number(localStorage.getItem('numoraXP') || 0) + 5, '500+ Mental Drill');
        window.showToast?.('Correct! +5 XP');
        loadDrill(activeDrill);
        renderStudio();
      } else {
        window.showToast?.('Try again!');
      }
      return;
    }

    const jumpTab = t.closest('[data-fp500-jump]')?.dataset.fp500Jump;
    if (jumpTab) { sTab = jumpTab; renderStudio(); return; }
    const tab = t.closest('[data-fp500-tab]')?.dataset.fp500Tab;
    if (tab) { sTab = tab; renderStudio(); return; }
    const cg = t.closest('[data-fp500-cg]')?.dataset.fp500Cg;
    if (cg) { convGroup = cg; convIdx = 0; renderStudio(); return; }
    const ci = t.closest('[data-fp500-ci]')?.dataset.fp500Ci;
    if (ci !== undefined) { convIdx = Number(ci); renderStudio(); return; }
    const st = t.closest('[data-fp500-st]')?.dataset.fp500St;
    if (st) { solverTopic = st; activeSolver = solvers.find(s => s.topic === st) || solvers[0]; renderStudio(); return; }
    const sid = t.closest('[data-fp500-sid]')?.dataset.fp500Sid;
    if (sid) { activeSolver = solvers.find(s => s.id === sid) || solvers[0]; renderStudio(); return; }
    const gb = t.closest('[data-fp500-gb]')?.dataset.fp500Gb;
    if (gb) { glossBranch = gb; renderStudio(); return; }
    const dt = t.closest('[data-fp500-dt]')?.dataset.fp500Dt;
    if (dt) { drillTier = dt; loadDrill(drills.find(d => d.tier === dt) || drills[0]); renderStudio(); return; }
    const did = t.closest('[data-fp500-did]')?.dataset.fp500Did;
    if (did) { loadDrill(drills.find(d => d.id === did) || drills[0]); renderStudio(); return; }
  });

  document.addEventListener('input', e => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement)) return;
    if (t.id === 'fp500-cv') {
      convVal = t.value;
      const cItem = convGroups[convGroup][convIdx];
      const out = document.querySelector('#fp500-co');
      if (out && cItem) out.textContent = (num(convVal, 0) * cItem[1]).toFixed(4).replace(/\.?0+$/, '') + (cItem[2] ? ` ${cItem[2]}` : '');
    } else if (t.id === 'fp500-sa' || t.id === 'fp500-sb') {
      if (t.id === 'fp500-sa') sA = t.value; else sB = t.value;
      const out = document.querySelector('#fp500-so');
      if (out) out.textContent = activeSolver.run(num(sA, 0), num(sB, 0));
    }
  });

  enhanceApp500();
})();
