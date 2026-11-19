(() => {
  const root = document.querySelector('#app-content');
  const title = document.querySelector('#page-title');
  if (!root || !title) return;

  const state = { operation: 'mixed', question: 0, correct: 0, streak: 0, bestStreak: 0, current: null, answered: false, feedback: '', history: [] };
  const isSpanish = () => localStorage.getItem('numoraLanguage') === 'es';
  const gradeName = () => localStorage.getItem('numoraGrade') || 'Pre-K';
  const gradeRank = () => {
    const match = /^Grade (\d+)$/.exec(gradeName());
    if (match) return Number(match[1]);
    if (gradeName() === 'Kindergarten') return 0;
    if (gradeName() === 'College') return 13;
    return 0;
  };
  const readHistory = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('numoraFactDrillHistory') || '[]');
      return Array.isArray(saved) ? saved.filter(item => item && Number.isFinite(item.score)).slice(0, 50) : [];
    } catch { return []; }
  };
  const saveHistory = () => {
    state.history.unshift({ score: state.correct, total: 10, operation: state.operation, grade: gradeName(), date: new Date().toISOString() });
    state.history = state.history.slice(0, 50);
    localStorage.setItem('numoraFactDrillHistory', JSON.stringify(state.history));
    if (typeof saveCurrentAccountProgress === 'function') saveCurrentAccountProgress();
  };
  const operations = () => {
    const rank = gradeRank();
    return [
      { id: 'addition', symbol: '+', en: 'Addition', es: 'Suma', available: true },
      { id: 'subtraction', symbol: '−', en: 'Subtraction', es: 'Resta', available: true },
      { id: 'multiplication', symbol: '×', en: 'Multiplication', es: 'Multiplicación', available: rank >= 2 },
      { id: 'division', symbol: '÷', en: 'Division', es: 'División', available: rank >= 3 },
      { id: 'mixed', symbol: '＋', en: 'Mixed', es: 'Mixtas', available: true },
    ];
  };
  const rand = max => Math.floor(Math.random() * max) + 1;
  function makeQuestion() {
    const available = operations().filter(item => item.available && item.id !== 'mixed');
    const operation = state.operation === 'mixed' ? available[Math.floor(Math.random() * available.length)].id : state.operation;
    const rank = gradeRank();
    const early = rank <= 1;
    let a, b, answer, prompt;
    if (operation === 'addition') {
      const limit = early ? 10 : rank < 4 ? 20 : rank < 7 ? 100 : 999;
      a = Math.floor(Math.random() * (limit + 1)); b = Math.floor(Math.random() * (limit - a + 1)); answer = a + b; prompt = `${a} + ${b}`;
    } else if (operation === 'subtraction') {
      const limit = early ? 10 : rank < 4 ? 20 : rank < 7 ? 100 : 999;
      a = rand(limit); b = Math.floor(Math.random() * (a + 1)); answer = a - b; prompt = `${a} − ${b}`;
    } else if (operation === 'multiplication') {
      const cap = rank >= 5 ? 15 : 12;
      a = rand(cap); b = rand(cap); answer = a * b; prompt = `${a} × ${b}`;
    } else {
      const cap = rank >= 5 ? 15 : 12;
      b = rand(cap); answer = rand(cap); a = b * answer; prompt = `${a} ÷ ${b}`;
    }
    state.current = { operation, a, b, answer, prompt };
    state.answered = false;
    state.feedback = '';
  }
  function bestScore() { return Math.max(0, ...state.history.filter(item => item.grade === gradeName()).map(item => item.score)); }
  function renderSetup() {
    const es = isSpanish(), best = bestScore();
    title.textContent = es ? 'Práctica de operaciones' : 'Math facts';
    const choices = operations().map(item => `<button type="button" class="fact-operation ${state.operation === item.id ? 'is-selected' : ''}" data-fact-operation="${item.id}" ${item.available ? '' : 'disabled'} aria-pressed="${state.operation === item.id}"><span>${item.symbol}</span>${es ? item.es : item.en}${item.available ? '' : `<small>${es ? `Se desbloquea en ${item.id === 'division' ? '3.º' : '2.º'} grado` : `Available from Grade ${item.id === 'division' ? '3' : '2'}`}</small>`}</button>`).join('');
    root.innerHTML = `<div class="page-wrap fact-drill-page"><div class="hero-row"><div><span class="eyebrow">${es ? 'PRACTICA A TU RITMO' : 'BUILD YOUR NUMBER SENSE'}</span><h1>${es ? 'Práctica de operaciones' : 'Math facts'}</h1><p>${es ? `Elige una operación para ${gradeName()} y practica con una ronda rápida de 10 preguntas.` : `Choose an operation for ${gradeName()} and practice with a quick 10-question round.`}</p></div><div class="fact-best-score"><span>${es ? 'MEJOR RESULTADO' : 'PERSONAL BEST'}</span><strong>${best}<small> / 10</small></strong></div></div><section class="card fact-operation-picker"><h2>${es ? '¿Qué quieres practicar?' : 'What would you like to practice?'}</h2><div class="fact-operation-grid">${choices}</div><button type="button" class="primary-btn fact-start" data-fact-action="start">${es ? 'Empezar ronda de 10 →' : 'Start 10-question round →'}</button></section><section class="card fact-history"><div><span class="report-kicker">${es ? 'TUS RONDAS' : 'YOUR PRACTICE'}</span><h2>${es ? 'Resultados recientes' : 'Recent results'}</h2></div>${state.history.length ? `<div class="fact-history-list">${state.history.slice(0, 5).map(item => `<div><span>${item.operation === 'mixed' ? (es ? 'Mixtas' : 'Mixed') : (operations().find(op => op.id === item.operation)?.[es ? 'es' : 'en'] || item.operation)} · ${item.grade}</span><strong>${item.score}/10</strong><small>${new Date(item.date).toLocaleDateString(es ? 'es' : 'en', { month: 'short', day: 'numeric' })}</small></div>`).join('')}</div>` : `<p>${es ? 'Tus rondas completadas aparecerán aquí.' : 'Completed rounds will show up here.'}</p>`}</section></div>`;
  }
  function renderRound() {
    const es = isSpanish(), complete = state.question >= 10;
    title.textContent = es ? 'Práctica de operaciones' : 'Math facts';
    if (complete) {
      root.innerHTML = `<div class="page-wrap fact-drill-page"><section class="card fact-round-finish"><div class="fact-finish-mark">${state.correct >= 8 ? '🎉' : '🌟'}</div><span class="eyebrow">${es ? 'RONDA TERMINADA' : 'ROUND COMPLETE'}</span><h1>${es ? '¡Buen trabajo!' : 'Nice work!'}</h1><p>${es ? `Respondiste correctamente ${state.correct} de 10 preguntas.` : `You answered ${state.correct} out of 10 questions correctly.`}</p><div class="fact-round-score">${state.correct}<small> / 10</small></div><p>${es ? `Mejor racha: ${state.bestStreak}. Ganaste ${state.correct * 5} XP.` : `Best streak: ${state.bestStreak}. You earned ${state.correct * 5} XP.`}</p><button type="button" class="primary-btn" data-fact-action="again">${es ? 'Practicar otra vez' : 'Practice another round'}</button><button type="button" class="secondary-btn" data-fact-action="setup">${es ? 'Cambiar operación' : 'Choose another operation'}</button></section></div>`;
      return;
    }
    if (!state.current) makeQuestion();
    root.innerHTML = `<div class="page-wrap fact-drill-page"><div class="hero-row"><div><span class="eyebrow">${es ? 'RONDA DE OPERACIONES' : 'MATH FACTS ROUND'}</span><h1>${es ? 'Sigue practicando' : 'Keep your momentum'}</h1><p>${es ? `Pregunta ${state.question + 1} de 10 · ${gradeName()}` : `Question ${state.question + 1} of 10 · ${gradeName()}`}</p></div><div class="fact-round-score">${state.correct}<small> / ${state.question + (state.answered ? 1 : 0)} ${es ? 'correctas' : 'correct'}</small></div></div><section class="card fact-question-card"><div class="fact-progress" role="progressbar" aria-label="Round progress" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${state.question}"><span style="width:${state.question * 10}%"></span></div><span class="report-kicker">${es ? `RACHA · ${state.streak}` : `STREAK · ${state.streak}`}</span><h2>${state.current.prompt} = ?</h2><label for="fact-answer">${es ? 'Tu respuesta' : 'Your answer'}</label><input id="fact-answer" type="number" inputmode="numeric" autocomplete="off" aria-label="${es ? 'Tu respuesta' : 'Your answer'}" ${state.answered ? 'disabled' : ''}><p class="fact-feedback ${state.feedback.startsWith('✓') ? 'is-correct' : ''}" aria-live="polite">${state.feedback}</p><div class="fact-round-actions">${state.answered ? `<button type="button" class="primary-btn" data-fact-action="next">${es ? 'Siguiente pregunta →' : 'Next question →'}</button>` : `<button type="button" class="primary-btn" data-fact-action="check">${es ? 'Comprobar' : 'Check answer'}</button><button type="button" class="secondary-btn" data-fact-action="skip">${es ? 'Saltar' : 'Skip'}</button>`}</div></section></div>`;
    if (!state.answered) requestAnimationFrame(() => root.querySelector('#fact-answer')?.focus({ preventScroll: true }));
  }
  function startRound() { state.question = 0; state.correct = 0; state.streak = 0; state.bestStreak = 0; state.current = null; makeQuestion(); renderRound(); }
  function advance() {
    state.question++;
    if (state.question === 10) { saveHistory(); renderRound(); return; }
    makeQuestion(); renderRound();
  }
  document.addEventListener('click', event => {
    const nav = event.target instanceof Element && event.target.closest('[data-view="fact-drill"]');
    const action = event.target instanceof Element && event.target.closest('[data-fact-action]');
    const operation = event.target instanceof Element && event.target.closest('[data-fact-operation]');
    if (nav) { event.preventDefault(); event.stopImmediatePropagation(); state.history = readHistory(); state.operation = 'mixed'; renderSetup(); document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item === nav)); return; }
    if (operation) { event.preventDefault(); event.stopImmediatePropagation(); if (!operation.disabled) { state.operation = operation.dataset.factOperation; renderSetup(); } return; }
    if (!action || !root.querySelector('.fact-drill-page')) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const kind = action.dataset.factAction;
    if (kind === 'setup') { renderSetup(); return; }
    if (kind === 'start' || kind === 'again') { startRound(); return; }
    if (kind === 'next') { advance(); return; }
    if (kind === 'skip') { state.streak = 0; advance(); return; }
    if (kind === 'check' && !state.answered) {
      const input = root.querySelector('#fact-answer');
      if (!input || input.value.trim() === '') { state.feedback = isSpanish() ? 'Escribe una respuesta primero.' : 'Enter an answer first.'; renderRound(); return; }
      state.answered = true;
      if (Number(input.value) === state.current.answer) {
        state.correct++; state.streak++; state.bestStreak = Math.max(state.bestStreak, state.streak);
        if (typeof setXpBalance === 'function') setXpBalance(getXpBalance() + 5, 'Correct math fact');
        state.feedback = isSpanish() ? '✓ ¡Correcto! +5 XP' : '✓ Correct! +5 XP';
      } else { state.streak = 0; state.feedback = isSpanish() ? `La respuesta es ${state.current.answer}.` : `The answer is ${state.current.answer}.`; }
      renderRound();
    }
  }, true);
  document.addEventListener('keydown', event => {
    if (event.key === 'Enter' && event.target instanceof Element && event.target.id === 'fact-answer') root.querySelector('[data-fact-action="check"]')?.click();
  });
  state.history = readHistory();
})();
