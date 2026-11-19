(() => {
  const root = document.querySelector('#app-content');
  const title = document.querySelector('#page-title');
  if (!root || !title) return;

  const state = { round: 0, score: 0, chart: null, prompt: null, choices: [], correctIndex: -1, answered: false, feedback: '', history: [] };
  const es = () => localStorage.getItem('numoraLanguage') === 'es';
  const grade = () => localStorage.getItem('numoraGrade') || 'Pre-K';
  const rank = () => { const match = /^Grade (\d+)$/.exec(grade()); return match ? Number(match[1]) : grade() === 'College' ? 13 : 0; };
  const categories = [
    { en: 'Apples', es: 'Manzanas', icon: '🍎' },
    { en: 'Books', es: 'Libros', icon: '📚' },
    { en: 'Stars', es: 'Estrellas', icon: '⭐' },
    { en: 'Kites', es: 'Cometas', icon: '🪁' },
  ];
  const randomInt = max => Math.floor(Math.random() * max) + 1;
  function readHistory() {
    try { const saved = JSON.parse(localStorage.getItem('numoraDataExplorerHistory') || '[]'); return Array.isArray(saved) ? saved.filter(item => item && Number.isFinite(item.score)).slice(0, 30) : []; }
    catch { return []; }
  }
  function buildQuestion() {
    const early = rank() <= 1;
    const cap = early ? 8 : rank() <= 4 ? 15 : rank() <= 8 ? 25 : 40;
    const values = [];
    while (values.length < categories.length) { const value = randomInt(cap); if (!values.includes(value)) values.push(value); }
    state.chart = values;
    const q = Math.floor(Math.random() * (early ? 2 : rank() <= 4 ? 4 : 5));
    let answer, prompt;
    if (early || q === 0) {
      const index = values.indexOf(Math.max(...values));
      answer = categories[index][es() ? 'es' : 'en'];
      prompt = es() ? '¿Qué grupo tiene más?' : 'Which group has the most?';
    } else if (q === 1) {
      const index = values.indexOf(Math.min(...values));
      answer = categories[index][es() ? 'es' : 'en'];
      prompt = es() ? '¿Qué grupo tiene menos?' : 'Which group has the fewest?';
    } else if (q === 2) {
      const index = Math.floor(Math.random() * categories.length);
      answer = String(values[index]);
      prompt = es() ? `¿Cuántos ${categories[index].es.toLowerCase()} hay?` : `How many ${categories[index].en.toLowerCase()} are there?`;
    } else if (q === 3) {
      answer = String(values.reduce((sum, value) => sum + value, 0));
      prompt = es() ? '¿Cuántos hay en total?' : 'How many are there altogether?';
    } else {
      const [first, second] = [...values].sort((a,b) => b-a);
      answer = String(first - second);
      prompt = es() ? '¿Cuál es la diferencia entre el grupo con más y el que tiene menos?' : 'What is the difference between the largest and smallest groups?';
    }
    const numeric = Number(answer);
    let options;
    if (Number.isFinite(numeric) && answer.trim() !== '') {
      const distractors = new Set();
      while (distractors.size < 3) { const offset = randomInt(6); const candidate = numeric + (Math.random() < 0.5 ? -offset : offset); if (candidate >= 0 && candidate !== numeric) distractors.add(String(candidate)); }
      options = [answer, ...distractors];
    } else {
      options = categories.map(item => item[es() ? 'es' : 'en']).filter(label => label !== answer).slice(0, 3).concat(answer);
    }
    for (let i = options.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [options[i], options[j]] = [options[j], options[i]]; }
    state.prompt = prompt; state.choices = options; state.correctIndex = options.indexOf(answer); state.answered = false; state.feedback = '';
  }
  function renderChart() {
    const max = Math.max(...state.chart, 1);
    return `<div class="data-chart" role="group" aria-label="${es() ? 'Gráfica de barras con cantidades por grupo' : 'Bar chart showing counts by group'}">${categories.map((item,index) => `<div class="data-chart-row"><span class="data-chart-label"><i aria-hidden="true">${item.icon}</i>${item[es() ? 'es' : 'en']}</span><div class="data-chart-track"><span style="width:${Math.max(5,state.chart[index]/max*100)}%"></span></div><strong>${state.chart[index]}</strong></div>`).join('')}</div><p class="data-chart-scale">${es() ? 'Cada barra muestra la cantidad del grupo.' : 'Each bar shows the number in that group.'}</p>`;
  }
  function best() { return Math.max(0, ...state.history.filter(item => item.grade === grade()).map(item => item.score)); }
  function renderSetup() {
    const spanish = es(); title.textContent = spanish ? 'Explorador de datos' : 'Data explorer';
    root.innerHTML = `<div class="page-wrap data-explorer-page"><div class="hero-row"><div><span class="eyebrow">${spanish ? 'LEE LOS DATOS' : 'READ THE DATA'}</span><h1>${spanish ? 'Explorador de datos' : 'Data explorer'}</h1><p>${spanish ? 'Lee una gráfica, compara cantidades y descubre lo que muestran los datos.' : 'Read a chart, compare amounts, and find out what the data tells you.'}</p></div><div class="data-best-score"><span>${spanish ? 'MEJOR RONDA' : 'PERSONAL BEST'}</span><strong>${best()}<small> / 10</small></strong></div></div><section class="card data-intro-card"><div class="data-intro-icon" aria-hidden="true">📊</div><div><h2>${spanish ? `Explora los datos de ${grade()}` : `Explore data for ${grade()}`}</h2><p>${spanish ? 'En cada pregunta aparece una gráfica nueva. Elige la respuesta que coincide con los datos.' : 'A new chart appears with each question. Choose the answer that matches the data.'}</p><button type="button" class="primary-btn" data-data-action="start">${spanish ? 'Empezar 10 preguntas →' : 'Start 10 questions →'}</button></div></section><section class="card data-history-card"><span class="report-kicker">${spanish ? 'TUS RESULTADOS' : 'YOUR RESULTS'}</span><h2>${spanish ? 'Rondas recientes' : 'Recent rounds'}</h2>${state.history.length ? `<div class="data-history-list">${state.history.slice(0,5).map(item => `<div><span>${item.grade} · ${new Date(item.date).toLocaleDateString(spanish ? 'es' : 'en',{month:'short',day:'numeric'})}</span><strong>${item.score}/10</strong></div>`).join('')}</div>` : `<p>${spanish ? 'Tus rondas terminadas aparecerán aquí.' : 'Your completed rounds will appear here.'}</p>`}</section></div>`;
  }
  function renderRound() {
    const spanish = es(), finished = state.round >= 10;
    title.textContent = spanish ? 'Explorador de datos' : 'Data explorer';
    if (finished) {
      state.history.unshift({ score: state.score, grade: grade(), date: new Date().toISOString() }); state.history = state.history.slice(0,30);
      localStorage.setItem('numoraDataExplorerHistory', JSON.stringify(state.history));
      if (typeof saveCurrentAccountProgress === 'function') saveCurrentAccountProgress();
      root.innerHTML = `<div class="page-wrap data-explorer-page"><section class="card data-round-finish"><div aria-hidden="true">${state.score >= 8 ? '🎉' : '📈'}</div><span class="eyebrow">${spanish ? 'RONDA COMPLETADA' : 'ROUND COMPLETE'}</span><h1>${spanish ? '¡Muy bien!' : 'Well done!'}</h1><p>${spanish ? `Respondiste correctamente ${state.score} de 10.` : `You answered ${state.score} out of 10 correctly.`}</p><strong class="data-final-score">${state.score}<small> / 10</small></strong><p>${spanish ? `Ganaste ${state.score * 5} XP.` : `You earned ${state.score * 5} XP.`}</p><button type="button" class="primary-btn" data-data-action="again">${spanish ? 'Otra ronda' : 'Play another round'}</button><button type="button" class="secondary-btn" data-data-action="home">${spanish ? 'Ver resultados' : 'View results'}</button></section></div>`;
      return;
    }
    if (!state.prompt) buildQuestion();
    const options = state.choices.map((choice,index) => `<button type="button" class="data-answer-option ${state.answered && index === state.correctIndex ? 'is-answer' : ''}" data-data-answer="${index}" ${state.answered ? 'disabled' : ''}>${choice}</button>`).join('');
    root.innerHTML = `<div class="page-wrap data-explorer-page"><div class="hero-row"><div><span class="eyebrow">${spanish ? 'PREGUNTA' : 'QUESTION'}</span><h1>${spanish ? '¿Qué nos dicen los datos?' : 'What does the data tell you?'}</h1><p>${spanish ? `Pregunta ${state.round + 1} de 10 · ${grade()}` : `Question ${state.round + 1} of 10 · ${grade()}`}</p></div><strong class="data-round-count">${state.score}<small> / ${state.round} ${spanish ? 'correctas' : 'correct'}</small></strong></div><section class="card data-question-card"><div class="data-progress" role="progressbar" aria-label="Round progress" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${state.round}"><span style="width:${state.round*10}%"></span></div><h2>${state.prompt}</h2>${renderChart()}<div class="data-answer-grid">${options}</div><p class="data-answer-feedback ${state.feedback.startsWith('✓') ? 'is-correct' : ''}" aria-live="polite">${state.feedback}</p>${state.answered ? `<button type="button" class="primary-btn" data-data-action="next">${spanish ? 'Siguiente gráfica →' : 'Next chart →'}</button>` : ''}</section></div>`;
  }
  function start() { state.round=0; state.score=0; state.prompt=null; buildQuestion(); renderRound(); }
  document.addEventListener('click',event => {
    const target = event.target instanceof Element ? event.target : null;
    const nav = target?.closest('[data-view="data-explorer"]');
    const action = target?.closest('[data-data-action]');
    const answer = target?.closest('[data-data-answer]');
    if (nav) { event.preventDefault(); event.stopImmediatePropagation(); state.history=readHistory(); renderSetup(); document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active',item===nav)); return; }
    if (action) { event.preventDefault(); event.stopImmediatePropagation(); if (action.dataset.dataAction==='start'||action.dataset.dataAction==='again')start(); else if(action.dataset.dataAction==='home'){state.history=readHistory();renderSetup();} else if(action.dataset.dataAction==='next'){state.round++;if(state.round<10)buildQuestion();else state.prompt=null;renderRound();} return; }
    if (!answer || state.answered || !root.querySelector('.data-question-card')) return;
    event.preventDefault(); event.stopImmediatePropagation(); state.answered=true; const correct=Number(answer.dataset.dataAnswer)===state.correctIndex;
    if(correct){state.score++;if(typeof setXpBalance==='function')setXpBalance(getXpBalance()+5,'Correct data question');state.feedback=es()?'✓ ¡Correcto! +5 XP':'✓ Correct! +5 XP';}
    else state.feedback=es()?`La respuesta correcta es ${state.choices[state.correctIndex]}.`:`The correct answer is ${state.choices[state.correctIndex]}.`;
    renderRound();
  },true);
  state.history=readHistory();
})();
