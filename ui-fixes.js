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
    // Activity is rendered from the learner's saved lesson state. Do not
    // replace it based on the account creation date.
  }

  const dashboardObserver = new MutationObserver(cleanDashboard);
  dashboardObserver.observe(document.body, { childList: true, subtree: true });
  cleanDashboard();

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const logoutButton = target.closest('.logout-btn');
    if (logoutButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      saveCurrentAccountProgress();
      localStorage.removeItem('numoraActiveEmail');
      localStorage.removeItem('numoraUser');
      localStorage.removeItem('numoraEmail');
      localStorage.removeItem('numoraPassword');
      numoraProgressKeys().forEach(key => localStorage.removeItem(key));
      userName = 'Guest';
      selectedGrade = 'Pre-K';
      freshStart = true;
      completed = 0;
      streak = 0;
      accuracyAttempts = 0;
      accuracyCorrect = 0;
      todayCompleted = 0;
      monthCompleted = 0;
      lessonQuestionCount = 0;
      activeLesson = '';
      activeLessonIndex = 0;
      badgeProgress = { earned: [], practiceDays: [], practicedLessons: [], finishedLessons: [] };
      window.currentActiveLesson = '';
      window.currentLessonQuestionCount = 0;
      document.querySelector('#app-content').innerHTML = '<div class="page-wrap"><section class="card empty-state"><h2>You’re logged out</h2><p>Log in or create an account to continue learning.</p></section></div>';
      document.querySelector('#page-title').textContent = 'Welcome';
      document.querySelector('.logout-btn')?.classList.add('hidden');
      document.querySelector('.login-btn')?.classList.remove('hidden');
      document.querySelector('.signup-btn')?.classList.remove('hidden');
      document.querySelector('#email-input').value = '';
      document.querySelector('#password-input').value = '';
      document.querySelector('#name-input').value = '';
      document.querySelector('#auth-modal').classList.add('hidden');
      syncProfile();
      openAuth('login');
      showToast('You have been logged out');
      return;
    }

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
