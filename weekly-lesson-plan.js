(() => {
  function weekDays() {
    const today = new Date(`${todayKey}T00:00:00`);
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, offset) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + offset);
      return { date, key: localDateKey(date) };
    });
  }

  function getPlan() {
    try {
      const plan = JSON.parse(localStorage.getItem('numoraWeeklyLessonPlan') || 'null');
      return plan && plan.assignments && typeof plan.assignments === 'object' ? plan : null;
    } catch { return null; }
  }

  function savePlan(plan) {
    localStorage.setItem('numoraWeeklyLessonPlan', JSON.stringify(plan));
    saveCurrentAccountProgress();
  }

  function createPlan() {
    const days = weekDays();
    const names = gradeSkillNames[selectedGrade] || gradeSkillNames['Grade 6'] || [];
    const unfinished = names.filter(lesson => savedLessonQuestionCount(selectedGrade, lesson) < 10);
    const assignments = {};
    days.filter(day => day.key >= todayKey).slice(0, 5).forEach((day, index) => { assignments[day.key] = unfinished[index] || ''; });
    const plan = { weekOf: days[0].key, grade: selectedGrade, assignments };
    savePlan(plan);
    return plan;
  }

  function renderPlanner() {
    const existing = content.querySelector('.weekly-lesson-planner');
    if (existing) return;
    const host = content.querySelector('.study-plan-note');
    if (!host || !content.querySelector('.study-plan-list')) return;
    const days = weekDays();
    let plan = getPlan();
    if (!plan || plan.weekOf !== days[0].key || plan.grade !== selectedGrade) plan = createPlan();
    const es = localStorage.getItem('numoraLanguage') === 'es';
    const names = gradeSkillNames[selectedGrade] || gradeSkillNames['Grade 6'] || [];
    const entries = days.map(({ date, key }) => {
      const lesson = names.includes(plan.assignments[key]) ? plan.assignments[key] : '';
      const count = lesson ? savedLessonQuestionCount(selectedGrade, lesson) : 0;
      return { date, key, lesson, count, finished: count >= 10 };
    });
    const scheduled = entries.filter(day => day.lesson);
    const finishedCount = scheduled.filter(day => day.finished).length;
    const complete = names.length > 0 && names.every(lesson => savedLessonQuestionCount(selectedGrade, lesson) >= 10);
    const percent = complete ? 100 : scheduled.length ? Math.round(finishedCount / scheduled.length * 100) : 0;
    const section = document.createElement('section');
    section.className = 'weekly-lesson-planner';
    section.innerHTML = `<div class="weekly-lesson-planner-heading"><div><span class="report-kicker">${es ? 'PLAN DE LECCIONES' : 'LESSON SCHEDULE'}</span><h2>${es ? 'Organiza tu semana' : 'Plan lessons for your week'}</h2><p>${es ? `Lecciones de ${escapeHtmlText(selectedGrade)} · ${entries[0].date.toLocaleDateString('es', { month: 'short', day: 'numeric' })}–${entries[6].date.toLocaleDateString('es', { month: 'short', day: 'numeric' })}` : `${escapeHtmlText(selectedGrade)} lessons · ${entries[0].date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}–${entries[6].date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}`}</p></div><button type="button" class="secondary-btn" data-weekly-lesson-action="new">${es ? 'Plan nuevo' : 'Build a new plan'}</button></div><div class="weekly-lesson-summary"><div><strong>${complete ? (es ? '¡Terminaste todas las lecciones!' : 'Every lesson is complete!') : `${finishedCount} / ${scheduled.length} ${es ? 'lecciones terminadas' : 'lessons finished'}`}</strong><small>${complete ? (es ? 'Elige una lección para repasarla.' : 'Choose any lesson to review it.') : (es ? 'Tu plan se guarda en esta cuenta.' : 'This plan is saved to this account.')}</small></div><div class="weekly-lesson-meter" role="progressbar" aria-label="${es ? 'Progreso semanal de lecciones' : 'Weekly lesson progress'}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><span style="width:${percent}%"></span></div></div><div class="weekly-lesson-days">${entries.map(day => {
      const dayName = day.date.toLocaleDateString(es ? 'es' : 'en', { weekday: 'long' });
      const dateName = day.date.toLocaleDateString(es ? 'es' : 'en', { month: 'short', day: 'numeric' });
      const status = !day.lesson ? (es ? 'Día libre' : 'Rest day') : day.finished ? (es ? 'Terminada' : 'Finished') : day.count ? `${day.count}/10 · ${es ? 'En curso' : 'In progress'}` : (es ? 'Planificada' : 'Planned');
      return `<article class="weekly-lesson-day ${day.finished ? 'is-finished' : ''}"><div class="weekly-lesson-day-head"><div><h3>${escapeHtmlText(dayName)}</h3><small>${escapeHtmlText(dateName)}</small></div><span>${status}</span></div><label>${es ? 'Lección' : 'Lesson'}<select data-weekly-lesson-date="${day.key}"><option value="">${es ? 'Día libre' : 'Rest day'}</option>${names.map(name => `<option value="${escapeHtmlText(name)}" ${name === day.lesson ? 'selected' : ''}>${escapeHtmlText(name)}</option>`).join('')}</select></label>${day.lesson ? `<p>${escapeHtmlText(lessonTopicDescription(day.lesson))}</p><button type="button" class="${day.finished ? 'secondary-btn' : 'primary-btn'}" data-weekly-lesson-start="${day.key}">${day.finished ? (es ? 'Repasar lección →' : 'Review lesson →') : (es ? 'Empezar lección →' : 'Start lesson →')}</button>` : `<p>${es ? 'No hay una lección asignada.' : 'No lesson is scheduled.'}</p>`}</article>`;
    }).join('')}</div>`;
    host.insertAdjacentElement('afterend', section);
  }

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const action = event.target.closest('[data-weekly-lesson-action]');
    const start = event.target.closest('[data-weekly-lesson-start]');
    if (!action && !start) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (action) {
      createPlan();
      content.querySelector('.weekly-lesson-planner')?.remove();
      renderPlanner();
      showToast(localStorage.getItem('numoraLanguage') === 'es' ? 'Tu plan de lecciones está listo.' : 'Your lesson plan is ready.');
      return;
    }
    const lesson = getPlan()?.assignments?.[start.dataset.weeklyLessonStart];
    if (lesson) practiceView(lesson);
  }, true);

  document.addEventListener('change', event => {
    const select = event.target instanceof Element ? event.target.closest('[data-weekly-lesson-date]') : null;
    if (!select) return;
    const plan = getPlan();
    if (!plan || plan.grade !== selectedGrade || plan.weekOf !== weekDays()[0].key) return;
    const names = gradeSkillNames[selectedGrade] || gradeSkillNames['Grade 6'] || [];
    plan.assignments[select.dataset.weeklyLessonDate] = names.includes(select.value) ? select.value : '';
    savePlan(plan);
    content.querySelector('.weekly-lesson-planner')?.remove();
    renderPlanner();
    showToast(localStorage.getItem('numoraLanguage') === 'es' ? 'Horario guardado.' : 'Lesson schedule saved.');
  });

  new MutationObserver(renderPlanner).observe(content, { childList: true, subtree: true });
})();
