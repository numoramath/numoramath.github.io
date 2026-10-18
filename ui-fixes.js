(function () {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const grades = ['Pre-K', 'Kindergarten', ...Array.from({ length: 12 }, (_, index) => `Grade ${index + 1}`), 'College'];

  function accountJoinedToday() {
    const email = localStorage.getItem('numoraActiveEmail')?.trim().toLowerCase();
    if (!email) return false;
    try {
      const accounts = JSON.parse(localStorage.getItem('numoraAccounts') || '{}');
      const accountKey = Object.keys(accounts).find(key => key.toLowerCase() === email);
      const account = accountKey ? accounts[accountKey] : null;
      return String(account?.joinedAt || '').slice(0, 10) === todayKey;
    } catch {
      return false;
    }
  }

  function cleanDashboard() {
    document.querySelectorAll('.dots').forEach(node => node.remove());
    if (!accountJoinedToday()) return;

    document.querySelectorAll('.activity-row').forEach((row, index) => {
      const date = row.querySelector('small');
      const result = row.querySelector('.good');
      if (date && date.textContent !== 'Not started') date.textContent = 'Not started';
      const resultText = index === 0 ? 'Ready to begin' : '—';
      if (result && result.textContent !== resultText) result.textContent = resultText;
    });
  }

  const dashboardObserver = new MutationObserver(cleanDashboard);
  dashboardObserver.observe(document.body, { childList: true, subtree: true });
  cleanDashboard();

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const videoButton = target.closest('.lesson-video .video-play');
    if (videoButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const video = videoButton.closest('.lesson-video');
      const isPlaying = !video.classList.contains('playing');
      video.classList.toggle('playing', isPlaying);
      videoButton.textContent = isPlaying ? '❚❚' : '▶';
      videoButton.setAttribute('aria-label', isPlaying ? 'Pause lesson example' : 'Play lesson example');
      videoButton.setAttribute('aria-pressed', String(isPlaying));
      if (typeof showToast === 'function') showToast(isPlaying ? 'Example playing' : 'Example paused');
      return;
    }

    const gradeButton = target.closest('.secondary-btn');
    const isGradeButton = gradeButton && /^(?:Grade \d+|Pre-K|Kindergarten|College) ⌄$/.test(gradeButton.textContent.trim());
    const existingMenu = document.querySelector('.grade-menu');

    if (!isGradeButton) {
      if (existingMenu && !target.closest('.grade-menu')) existingMenu.remove();
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    if (existingMenu) {
      existingMenu.remove();
      return;
    }

    const menu = document.createElement('div');
    menu.className = 'grade-menu';
    menu.setAttribute('role', 'menu');
    grades.forEach(grade => {
      const option = document.createElement('button');
      option.type = 'button';
      option.setAttribute('role', 'menuitem');
      option.textContent = grade;
      option.addEventListener('click', () => {
        selectedGrade = grade;
        localStorage.setItem('numoraGrade', grade);
        syncProfile();
        menu.remove();
        skillsView();
        showToast('Now viewing ' + grade + ' Explorer');
      });
      menu.appendChild(option);
    });

    document.body.appendChild(menu);
    const rect = gradeButton.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = `${rect.bottom + 6}px`;
    menu.style.left = `${Math.max(8, rect.right - 145)}px`;
  }, true);
})();
