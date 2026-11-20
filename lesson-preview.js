(() => {
  let returnFocus = null;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const isSpanish = () => localStorage.getItem('numoraLanguage') === 'es';
  function closePreview() {
    document.querySelector('.lesson-preview-backdrop')?.remove();
    returnFocus?.focus?.();
    returnFocus = null;
  }
  function openPreview(trigger) {
    closePreview();
    returnFocus = trigger;
    const grade = trigger.dataset.previewGrade || 'Pre-K';
    const lesson = trigger.dataset.previewLesson || '';
    const done = Math.min(10, Math.max(0, Number(savedLessonQuestionCount(grade, lesson)) || 0));
    const objective = lessonTopicDescription(lesson);
    const es = isSpanish();
    const modal = document.createElement('div');
    modal.className = 'lesson-preview-backdrop';
    modal.innerHTML = `<section class="card lesson-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="lesson-preview-title" aria-describedby="lesson-preview-objective"><button type="button" class="lesson-preview-close" data-preview-close aria-label="${es?'Cerrar':'Close'}">×</button><span class="eyebrow">${es?'VISTA PREVIA DE LA LECCIÓN':'LESSON PREVIEW'}</span><h2 id="lesson-preview-title">${escape(lesson)}</h2><p class="lesson-preview-grade">${escape(grade)} ${es?'Matemáticas':'Math'}</p><p id="lesson-preview-objective">${escape(objective)}</p><div class="lesson-preview-progress"><div><strong>${done} / 10</strong><span>${es?'preguntas completadas':'questions completed'}</span></div><div class="lesson-preview-bar" role="progressbar" aria-label="${es?'Progreso de la lección':'Lesson progress'}" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${done}"><span style="width:${done*10}%"></span></div></div><div class="lesson-preview-actions"><button type="button" class="secondary-btn" data-preview-close>${es?'Volver':'Back'}</button><button type="button" class="primary-btn" data-preview-start data-grade="${escape(grade)}" data-lesson="${escape(lesson)}">${es?'Empezar lección':'Start lesson'} →</button></div></section>`;
    document.body.append(modal);
    modal.querySelector('[data-preview-close]')?.focus();
  }
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    const trigger = target?.closest('[data-lesson-preview]');
    const start = target?.closest('[data-preview-start]');
    const close = target?.closest('[data-preview-close]');
    if (trigger) { event.preventDefault(); event.stopImmediatePropagation(); openPreview(trigger); return; }
    if (start) {
      event.preventDefault(); event.stopImmediatePropagation();
      const grade = start.dataset.grade, lesson = start.dataset.lesson;
      closePreview();
      selectedGrade = grade;
      localStorage.setItem('numoraGrade', grade);
      syncProfile();
      practiceView(lesson);
      return;
    }
    if (close || target?.classList.contains('lesson-preview-backdrop')) { event.preventDefault(); event.stopImmediatePropagation(); closePreview(); }
  }, true);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.querySelector('.lesson-preview-backdrop')) closePreview();
  });
})();
