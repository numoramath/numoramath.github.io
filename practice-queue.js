(() => {
  const key = 'numoraPracticeQueue';
  const contentRoot = document.querySelector('#app-content');
  let draggedIndex = null;
  const read = () => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      if (!Array.isArray(value)) return [];
      const seen = new Set();
      return value.filter(item => {
        if (!item || typeof item.grade !== 'string' || typeof item.lesson !== 'string') return false;
        const id = `${item.grade}|${item.lesson}`;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      }).slice(0, 30);
    } catch { return []; }
  };
  const readPlans = () => {
    try {
      const value = JSON.parse(localStorage.getItem('numoraSavedPlaylists') || '[]');
      return Array.isArray(value) ? value.filter(plan => plan && typeof plan.id === 'string' && typeof plan.name === 'string' && Array.isArray(plan.items)).slice(0, 20).map(plan => ({...plan, items:plan.items.filter(item => item && typeof item.grade === 'string' && typeof item.lesson === 'string').slice(0,30)})) : [];
    } catch { return []; }
  };
  const savePlans = plans => {
    localStorage.setItem('numoraSavedPlaylists', JSON.stringify(plans.slice(0, 20)));
    window.saveCurrentAccountProgress?.();
  };
  const save = queue => {
    localStorage.setItem(key, JSON.stringify(queue.slice(0, 30)));
    window.saveCurrentAccountProgress?.();
    updateCount();
  };
  const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const spanish = () => localStorage.getItem('numoraLanguage') === 'es';
  const lessonCount = item => Math.min(10, Math.max(0, Number(savedLessonQuestionCount(item.grade, item.lesson)) || 0));
  function updateCount() {
    const count = read().length;
    document.querySelectorAll('.practice-queue-count').forEach(node => node.textContent = String(count));
  }
  window.updatePracticeQueueCount = updateCount;
  window.numoraPracticeQueueHas = (grade, lesson) => read().some(item => item.grade === grade && item.lesson === lesson);
  window.numoraAddToPracticeQueue = (grade, lesson) => {
    const queue = read();
    if (queue.some(item => item.grade === grade && item.lesson === lesson)) return 'duplicate';
    if (queue.length >= 30) return 'full';
    queue.push({grade, lesson});
    save(queue);
    return 'added';
  };
  window.numoraPracticeQueueCompleted = (grade, lesson) => {
    const queue = read();
    const index = queue.findIndex(item => item.grade === grade && item.lesson === lesson);
    if (index >= 0) { queue.splice(index, 1); save(queue); }
    return queue[0] || null;
  };
  function render() {
    updateCount();
    const queue = read();
    const isEs = spanish();
    const remainingQuestions = queue.reduce((sum, item) => sum + 10 - lessonCount(item), 0);
    const content = document.querySelector('#app-content');
    const title = document.querySelector('#page-title');
    if (!content) return;
    if (title) title.textContent = isEs ? 'Lista de práctica' : 'Practice queue';
    const grades = Object.keys(gradeSkillNames || {});
    const grade = localStorage.getItem('numoraGrade') || 'Pre-K';
    const options = grades.map(name => `<option value="${esc(name)}" ${name === grade ? 'selected' : ''}>${esc(name)}</option>`).join('');
    const lessonOptions = (gradeSkillNames[grade] || []).map(name => `<option value="${esc(name)}">${esc(name)}</option>`).join('');
    content.innerHTML = `<div class="page-wrap practice-queue-page"><div class="hero-row"><div><span class="eyebrow">${isEs ? 'TU PRÓXIMA SESIÓN' : 'YOUR NEXT SESSION'}</span><h1>${isEs ? 'Crea una lista de práctica' : 'Build a practice queue'}</h1><p>${isEs ? 'Elige lecciones y practícalas en el orden que quieras.' : 'Pick lessons and practice them in the order you choose.'}</p></div><div class="queue-toolbar"><button type="button" class="secondary-btn" data-queue-action="shuffle" ${queue.length < 2 ? "disabled" : ""}>${isEs ? "🔀 Mezclar lista" : "🔀 Shuffle queue"}</button><button type="button" class="secondary-btn" data-queue-action="mix" ${queue.length >= 30 ? "disabled" : ""}>${isEs ? "✨ Crear mezcla de 3" : "✨ Build a 3-lesson mix"}</button><button type="button" class="secondary-btn" data-queue-action="trouble" ${queue.length >= 30 ? "disabled" : ""}>${isEs ? "🎯 Practicar puntos difíciles" : "🎯 Practice trouble spots"}</button><button type="button" class="secondary-btn" data-queue-action="fill" ${queue.length >= 30 ? "disabled" : ""}>${isEs ? "＋ Añadir pendientes" : "＋ Fill with unfinished"}</button><button type="button" class="secondary-btn" data-queue-action="export" ${queue.length ? "" : "disabled"}>${isEs ? "⬇ Descargar plan" : "⬇ Download plan"}</button><button type="button" class="secondary-btn" data-queue-action="clear" ${queue.length ? '' : 'disabled'}>${isEs ? 'Vaciar lista' : 'Clear queue'}</button></div></div><section class="card queue-add-card"><label>${isEs ? 'Grado' : 'Grade'}<select id="queue-grade">${options}</select></label><label>${isEs ? 'Lección' : 'Lesson'}<select id="queue-lesson">${lessonOptions}</select></label><button type="button" class="primary-btn" data-queue-action="add">${isEs ? '＋ Añadir lección' : '＋ Add lesson'}</button></section><section class="queue-list-section"><div class="queue-heading"><h2>${isEs ? 'Tu lista' : 'Your queue'}</h2><span>${queue.length} / 30 · ${remainingQuestions} ${isEs ? "preguntas restantes" : "questions left"}</span></div>${queue.length ? `<ol class="practice-queue-list">${queue.map((item,index) => `<li class="card queue-item" draggable="true" data-queue-drag-index="${index}"><span class="queue-position">${index+1}</span><div class="queue-item-copy"><strong>${esc(item.lesson)}</strong><small>${esc(item.grade)} Math</small><div class="queue-progress" role="progressbar" aria-label="${esc(item.lesson)} progress" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${lessonCount(item)}"><span style="width:${lessonCount(item)*10}%"></span></div><small>${lessonCount(item)} / 10 ${isEs ? "completadas" : "complete"} · ${10-lessonCount(item)} ${isEs ? "restantes" : "left"}</small></div><div class="queue-item-actions"><button type="button" class="secondary-btn" data-queue-action="up" data-index="${index}" aria-label="Move ${esc(item.lesson)} up" ${index===0?'disabled':''}>↑</button><button type="button" class="secondary-btn" data-queue-action="down" data-index="${index}" aria-label="Move ${esc(item.lesson)} down" ${index===queue.length-1?'disabled':''}>↓</button><button type="button" class="secondary-btn" data-queue-action="remove" data-index="${index}">${isEs?'Quitar':'Remove'}</button><button type="button" class="primary-btn" data-queue-action="start" data-index="${index}">${isEs?'Empezar':'Start'} →</button></div></li>`).join('')}</ol>` : `<section class="card empty-state"><div style="font-size:42px">☷</div><h2>${isEs ? 'Tu lista está vacía' : 'Your queue is empty'}</h2><p>${isEs ? 'Añade algunas lecciones para preparar tu próxima sesión.' : 'Add a few lessons to plan your next practice session.'}</p><button type="button" class="secondary-btn" data-view="skills">${isEs?'Explorar lecciones':'Explore lessons'}</button></section>`}</section></div>`;
    const planButton = document.createElement('button');
    planButton.type = 'button';
    planButton.className = 'secondary-btn';
    planButton.dataset.queueAction = 'save-plan';
    planButton.disabled = queue.length === 0 || readPlans().length >= 20;
    planButton.textContent = isEs ? '▣ Guardar como plan' : '▣ Save as plan';
    content.querySelector('.queue-toolbar')?.append(planButton);
    const planForm = document.createElement('section');
    planForm.className = 'card save-playlist-form hidden';
    planForm.id = 'save-playlist-form';
    planForm.innerHTML = `<label for="saved-plan-name">${isEs ? 'Nombre del plan' : 'Plan name'}<input id="saved-plan-name" maxlength="40" autocomplete="off" placeholder="${isEs ? 'Repaso de fracciones' : 'Fractions review'}"></label><div class="saved-plan-form-actions"><button type="button" class="secondary-btn" data-queue-action="cancel-save-plan">${isEs ? 'Cancelar' : 'Cancel'}</button><button type="button" class="primary-btn" data-queue-action="confirm-save-plan">${isEs ? 'Guardar plan' : 'Save plan'}</button></div>`;
    content.querySelector('.queue-add-card')?.after(planForm);
    const plans = readPlans();
    const plansSection = document.createElement('section');
    plansSection.className = 'saved-plans-section';
    plansSection.innerHTML = `<div class="queue-heading"><h2>${isEs ? 'Planes guardados' : 'Saved plans'}</h2><span>${plans.length} / 20</span></div>${plans.length ? `<div class="saved-plans-grid">${plans.map(plan => `<article class="card saved-plan-card"><div class="saved-plan-copy"><h3>${esc(plan.name)}</h3><small>${plan.items.length} ${isEs ? 'lecciones' : 'lessons'} · ${new Date(plan.savedAt).toLocaleDateString(isEs ? 'es' : 'en')}</small></div><div class="saved-plan-actions"><button type="button" class="primary-btn" data-queue-action="add-plan" data-plan-id="${esc(plan.id)}">${isEs ? 'Añadir a la lista' : 'Add to queue'} →</button><button type="button" class="text-link" data-queue-action="delete-plan" data-plan-id="${esc(plan.id)}">${isEs ? 'Eliminar' : 'Delete'}</button></div></article>`).join('')}</div>` : `<section class="card saved-plans-empty"><p>${isEs ? 'Guarda una lista para volver a usarla en otra sesión.' : 'Save a queue to reuse it in another study session.'}</p></section>`}`;
    content.querySelector('.queue-list-section')?.after(plansSection);
  }
  function chooseView() {
    render();
    document.querySelectorAll('.nav-item').forEach(node => node.classList.toggle('active', node.dataset.view === 'practice-queue'));
  }
  document.addEventListener('click', event => {
    const nav = event.target instanceof Element ? event.target.closest('[data-view="practice-queue"]') : null;
    if (nav) { event.preventDefault(); event.stopImmediatePropagation(); chooseView(); return; }
    const nextLesson = event.target instanceof Element ? event.target.closest('[data-queue-next-grade]') : null;
    if (nextLesson) {
      event.preventDefault(); event.stopImmediatePropagation();
      selectedGrade = nextLesson.dataset.queueNextGrade;
      localStorage.setItem('numoraGrade', selectedGrade);
      window.syncProfile?.();
      window.practiceView?.(nextLesson.dataset.queueNextLesson);
      return;
    }
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
    if (action === 'save-plan') {
      const form = contentRoot?.querySelector('#save-playlist-form');
      if (form) { form.classList.remove('hidden'); form.querySelector('#saved-plan-name')?.focus(); }
      return;
    }
    if (action === 'cancel-save-plan') { contentRoot?.querySelector('#save-playlist-form')?.classList.add('hidden'); return; }
    if (action === 'confirm-save-plan') {
      const name = contentRoot?.querySelector('#saved-plan-name')?.value.trim() || '';
      if (name.length < 2) { window.showToast?.(spanish() ? 'Escribe un nombre de al menos 2 caracteres.' : 'Enter a plan name with at least 2 characters.'); return; }
      if (!queue.length) { window.showToast?.(spanish() ? 'Añade lecciones antes de guardar el plan.' : 'Add lessons before saving a plan.'); return; }
      const plans = readPlans();
      if (plans.length >= 20) { window.showToast?.(spanish() ? 'Puedes guardar hasta 20 planes.' : 'You can save up to 20 plans.'); return; }
      plans.unshift({id:`plan-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name:name.slice(0,40),items:queue.map(item => ({grade:item.grade,lesson:item.lesson})),savedAt:new Date().toISOString()});
      savePlans(plans); render();
      window.showToast?.(spanish() ? 'Plan guardado.' : 'Plan saved.');
      return;
    }
    if (action === 'add-plan') {
      const plan = readPlans().find(item => item.id === button.dataset.planId);
      if (!plan) return;
      const additions = plan.items.filter(item => !queue.some(current => current.grade === item.grade && current.lesson === item.lesson)).slice(0, Math.max(0, 30 - queue.length));
      if (!additions.length) { window.showToast?.(spanish() ? 'No hay lecciones nuevas que añadir.' : 'There are no new lessons to add.'); return; }
      queue.push(...additions); save(queue); render();
      window.showToast?.(spanish() ? `Se añadieron ${additions.length} lecciones.` : `Added ${additions.length} lessons to your queue.`);
      return;
    }
    if (action === 'delete-plan') {
      savePlans(readPlans().filter(item => item.id !== button.dataset.planId)); render();
      window.showToast?.(spanish() ? 'Plan eliminado.' : 'Plan deleted.');
      return;
    }
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
    if (action === 'trouble') {
      const mistakes = (window.readMistakeNotebook?.() || []).slice().sort((a, b) => (Number(b.attempts) || 1) - (Number(a.attempts) || 1) || Date.parse(b.missedAt || 0) - Date.parse(a.missedAt || 0));
      const picks = [];
      for (const mistake of mistakes) {
        const grade = mistake.grade, lesson = mistake.lesson;
        if (!grade || !lesson || !(gradeSkillNames[grade] || []).includes(lesson) || queue.some(item => item.grade === grade && item.lesson === lesson) || picks.some(item => item.grade === grade && item.lesson === lesson)) continue;
        picks.push({grade, lesson});
        if (picks.length >= 30 - queue.length) break;
      }
      if (!picks.length) { window.showToast?.(spanish() ? 'No hay lecciones nuevas de tu cuaderno de errores.' : 'No new lessons from your mistake notebook are available.'); return; }
      queue.push(...picks); save(queue); render();
      window.showToast?.(spanish() ? `Se añadieron ${picks.length} lecciones para repasar.` : `Added ${picks.length} lessons to review.`);
      return;
    }
    if (action === 'fill') {
      const grade = document.querySelector('#queue-grade')?.value || localStorage.getItem('numoraGrade') || 'Pre-K';
      const names = gradeSkillNames[grade] || [];
      const unfinished = names.filter(lesson => !queue.some(item => item.grade === grade && item.lesson === lesson) && savedLessonQuestionCount(grade, lesson) < 10);
      const picks = unfinished.slice(0, Math.max(0, 30 - queue.length));
      if (!picks.length) { window.showToast?.(spanish() ? 'No hay lecciones pendientes para añadir.' : 'There are no unfinished lessons to add.'); return; }
      queue.push(...picks.map(lesson => ({grade, lesson})));
      save(queue); render();
      window.showToast?.(spanish() ? `Se añadieron ${picks.length} lecciones.` : `Added ${picks.length} unfinished lessons.`);
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
    if (action === 'export') {
      if (!queue.length) return;
      const date = new Date().toLocaleDateString(spanish() ? 'es' : 'en');
      const title = spanish() ? 'Plan de práctica de Numora' : 'Numora Practice Plan';
      const remaining = queue.reduce((sum, item) => sum + 10 - lessonCount(item), 0);
      const lines = [title, `${spanish() ? 'Fecha' : 'Date'}: ${date}`, `${spanish() ? 'Preguntas restantes' : 'Questions remaining'}: ${remaining}`, '', ...queue.map((item, position) => `${position + 1}. ${item.lesson} — ${item.grade} ${spanish() ? 'Matemáticas' : 'Math'} — ${lessonCount(item)}/10 ${spanish() ? 'completadas' : 'completed'}`)];
      const blob = new Blob(['\uFEFF', lines.join('\n')], {type:'text/plain;charset=utf-8'});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = spanish() ? 'plan-de-practica-numora.txt' : 'numora-practice-plan.txt';
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      window.showToast?.(spanish() ? 'Tu plan está listo para descargar.' : 'Your plan is ready to download.');
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
  document.addEventListener('dragstart', event => {
    const item = event.target instanceof Element ? event.target.closest('[data-queue-drag-index]') : null;
    if (!item || event.target.closest('button')) { event.preventDefault(); return; }
    draggedIndex = Number(item.dataset.queueDragIndex);
    item.classList.add('queue-item-dragging');
    if (event.dataTransfer) { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', String(draggedIndex)); }
  });
  document.addEventListener('dragover', event => {
    const target = event.target instanceof Element ? event.target.closest('[data-queue-drag-index]') : null;
    if (!target || draggedIndex === null) return;
    event.preventDefault();
    contentRoot?.querySelectorAll('.queue-drop-target').forEach(node => node.classList.remove('queue-drop-target'));
    target.classList.add('queue-drop-target');
  });
  document.addEventListener('drop', event => {
    const target = event.target instanceof Element ? event.target.closest('[data-queue-drag-index]') : null;
    if (!target || draggedIndex === null) return;
    event.preventDefault();
    const queue = read();
    const destination = Number(target.dataset.queueDragIndex);
    if (draggedIndex >= 0 && draggedIndex < queue.length && destination >= 0 && destination < queue.length && draggedIndex !== destination) {
      const [moved] = queue.splice(draggedIndex, 1);
      queue.splice(destination, 0, moved);
      save(queue); render();
    }
    draggedIndex = null;
    contentRoot?.querySelectorAll('.queue-drop-target,.queue-item-dragging').forEach(node => node.classList.remove('queue-drop-target','queue-item-dragging'));
  });
  document.addEventListener('dragend', () => {
    draggedIndex = null;
    contentRoot?.querySelectorAll('.queue-drop-target,.queue-item-dragging').forEach(node => node.classList.remove('queue-drop-target','queue-item-dragging'));
  });
  window.addEventListener('storage', updateCount);
  document.addEventListener('DOMContentLoaded', updateCount);
  updateCount();
})();
