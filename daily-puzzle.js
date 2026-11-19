(() => {
  const STORAGE_KEY = 'numoraDailyPuzzleState';
  const root = document.querySelector('#app-content');
  const title = document.querySelector('#page-title');
  if (!root) return;

  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const isSpanish = () => localStorage.getItem('numoraLanguage') === 'es';
  const gradeNow = () => localStorage.getItem('numoraGrade') || 'Pre-K';
  const dateKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const gradeNumber = grade => Number(grade.match(/\d+/)?.[0] || (grade === 'College' ? 13 : 0));
  const readStates = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch { return {}; }
  };
  const writeStates = states => {
    const kept = Object.fromEntries(Object.entries(states).sort(([a], [b]) => b.localeCompare(a)).slice(0, 120));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kept));
    if (typeof saveCurrentAccountProgress === 'function') saveCurrentAccountProgress();
  };
  const hash = text => {
    let value = 2166136261;
    for (const character of text) value = Math.imul(value ^ character.charCodeAt(0), 16777619);
    return value >>> 0;
  };
  const pick = (seed, slot, size) => (Math.imul(seed + slot * 374761393, 668265263) >>> 0) % size;

  function makePuzzle(grade, day) {
    const seed = hash(`${grade}|${day}`);
    const level = gradeNumber(grade);
    if (level <= 2) {
      const start = 1 + pick(seed, 1, 8), step = 1 + pick(seed, 2, 4);
      const values = [0, 1, 2, 3].map(index => start + step * index);
      const next = start + step * 4;
      return {
        prompt: isSpanish() ? `¿Qué número sigue? ${values.join(', ')}, ___` : `What number comes next? ${values.join(', ')}, ___`,
        answer: next,
        hints: isSpanish() ? [`Compara dos números que están uno junto al otro.`, `Cada paso aumenta en ${step}.`, `Suma ${step} al último número.`] : [`Compare two numbers next to each other.`, `Each step increases by ${step}.`, `Add ${step} to the last number.`],
        explanation: isSpanish() ? `La regla es sumar ${step} cada vez. ${values[3]} + ${step} = ${next}.` : `The rule is to add ${step} each time. ${values[3]} + ${step} = ${next}.`
      };
    }
    if (level <= 5) {
      const multiply = pick(seed, 3, 2) === 1;
      if (multiply) {
        const start = 2 + pick(seed, 4, 5), factor = 2 + pick(seed, 5, 3);
        const values = [start, start * factor, start * factor ** 2, start * factor ** 3];
        const next = start * factor ** 4;
        return {
          prompt: isSpanish() ? `Encuentra el siguiente número: ${values.join(', ')}, ___` : `Find the next number: ${values.join(', ')}, ___`,
          answer: next,
          hints: isSpanish() ? [`Compara cada número con el que viene antes.`, `Busca un factor que se repita.`, `Multiplica el último número por ${factor}.`] : [`Compare each number with the one before it.`, `Look for a factor that repeats.`, `Multiply the last number by ${factor}.`],
          explanation: isSpanish() ? `Cada término se multiplica por ${factor}. ${values[3]} × ${factor} = ${next}.` : `Each term is multiplied by ${factor}. ${values[3]} × ${factor} = ${next}.`
        };
      }
      const start = 3 + pick(seed, 6, 12), step = 2 + pick(seed, 7, 9);
      const values = [0, 1, 2, 3].map(index => start + step * index), next = start + step * 4;
      return {
        prompt: isSpanish() ? `¿Qué número sigue? ${values.join(', ')}, ___` : `What number comes next? ${values.join(', ')}, ___`,
        answer: next,
        hints: isSpanish() ? [`Resta un término del siguiente.`, `La diferencia es ${step}.`, `Suma ${step} al último término.`] : [`Subtract one term from the next.`, `The difference is ${step}.`, `Add ${step} to the last term.`],
        explanation: isSpanish() ? `La secuencia aumenta en ${step}. ${values[3]} + ${step} = ${next}.` : `The sequence increases by ${step}. ${values[3]} + ${step} = ${next}.`
      };
    }
    if (level <= 8) {
      const start = pick(seed, 8, 17) - 8, step = pick(seed, 9, 2) ? 2 + pick(seed, 10, 7) : -(2 + pick(seed, 11, 7));
      const values = [0, 1, 2, 3].map(index => start + step * index), next = start + step * 4;
      return {
        prompt: isSpanish() ? `Completa la secuencia: ${values.join(', ')}, ___` : `Complete the sequence: ${values.join(', ')}, ___`,
        answer: next,
        hints: isSpanish() ? [`Calcula cuánto cambia cada término.`, `La diferencia común es ${step}.`, `Suma ${step} al último término.`] : [`Find how much each term changes.`, `The common difference is ${step}.`, `Add ${step} to the last term.`],
        explanation: isSpanish() ? `La diferencia común es ${step}. ${values[3]} + (${step}) = ${next}.` : `The common difference is ${step}. ${values[3]} + (${step}) = ${next}.`
      };
    }
    const offset = pick(seed, 12, 13) - 6;
    const values = [1, 2, 3, 4].map(number => number * number + offset), next = 25 + offset;
    return {
      prompt: isSpanish() ? `¿Qué número sigue? ${values.join(', ')}, ___` : `What number comes next? ${values.join(', ')}, ___`,
      answer: next,
      hints: isSpanish() ? [`Calcula las diferencias entre términos vecinos.`, `Las diferencias aumentan en 2 cada vez.`, `La siguiente diferencia es 9.`] : [`Find the differences between neighboring terms.`, `The differences increase by 2 each time.`, `The next difference is 9.`],
      explanation: isSpanish() ? `Las diferencias son 3, 5, 7 y luego 9. ${values[3]} + 9 = ${next}.` : `The differences are 3, 5, 7, then 9. ${values[3]} + 9 = ${next}.`
    };
  }

  function streakFor(grade, states, today) {
    const todayKey = `${today}|${grade}`;
    const cursor = new Date(`${today}T12:00:00`);
    if (!states[todayKey]?.solved) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (streak < 366 && states[`${dateKey(cursor)}|${grade}`]?.solved) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function render() {
    const spanish = isSpanish(), grade = gradeNow(), today = dateKey(), key = `${today}|${grade}`;
    const puzzle = makePuzzle(grade, today), states = readStates();
    const progress = states[key] || { solved: false, attempts: 0, hintIndex: 0 };
    const total = Object.entries(states).filter(([entry, item]) => entry.endsWith(`|${grade}`) && item?.solved).length;
    const streak = streakFor(grade, states, today);
    const nextHint = Math.min(Number(progress.hintIndex) || 0, puzzle.hints.length);
    if (title) title.textContent = spanish ? 'Reto diario' : 'Daily puzzle';
    root.innerHTML = `<div class="page-wrap daily-puzzle-page">
      <div class="hero-row"><div><span class="eyebrow">${spanish ? 'UN RETO NUEVO CADA DÍA' : 'A NEW CHALLENGE EACH DAY'}</span><h1>${spanish ? 'Reto matemático diario' : 'Daily math puzzle'}</h1><p>${spanish ? 'Resuelve el acertijo de hoy para practicar patrones y razonamiento.' : 'Solve today’s puzzle to practice patterns and reasoning.'}</p></div><span class="date-label">${escapeHtml(today)}</span></div>
      <div class="daily-puzzle-stats"><section class="card"><span>✦</span><strong>${total}</strong><small>${spanish ? 'Retos resueltos' : 'Puzzles solved'}</small></section><section class="card"><span>🔥</span><strong>${streak}</strong><small>${spanish ? 'Días seguidos' : 'Day streak'}</small></section><section class="card"><span>⚡</span><strong>+10 XP</strong><small>${spanish ? 'Por resolver el reto de hoy' : 'For solving today’s puzzle'}</small></section></div>
      <section class="card daily-puzzle-card"><div class="daily-puzzle-heading"><span class="skill-tag">${escapeHtml(grade)} · ${spanish ? 'PATRONES' : 'PATTERNS'}</span><span class="daily-puzzle-status">${progress.solved ? (spanish ? '✓ Resuelto' : '✓ Solved') : (spanish ? 'Reto de hoy' : 'Today’s puzzle')}</span></div><h2>${escapeHtml(puzzle.prompt)}</h2>
      ${progress.solved ? `<div class="daily-puzzle-feedback is-correct" role="status">${spanish ? '¡Correcto! Ganaste 10 XP.' : 'Correct! You earned 10 XP.'}</div><div class="daily-puzzle-explanation"><strong>${spanish ? 'Cómo funciona' : 'How it works'}</strong><p>${escapeHtml(puzzle.explanation)}</p></div>` : `<form class="daily-puzzle-form"><label for="daily-puzzle-answer">${spanish ? 'Tu respuesta' : 'Your answer'}</label><div class="daily-puzzle-answer-row"><input id="daily-puzzle-answer" inputmode="decimal" autocomplete="off" aria-label="${spanish ? 'Tu respuesta' : 'Your answer'}" /><button type="submit" class="primary-btn">${spanish ? 'Comprobar' : 'Check answer'}</button></div></form><div class="daily-puzzle-feedback" data-puzzle-feedback role="status" aria-live="polite"></div><div class="daily-puzzle-hints"><button type="button" class="secondary-btn" data-puzzle-action="hint">${spanish ? 'Pista' : 'Hint'} · ${nextHint}/${puzzle.hints.length}</button>${nextHint ? `<p>${escapeHtml(puzzle.hints[nextHint - 1])}</p>` : `<p>${spanish ? 'Puedes pedir hasta tres pistas.' : 'You can reveal up to three hints.'}</p>`}</div><p class="daily-puzzle-attempts">${spanish ? 'Intentos' : 'Attempts'}: <strong>${Math.max(0, Number(progress.attempts) || 0)}</strong></p>`}
      </section><p class="daily-puzzle-note">${spanish ? 'Un reto nuevo aparecerá mañana. Tu progreso se guarda en esta cuenta.' : 'A fresh puzzle arrives tomorrow. Your progress is saved with this account.'}</p></div>`;
    const form = root.querySelector('.daily-puzzle-form');
    form?.addEventListener('submit', event => { event.preventDefault(); checkAnswer({ grade, today, key, puzzle, progress, states, spanish }); });
    root.querySelector('[data-puzzle-action="hint"]')?.addEventListener('click', () => {
      progress.hintIndex = Math.min(puzzle.hints.length, (Number(progress.hintIndex) || 0) + 1);
      states[key] = progress;
      writeStates(states);
      render();
    });
  }

  function checkAnswer({ grade, today, key, puzzle, progress, states, spanish }) {
    const input = root.querySelector('#daily-puzzle-answer'), feedback = root.querySelector('[data-puzzle-feedback]');
    if (!input || !feedback) return;
    if (!input.value.trim()) { feedback.textContent = spanish ? 'Escribe una respuesta primero.' : 'Enter an answer first.'; input.focus(); return; }
    const answer = Number(input.value);
    progress.attempts = Math.max(0, Number(progress.attempts) || 0) + 1;
    if (Number.isFinite(answer) && Math.abs(answer - puzzle.answer) < 0.000001) {
      progress.solved = true;
      progress.solvedAt = new Date().toISOString();
      states[key] = progress;
      writeStates(states);
      if (typeof getXpBalance === 'function' && typeof setXpBalance === 'function') setXpBalance(getXpBalance() + 10, 'Daily math puzzle');
      if (typeof showToast === 'function') showToast(spanish ? '¡Reto resuelto! +10 XP' : 'Puzzle solved! +10 XP');
      render();
      return;
    }
    states[key] = progress;
    writeStates(states);
    feedback.className = 'daily-puzzle-feedback is-try-again';
    feedback.textContent = spanish ? 'Todavía no. Revisa el patrón e inténtalo otra vez.' : 'Not quite yet. Look at the pattern and try again.';
    const attempts = root.querySelector('.daily-puzzle-attempts strong');
    if (attempts) attempts.textContent = String(progress.attempts);
    input.select();
  }

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const nav = event.target.closest('[data-view="daily-puzzle"]');
    if (!nav) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    render();
    document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item === nav));
  }, true);
})();
