(() => {
  const key = 'numoraPracticeQueue';
  const read = () => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value.filter(item => item && typeof item.grade === 'string' && typeof item.lesson === 'string') : [];
    } catch { return []; }
  };
  const save = queue => {
    localStorage.setItem(key, JSON.stringify(queue.slice(0, 30)));
    window.saveCurrentAccountProgress?.();
    updateCount();
  };
  const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const spanish = () => localStorage.getItem('numoraLanguage') === 'es';
  function updateCount() {
    const count = read().length;
    document.querySelectorAll('.practice-queue-count').forEach(node => node.textContent = count);
  }
  window.numoraPracticeQueueCompleted = (grade, lesson) => {
    const queue = read();
    const index = queue.findIndex(item => item.grade === grade && item.lesson === lesson);
    if (index >= 0) save(queue.filter((_, itemIndex) => itemIndex !== index));
  };
  function render() {
    const queue = read();
    const isEs = spanish();
    const content = document.querySelector('#app-content');
    const title = document.querySelector('#page-title');
    if (!content) return;
    if (title) title.textContent = isEs ? 'Lista de práctica' : 'Practice queue';
    const grades = Object.keys(gradeSkillNames || {});
    const grade = localStorage.getItem('numoraGrade') || 'Pre-K';
    const options = grades.map(name => `<option value="${esc(name)}" ${name === grade ? 'selected' : ''}>${esc(name)}</option>`).join('');
    const lessonOptions = (gradeSkillNames[grade] || []).map(name => `<option value="${esc(name)}">${esc(name)}</option>`).join('');
    content.innerHTML = `<div class="page-wrap practice-queue-page"><div class="hero-row"><div><span class="eyebrow">${isEs ? 'TU PRÓXIMA SESIÓN' : 'YOUR NEXT SESSION'}</span><h1>${isEs ? 'Crea una lista de práctica' : 'Build a practice queue'}</h1><p>${isEs ? 'Elige lecciones y practícalas en el orden que quieras.' : 'Pick lessons and practice them in the order you choose.'}</p></div><button type="button" class="secondary-btn" data-queue-action="shuffle" ${queue.length < 2 ? "disabled" : ""}>${isEs ? "🔀 Mezclar lista" : "🔀 Shuffle queue"}</button><button type="button" class="secondary-btn" data-queue-action="mix" ${queue.length >= 30 ? "disabled" : ""}>${isEs ? "✨ Crear mezcla de 3" : "✨ Build a 3-lesson mix"}</button><button type="button" class="secondary-btn" data-queue-action="clear" ${queue.length ? '' : 'disabled'}>${isEs ? 'Vaciar lista' : 'Clear queue'}</button></div><section class="card queue-add-card"><label>${isEs ? 'Grado' : 'Grade'}<select id="queue-grade">${options}</select></label><label>${isEs ? 'Lección' : 'Lesson'}<select id="queue-lesson">${lessonOptions}</select></label><button type="button" class="primary-btn" data-queue-action="add">${isEs ? '＋ Añadir lección' : '＋ Add lesson'}</button></section><section class="queue-list-section"><div class="queue-heading"><h2>${isEs ? 'Tu lista' : 'Your queue'}</h2><span>${queue.length} / 30</span></div>${queue.length ? `<ol class="practice-queue-list">${queue.map((item,index) => `<li class="card queue-item"><span class="queue-position">${index+1}</span><div class="queue-item-copy"><strong>${esc(item.lesson)}</strong><small>${esc(item.grade)} Math</small></div><div class="queue-item-actions"><button type="button" class="secondary-btn" data-queue-action="up" data-index="${index}" aria-label="Move ${esc(item.lesson)} up" ${index===0?'disabled':''}>↑</button><button type="button" class="secondary-btn" data-queue-action="down" data-index="${index}" aria-label="Move ${esc(item.lesson)} down" ${index===queue.length-1?'disabled':''}>↓</button><button type="button" class="secondary-btn" data-queue-action="remove" data-index="${index}">${isEs?'Quitar':'Remove'}</button><button type="button" class="primary-btn" data-queue-action="start" data-index="${index}">${isEs?'Empezar':'Start'} →</button></div></li>`).join('')}</ol>` : `<section class="card empty-state"><div style="font-size:42px">☷</div><h2>${isEs ? 'Tu lista está vacía' : 'Your queue is empty'}</h2><p>${isEs ? 'Añade algunas lecciones para preparar tu próxima sesión.' : 'Add a few lessons to plan your next practice session.'}</p><button type="button" class="secondary-btn" data-view="skills">${isEs?'Explorar lecciones':'Explore lessons'}</button></section>`}</section></div>`;
  }
  function chooseView() {
    render();
    document.querySelectorAll('.nav-item').forEach(node => node.classList.toggle('active', node.dataset.view === 'practice-queue'));
  }
  document.addEventListener('click', event => {
    const nav = event.target instanceof Element ? event.target.closest('[data-view="practice-queue"]') : null;
    if (nav) { event.preventDefault(); event.stopImmediatePropagation(); chooseView(); return; }
    const cardAdd = event.target instanceof Element ? event.target.closest('[data-queue-add]') : null;
    if (cardAdd) {
      event.preventDefault(); event.stopImmediatePropagation();
      const grade = cardAdd.dataset.queueGrade;
      const lesson = cardAdd.dataset.queueLesson;
      const queue = read();
      if (queue.some(item => item.grade === grade && item.lesson === lesson)) { window.showToast?.(spanish() ? 'Esa lección ya está en tu lista.' : 'That lesson is already in your queue.'); return; }
      if (queue.length >= 30) { window.showToast?.(spanish() ? 'La lista puede tener hasta 30 lecciones.' : 'Your queue can hold up to 30 lessons.'); return; }
      queue.push({grade,lesson}); save(queue);
      cardAdd.textContent = spanish() ? '✓ Añadida a la lista' : '✓ Added to queue';
      cardAdd.disabled = true;
      window.showToast?.(spanish() ? 'Lección añadida a tu lista.' : 'Lesson added to your queue.');
      return;
    }
    const button = event.target instanceof Element ? event.target.closest('[data-queue-action]') : null;
    if (!button) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const queue = read();
    const action = button.dataset.queueAction;
    const index = Number(button.dataset.index);
    if (action === 'add') {
      const grade = document.querySelector('#queue-grade')?.value || 'Pre-K';
      const lesson = document.querySelector('#queue-lesson')?.value;
      if (!lesson || queue.some(item => item.grade === grade && item.lesson === lesson)) { window.showToast?.(spanish() ? 'Esa lección ya está en tu lista.' : 'That lesson is already in your queue.'); return; }
      if (queue.length >= 30) { window.showToast?.(spanish() ? 'La lista puede tener hasta 30 lecciones.' : 'Your queue can hold up to 30 lessons.'); return; }
      queue.push({grade,lesson}); save(queue); render(); window.showToast?.(spanish() ? 'Lección añadida.' : 'Lesson added.'); return;
    }
    if (action === 'shuffle') {
      for (let i = queue.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [queue[i], queue[j]] = [queue[j], queue[i]]; }
      save(queue); render();
      window.showToast?.(spanish() ? 'Tu lista está mezclada.' : 'Your queue is shuffled.');
      return;
    }
    if (action === 'mix') {
      const grade = document.querySelector('#queue-grade')?.value || localStorage.getItem('numoraGrade') || 'Pre-K';
      const names = gradeSkillNames[grade] || [];
      const candidates = names.filter(lesson => !queue.some(item => item.grade === grade && item.lesson === lesson) && savedLessonQuestionCount(grade, lesson) < 10);
      for (let i = candidates.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [candidates[i], candidates[j]] = [candidates[j], candidates[i]]; }
      const picks = candidates.slice(0, Math.min(3, 30 - queue.length));
      if (!picks.length) { window.showToast?.(spanish() ? 'No hay lecciones sin terminar disponibles.' : 'No unfinished lessons are available to add.'); return; }
      queue.push(...picks.map(lesson => ({grade, lesson})));
      save(queue); render();
      window.showToast?.(spanish() ? `${picks.length} lecciones añadidas a tu lista.` : `Added ${picks.length} lessons to your queue.`);
      return;
    }
    if (action === 'remove') queue.splice(index,1);
    if (action === 'clear') queue.splice(0);
    if (action === 'up' && index > 0) [queue[index-1],queue[index]] = [queue[index],queue[index-1]];
    if (action === 'down' && index < queue.length-1) [queue[index+1],queue[index]] = [queue[index],queue[index+1]];
    if (action === 'start' && queue[index]) {
      const item = queue[index];
      selectedGrade = item.grade;
      localStorage.setItem('numoraGrade', item.grade);
      window.syncProfile?.();
      window.practiceView?.(item.lesson);
      document.querySelectorAll('.nav-item').forEach(node => node.classList.remove('active'));
      return;
    }
    save(queue); render();
  }, true);
  document.addEventListener('change', event => {
    if (event.target?.id !== 'queue-grade') return;
    const lessonSelect = document.querySelector('#queue-lesson');
    const names = gradeSkillNames[event.target.value] || [];
    if (lessonSelect) lessonSelect.innerHTML = names.map(name => `<option value="${esc(name)}">${esc(name)}</option>`).join('');
  });
  window.addEventListener('storage', updateCount);
  document.addEventListener('DOMContentLoaded', updateCount);
  updateCount();
})();
