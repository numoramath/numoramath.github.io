(() => {
  let displayedMonth = new Date(new Date(`${todayKey}T00:00:00`).getFullYear(), new Date(`${todayKey}T00:00:00`).getMonth(), 1);
  let selectedDay = '';

  function renderCalendar() {
    const weekCard = document.querySelector('.week-progress-card');
    if (!weekCard || document.querySelector('.practice-month-calendar')) return;
    const spanish = localStorage.getItem('numoraLanguage') === 'es';
    const today = new Date(`${todayKey}T00:00:00`);
    const isCurrentMonth = displayedMonth.getFullYear() === today.getFullYear() && displayedMonth.getMonth() === today.getMonth();
    const practiceDays = new Set(badgeProgress.practiceDays || []);
    let questionHistory = {};
    try {
      const parsed = JSON.parse(localStorage.getItem('numoraDailyQuestionHistory') || '{}');
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) questionHistory = parsed;
    } catch {}
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    const monthLabel = displayedMonth.toLocaleDateString(spanish ? 'es' : 'en', { month: 'long', year: 'numeric' });
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const dates = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return { day, key, practiced: practiceDays.has(key), questions: Math.max(0, Number(questionHistory[key]) || 0) };
    });
    const practicedCount = dates.filter(date => date.practiced).length;
    const questionCount = dates.reduce((total, date) => total + date.questions, 0);
    const selected = dates.find(date => date.key === selectedDay);
    const weekdays = spanish ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const grid = `${weekdays.map(day => `<span class="practice-month-weekday" aria-hidden="true">${day}</span>`).join('')}${Array.from({ length: firstWeekday }, () => '<span class="practice-month-blank" aria-hidden="true"></span>').join('')}${dates.map(date => `<button type="button" class="practice-month-day ${date.practiced ? 'is-practiced' : ''} ${date.key === todayKey ? 'is-today' : ''} ${date.key === selectedDay ? 'is-selected' : ''}" data-practice-date="${date.key}" aria-pressed="${date.key === selectedDay}" aria-label="${date.key}: ${date.questions} ${spanish ? 'respuestas correctas' : 'correct answers'}${date.practiced ? (spanish ? ', día de práctica' : ', practice day') : ''}" title="${date.key} · ${date.questions} ${spanish ? 'respuestas correctas' : 'correct answers'}"><span>${date.day}</span><small>${date.questions || (date.practiced ? '✓' : '')}</small></button>`).join('')}`;
    const calendar = document.createElement('section');
    calendar.className = 'card practice-month-calendar';
    calendar.setAttribute('aria-label', spanish ? 'Calendario mensual de práctica' : 'Monthly practice calendar');
    calendar.innerHTML = `<div class="practice-month-heading"><div><span class="report-kicker">${spanish ? 'VISTA MENSUAL' : 'MONTH VIEW'}</span><h2>${monthLabel}</h2></div><div class="practice-month-nav"><button type="button" class="secondary-btn" data-month-shift="-1" aria-label="${spanish ? 'Mes anterior' : 'Previous month'}">←</button><button type="button" class="secondary-btn" data-month-shift="1" aria-label="${spanish ? 'Mes siguiente' : 'Next month'}" ${isCurrentMonth ? 'disabled' : ''}>→</button></div></div><div class="practice-month-summary"><strong>${practicedCount}</strong><span>${spanish ? `días de práctica · ${questionCount} respuestas correctas` : `practice days · ${questionCount} correct answers`}</span></div><div class="practice-month-grid">${grid}</div><p class="practice-month-detail" aria-live="polite">${selected ? (spanish ? `${selected.key}: ${selected.practiced ? 'practicaste' : 'sin práctica'} · ${selected.questions} respuestas correctas.` : `${selected.key}: ${selected.practiced ? 'you practiced' : 'no practice'} · ${selected.questions} correct answers.`) : (spanish ? 'Selecciona un día para ver sus detalles.' : 'Select a day to see its practice details.')}</p>`;
    weekCard.after(calendar);
  }

  function refreshCalendar() {
    document.querySelector('.practice-month-calendar')?.remove();
    renderCalendar();
  }

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const shift = event.target.closest('[data-month-shift]');
    if (shift) {
      event.preventDefault();
      displayedMonth.setMonth(displayedMonth.getMonth() + Number(shift.dataset.monthShift));
      selectedDay = '';
      refreshCalendar();
      return;
    }
    const date = event.target.closest('[data-practice-date]');
    if (date) {
      selectedDay = date.dataset.practiceDate;
      refreshCalendar();
    }
  });

  const observer = new MutationObserver(() => renderCalendar());
  observer.observe(content, { childList: true, subtree: true });
})();
