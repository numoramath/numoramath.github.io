/* Clerk sign-in bridge for the static Numora app. */
(function () {
  const publishableKey = String(window.NUMORA_CLERK_PUBLISHABLE_KEY || '').trim();
  if (!publishableKey) return; // Leave the existing sign-in flow available until configured.

  const modal = document.querySelector('#auth-modal');
  const modalBody = modal?.querySelector('.auth-modal');
  const appContent = document.querySelector('#app-content');
  if (!modal || !modalBody || !appContent) return;

  let clerk;
  let mounted = false;
  let appliedClerkUserId = null;
  const previousMarkup = modalBody.innerHTML;
  modalBody.innerHTML = `
    <button class="modal-close" aria-label="Close">×</button>
    <div class="brand modal-brand"><span class="brand-mark">✦</span><span>numora</span></div>
    <span class="eyebrow">YOUR LEARNING JOURNEY</span>
    <h2>Sign in or create an account</h2>
    <p>Use Google or your email to save your Numora progress.</p>
    <div id="clerk-sign-in"></div>
    <p class="clerk-setup-error" hidden></p>`;

  function showAuth() {
    if (!clerk?.isSignedIn && !mounted) {
      const mount = document.querySelector('#clerk-sign-in');
      if (mount) {
        clerk.mountSignIn(mount);
        mounted = true;
      }
    }
    modal.classList.remove('hidden');
  }

  function clearCurrentSession() {
    localStorage.removeItem('numoraActiveEmail');
    localStorage.removeItem('numoraUser');
    localStorage.removeItem('numoraEmail');
    localStorage.removeItem('numoraPassword');
    if (typeof numoraProgressKeys === 'function') numoraProgressKeys().forEach(key => localStorage.removeItem(key));
    userName = 'Guest';
    selectedGrade = 'Pre-K';
    freshStart = true;
    completed = 0;
    streak = 0;
    accuracyAttempts = 0;
    accuracyCorrect = 0;
    todayCompleted = 0;
    monthCompleted = 0;
    badgeProgress = { earned: [], practiceDays: [], practicedLessons: [], finishedLessons: [] };
    document.querySelector('.logout-btn')?.classList.add('hidden');
    document.querySelector('.login-btn')?.classList.remove('hidden');
    document.querySelector('.signup-btn')?.classList.remove('hidden');
    appContent.innerHTML = '<div class="page-wrap"><section class="card empty-state"><h2>Sign in to Numora</h2><p>Log in or create an account to continue learning.</p><button class="primary-btn" data-clerk-open>Sign in</button></section></div>';
    document.querySelector('#page-title').textContent = 'Welcome';
    if (typeof syncProfile === 'function') syncProfile();
  }

  function applyClerkUser(user) {
    if (!user) {
      appliedClerkUserId = null;
      clearCurrentSession();
      showAuth();
      return;
    }

    if (user.id && user.id === appliedClerkUserId) return;

    const email = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
    if (!email) {
      clearCurrentSession();
      showAuth();
      return;
    }

    const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
      || user.username || email.split('@')[0] || 'Learner';
    appliedClerkUserId = user.id || email;
    const existing = findNumoraAccount(email);
    // Save active browser progress only when it belongs to this same email.
    if (localStorage.getItem('numoraActiveEmail')?.trim().toLowerCase() === email) saveCurrentAccountProgress();
    if (existing) {
      existing.username = displayName;
      saveNumoraAccount(email, existing);
      restoreAccountProgress(email, existing);
    } else {
      localStorage.setItem('numoraActiveEmail', email);
      startFreshAccount();
      saveNumoraAccount(email, { username: displayName, joinedAt: new Date().toISOString().slice(0, 10), progress: {} });
      saveCurrentAccountProgress();
    }
    userName = displayName;
    localStorage.setItem('numoraUser', displayName);
    localStorage.setItem('numoraEmail', email);
    localStorage.setItem('numoraActiveEmail', email);
    modal.classList.add('hidden');
    document.querySelector('.logout-btn')?.classList.remove('hidden');
    document.querySelector('.login-btn')?.classList.add('hidden');
    document.querySelector('.signup-btn')?.classList.add('hidden');
    if (typeof syncProfile === 'function') syncProfile();
    if (typeof homeView === 'function') homeView();
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Clerk could not load. Check your internet connection and Publishable Key.'));
      document.head.appendChild(script);
    });
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    if (target.closest('[data-clerk-open], .login-btn, .signup-btn') && clerk) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (clerk) showAuth();
    }
    if (target.closest('.logout-btn') && clerk) {
      event.preventDefault();
      event.stopImmediatePropagation();
      saveCurrentAccountProgress();
      clerk.signOut().catch(error => console.error('Clerk sign-out failed:', error));
    }
  }, true);

  (async function initializeClerk() {
    try {
      const encodedDomain = publishableKey.split('_')[2];
      if (!publishableKey.startsWith('pk_') || !encodedDomain) throw new Error('Add a valid Clerk Publishable Key (pk_...) to clerk-config.js.');
      const frontendDomain = atob(encodedDomain).replace(/\$$/, '');
      if (!frontendDomain) throw new Error('The Clerk Publishable Key is invalid.');
      await loadScript(`https://${frontendDomain}/npm/@clerk/ui@1/dist/ui.browser.js`);
      await loadScript(`https://${frontendDomain}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`);
      if (typeof window.Clerk !== 'function') throw new Error('Clerk loaded without its browser SDK.');
      clerk = new window.Clerk(publishableKey);
      await clerk.load({ ui: { ClerkUI: window.__internal_ClerkUICtor } });
      clerk.addListener(({ user }) => applyClerkUser(user));
      applyClerkUser(clerk.user);
    } catch (error) {
      modalBody.innerHTML = previousMarkup;
      console.error('Numora Clerk setup:', error);
    }
  })();

  modalBody.addEventListener('click', event => {
    if (event.target.closest('.modal-close') && clerk?.isSignedIn) modal.classList.add('hidden');
  });
  window.numoraClerk = { showAuth: () => clerk && showAuth() };
  window.addEventListener('beforeunload', () => {
    if (clerk && !clerk.isSignedIn) modalBody.innerHTML = previousMarkup;
  });
})();
