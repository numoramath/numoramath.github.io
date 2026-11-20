(() => {
  let reviewItems = [];
  let reviewIndex = 0;
  let revealed = false;
  let gotIt = 0;
  let retryLater = 0;

  function readSaved() {
    try {
      const value = JSON.parse(localStorage.getItem('numoraQuestionBookmarks') || '[]');
      return Array.isArray(value) ? value.filter(item => item && typeof item.id === 'string' && typeof item.prompt === 'string') : [];
    } catch { return []; }
  }

  function saveSaved(items) {
    localStorage.setItem('numoraQuestionBookmarks', JSON.stringify(items.slice(0, 200)));
    saveCurrentAccountProgress();
  }

  function addEntryPoint() {
    const list = content.querySelector('.saved-question-list');
    if (!list || content.querySelector('.saved-review-entry')) return;
    const items = readSaved();
    const due = items.filter(item => !Number(item.reviewDueAt) || Number(item.reviewDueAt) <= Date.now()).length;
    const spanish = localStorage.getItem('numoraLanguage') === 'es';
    const card = document.createElement('section');
    card.className = 'card saved-review-entry';
    card.innerHTML = `<div><span class="report-kicker">${spanish ? 'REPASO INTELIGENTE' : 'SMART REVIEW'}</span><h2>${spanish ? 'Repasa tus preguntas guardadas' : 'Review saved questions'}</h2><p>${spanish ? 'Las preguntas pendientes aparecen primero. Tu respuesta ayuda a programar el próximo repaso.' : 'Due questions come first. Your recall schedules when each question comes back.'}</p></div><button type="button" class="primary-btn" data-saved-review="start">${spanish ? `Empezar repaso · ${due} pendientes` : `Start review · ${due} due`}</button>`;
    list.before(card);
  }

  function renderReview() {
    const spanish = localStorage.getItem('numoraLanguage') === 'es';
    if (reviewIndex >= reviewItems.length) {
      pageTitle.textContent = spanish ? 'Repaso terminado' : 'Review complete';
      content.innerHTML = `<div class="page-wrap"><section class="card empty-state saved-review-finish"><div class="saved-review-finish-icon">${reviewItems.length ? '🎉' : '🔖'}</div><h1>${reviewItems.length ? (spanish ? '¡Repaso terminado!' : 'Review complete!') : (spanish ? 'No hay preguntas guardadas' : 'No saved questions yet')}</h1><p>${spanish ? `Recordaste ${gotIt} ${gotIt === 1 ? 'pregunta' : 'preguntas'} y programaste ${retryLater} ${retryLater === 1 ? 'para repasarla' : 'para repasarlas'} de nuevo pronto.` : `You recalled ${gotIt} ${gotIt === 1 ? 'question' : 'questions'} and scheduled ${retryLater} for another look soon.`}</p><button type="button" class="primary-btn" data-saved-review="back">${spanish ? 'Volver a preguntas guardadas' : 'Back to saved questions'}</button></section></div>`;
      return;
    }
    const item = reviewItems[reviewIndex];
    pageTitle.textContent = spanish ? 'Repaso de preguntas' : 'Saved question review';
    content.innerHTML = `<div class="page-wrap saved-review-page"><div class="hero-row"><div><span class="eyebrow">${spanish ? 'REPASO INTELIGENTE' : 'SMART REVIEW'}</span><h1>${spanish ? 'Preguntas guardadas' : 'Saved questions'}</h1><p>${spanish ? 'Intenta responder antes de revelar la solución.' : 'Try to answer from memory before revealing the solution.'}</p></div><button type="button" class="secondary-btn" data-saved-review="back">${spanish ? 'Salir del repaso' : 'Exit review'}</button></div><section class="card saved-review-card"><div class="saved-review-meta"><span class="skill-tag">${escapeHtmlText(item.grade || '')} · ${escapeHtmlText(item.lesson || '')}</span><strong>${reviewIndex + 1} / ${reviewItems.length}</strong></div><div class="progress-line"><span style="width:${Math.round((reviewIndex + 1) / reviewItems.length * 100)}%"></span></div><h2>${escapeHtmlText(item.prompt)}</h2>${revealed ? `<div class="saved-review-answer"><strong>${spanish ? 'Respuesta' : 'Answer'}</strong><p>${escapeHtmlText(item.answer ?? '')}</p>${item.explanation ? `<small>${escapeHtmlText(item.explanation)}</small>` : ''}</div><p class="saved-review-rate-prompt">${spanish ? '¿Cómo te fue?' : 'How did you do?'}</p><div class="saved-review-actions"><button type="button" class="secondary-btn" data-saved-review="again">${spanish ? 'Repasar pronto' : 'Review again soon'}</button><button type="button" class="primary-btn" data-saved-review="known">${spanish ? 'Lo sabía' : 'I knew it'}</button></div>` : `<button type="button" class="primary-btn" data-saved-review="reveal">${spanish ? 'Revelar respuesta' : 'Reveal answer'}</button>`}</section></div>`;
  }

  function beginReview() {
    const items = readSaved();
    items.sort((a, b) => (Number(a.reviewDueAt) || 0) - (Number(b.reviewDueAt) || 0) || String(a.savedAt || '').localeCompare(String(b.savedAt || '')));
    reviewItems = items.slice(0, 5);
    reviewIndex = 0;
    revealed = false;
    gotIt = 0;
    retryLater = 0;
    if (!reviewItems.length) { renderReview(); return; }
    renderReview();
  }

  function rateQuestion(knewIt) {
    const reviewed = reviewItems[reviewIndex];
    const all = readSaved();
    const target = all.find(item => item.id === reviewed.id);
    if (target) {
      const stage = knewIt ? Math.min(5, (Number(target.reviewStage) || 0) + 1) : 0;
      const intervals = [1, 3, 7, 14, 30];
      target.reviewStage = stage;
      target.reviewDueAt = Date.now() + (knewIt ? intervals[stage - 1] * 86400000 : 10 * 60000);
      target.lastReviewedAt = new Date().toISOString();
      saveSaved(all);
    }
    if (knewIt) gotIt++; else retryLater++;
    reviewIndex++;
    revealed = false;
    renderReview();
  }

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('[data-saved-review]');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const action = button.dataset.savedReview;
    if (action === 'start') { beginReview(); return; }
    if (action === 'back') {
      const nav = document.querySelector('[data-view="questions"]');
      if (nav) nav.click(); else savedQuestionsView();
      return;
    }
    if (action === 'reveal') { revealed = true; renderReview(); return; }
    if (action === 'known') { rateQuestion(true); return; }
    if (action === 'again') rateQuestion(false);
  }, true);

  new MutationObserver(addEntryPoint).observe(content, { childList: true, subtree: true });
})();
