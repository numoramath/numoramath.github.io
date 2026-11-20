(() => {
  function renderWeeklyGoal() {
    const dailyCard = document.querySelector('.page-wrap .daily-goal-choices')?.closest('.empty-state');
    if (!dailyCard || document.querySelector('.weekly-goal-card')) return;
    const spanish = localStorage.getItem('numoraLanguage') === 'es';
    const stored = Number(localStorage.getItem('numoraWeeklyGoal') || 5);
    const target = Number.isInteger(stored) && stored >= 1 && stored <= 7 ? stored : 5;
    const practiced = new Set(badgeProgress.practiceDays || []);
    const today = new Date(`${todayKey}T00:00:00`);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const days = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + index);
      const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      return { key, practiced: practiced.has(key), label: day.toLocaleDateString(spanish ? 'es' : 'en', { weekday: 'short' }) };
    });
    const done = days.filter(day => day.practiced).length;
    const card = document.createElement('section');
    card.className = 'card empty-state weekly-goal-card';
    card.innerHTML = `<div class="weekly-goal-heading"><div><span class="report-kicker">${spanish ? 'META SEMANAL' : 'WEEKLY TARGET'}</span><h2>${spanish ? 'Practica esta semana' : 'Practice this week'}</h2></div><strong>${Math.min(done, target)}<small> / ${target} ${spanish ? 'días' : 'days'}</small></strong></div><p>${spanish ? 'Elige cuántos días quieres practicar cada semana.' : 'Choose how many days you want to practice each week.'}</p><div class="weekly-goal-days">${days.map(day => `<span class="weekly-goal-day ${day.practiced ? 'is-practiced' : ''}" title="${day.key}${day.practiced ? (spanish ? ' · practicado' : ' · practiced') : ''}"><i>${day.practiced ? '✓' : '·'}</i><small>${day.label}</small></span>`).join('')}</div><div class="daily-goal-choices" aria-label="${spanish ? 'Elige tu meta semanal' : 'Choose weekly target'}">${[3, 4, 5, 6, 7].map(value => `<button type="button" class="secondary-btn ${target === value ? 'selected-goal' : ''}" data-weekly-goal="${value}" aria-pressed="${target === value}">${value} ${spanish ? 'días' : 'days'}</button>`).join('')}</div><div class="progress-line"><span style="width:${Math.min(100, done / target * 100)}%"></span></div><p class="weekly-goal-status" aria-live="polite">${done >= target ? (spanish ? '¡Meta semanal alcanzada! ¡Buen trabajo!' : 'Weekly target reached — great work!') : (spanish ? `Te faltan ${target - done} ${target - done === 1 ? 'día' : 'días'} de práctica para tu meta.` : `${target - done} more ${target - done === 1 ? 'practice day' : 'practice days'} to reach your target.`)}</p>`;
    dailyCard.after(card);
  }

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('[data-weekly-goal]');
    if (!button) return;
    const value = Math.max(1, Math.min(7, Number(button.dataset.weeklyGoal) || 5));
    localStorage.setItem('numoraWeeklyGoal', String(value));
    saveCurrentAccountProgress();
    document.querySelector('.weekly-goal-card')?.remove();
    renderWeeklyGoal();
  });

  new MutationObserver(renderWeeklyGoal).observe(content, { childList: true, subtree: true });
})();
