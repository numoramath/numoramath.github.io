(() => {
  const content = document.querySelector('#app-content');
  if (!content) return;
  const isSpanish = () => localStorage.getItem('numoraLanguage') === 'es';
  function syncButton() {
    const practice = content.querySelector('.practice-shell');
    const meta = practice?.querySelector('.practice-meta');
    if (!practice || practice.querySelector('[data-challenge-time]') || !meta) {
      if (!practice) document.body.classList.remove('focus-lesson-mode');
      return;
    }
    let button = meta.querySelector('[data-focus-toggle]');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'secondary-btn focus-lesson-toggle';
      button.dataset.focusToggle = '';
      meta.append(button);
    }
    const active = document.body.classList.contains('focus-lesson-mode');
    const label = active ? (isSpanish() ? 'Salir del enfoque' : 'Exit focus') : (isSpanish() ? '⛶ Modo de enfoque' : '⛶ Focus mode');
    if (button.textContent !== label) button.textContent = label;
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', active ? (isSpanish() ? 'Salir del modo de enfoque' : 'Exit focus mode') : (isSpanish() ? 'Ocultar navegación para enfocarse en la lección' : 'Hide navigation to focus on the lesson'));
  }
  document.addEventListener('click', event => {
    const button = event.target instanceof Element ? event.target.closest('[data-focus-toggle]') : null;
    if (!button) return;
    event.preventDefault();
    document.body.classList.toggle('focus-lesson-mode');
    syncButton();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !document.body.classList.contains('focus-lesson-mode')) return;
    document.body.classList.remove('focus-lesson-mode');
    syncButton();
  });
  new MutationObserver(syncButton).observe(content, {childList:true, subtree:true});
  syncButton();
})();
