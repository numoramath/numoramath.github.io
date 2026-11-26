(() => {
  const content = document.querySelector('#app-content');
  const pageTitle = document.querySelector('#page-title');
  if (!content || !pageTitle) return;

  const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const getXP = () => Number(localStorage.getItem('numoraXP') || 0) || 0;
  const getGrade = () => localStorage.getItem('numoraGrade') || 'Pre-K';

  /* ================= 1–6: TOPBAR & GLOBAL FEATURES ================= */
  let sessionSeconds = 0;
  const topActions = document.querySelector('.top-actions');
  if (topActions && !topActions.querySelector('.fp-topbar-tools')) {
    const tools = document.createElement('div');
    tools.className = 'fp-topbar-tools';
    tools.innerHTML = `
      <button type="button" class="fp-pill fp-xp-pill" data-action="spend-xp" title="Spend your XP">✦ <strong id="fp-top-xp">${getXP()}</strong> XP</button>
      <span class="fp-pill fp-session-pill" title="Session study time">⏱ <strong id="fp-session-min">0m</strong></span>
      <button type="button" class="fp-icon-pill" data-fp="quick-jump" title="Quick jump (Ctrl+K)" aria-label="Quick jump search">⌕</button>
      <button type="button" class="fp-icon-pill" data-fp="toggle-theme" title="Toggle light/dark theme" aria-label="Toggle theme">◐</button>
      <button type="button" class="fp-icon-pill" data-fp="fullscreen" title="Toggle fullscreen" aria-label="Toggle fullscreen">⛶</button>
      <button type="button" class="fp-icon-pill" data-fp="shortcuts" title="Keyboard shortcuts (?)" aria-label="Keyboard shortcuts">?</button>
    `;
    topActions.insertBefore(tools, topActions.firstChild);
  }

  setInterval(() => {
    sessionSeconds++;
    const el = document.querySelector('#fp-session-min');
    if (el) el.textContent = sessionSeconds < 60 ? `${sessionSeconds}s` : `${Math.floor(sessionSeconds / 60)}m`;
    const xpEl = document.querySelector('#fp-top-xp');
    if (xpEl) xpEl.textContent = String(getXP());
  }, 1000);

  // 50: Back-to-top floating button
  const topBtn = document.createElement('button');
  topBtn.type = 'button';
  topBtn.className = 'fp-back-to-top hidden';
  topBtn.textContent = '↑ Top';
  topBtn.setAttribute('aria-label', 'Scroll back to top');
  document.body.appendChild(topBtn);
  window.addEventListener('scroll', () => {
    topBtn.classList.toggle('hidden', window.scrollY < 320);
  }, { passive: true });
  topBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Quick-jump & shortcuts modal
  const fpModal = document.createElement('div');
  fpModal.className = 'fp-modal-backdrop hidden';
  document.body.appendChild(fpModal);

  function openQuickJump() {
    const grade = getGrade();
    const skills = (window.gradeSkillNames?.[grade] || []).map(s => ({ label: `${grade}: ${s}`, type: 'lesson', lesson: s }));
    const navItems = [...document.querySelectorAll('.sidebar .nav-item[data-view]')].map(b => ({ label: b.textContent.trim(), type: 'view', view: b.dataset.view }));
    const all = [...navItems, ...skills];
    fpModal.innerHTML = `<section class="card fp-modal" role="dialog" aria-modal="true" aria-label="Quick jump">
      <div class="fp-modal-head"><h3>⌕ Quick Jump</h3><button type="button" class="fp-close" data-fp="close-modal">×</button></div>
      <input type="search" id="fp-jump-input" class="fp-input" placeholder="Search any skill, lab, or page…" autofocus>
      <div class="fp-jump-list">${all.slice(0, 14).map(it => `<button type="button" class="fp-jump-item" data-fp-jump-type="${it.type}" data-fp-jump-val="${esc(it.view || it.lesson)}">${esc(it.label)}</button>`).join('')}</div>
    </section>`;
    fpModal.classList.remove('hidden');
    const inp = fpModal.querySelector('#fp-jump-input');
    inp?.focus();
    inp?.addEventListener('input', () => {
      const q = inp.value.trim().toLowerCase();
      const filtered = all.filter(it => it.label.toLowerCase().includes(q)).slice(0, 14);
      fpModal.querySelector('.fp-jump-list').innerHTML = filtered.map(it => `<button type="button" class="fp-jump-item" data-fp-jump-type="${it.type}" data-fp-jump-val="${esc(it.view || it.lesson)}">${esc(it.label)}</button>`).join('') || '<p class="fp-muted">No matches found.</p>';
    });
  }

  function openShortcutsModal() {
    fpModal.innerHTML = `<section class="card fp-modal" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
      <div class="fp-modal-head"><h3>⌨ Keyboard Shortcuts</h3><button type="button" class="fp-close" data-fp="close-modal">×</button></div>
      <ul class="fp-shortcut-list">
        <li><kbd>Ctrl</kbd> + <kbd>K</kbd> — Quick Jump search</li>
        <li><kbd>?</kbd> — Open this shortcuts guide</li>
        <li><kbd>Enter</kbd> / <kbd>Space</kbd> — Submit answer in lessons</li>
        <li><kbd>Escape</kbd> — Close popups or pause Timed Challenge</li>
      </ul>
    </section>`;
    fpModal.classList.remove('hidden');
  }

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openQuickJump(); return; }
    const tag = document.activeElement?.tagName;
    if (e.key === '?' && tag !== 'INPUT' && tag !== 'TEXTAREA') { e.preventDefault(); openShortcutsModal(); return; }
    if (e.key === 'Escape') {
      fpModal.classList.add('hidden');
      if (content.querySelector('[data-challenge-time]')) document.querySelector('[data-action="toggle-challenge-pause"]')?.click();
    }
  });

  /* ================= 7–14: HOME DASHBOARD ENHANCEMENTS ================= */
  const quotes = [
    '“Pure mathematics is, in its way, the poetry of logical ideas.” — Albert Einstein',
    '“Mathematics is the music of reason.” — James Joseph Sylvester',
    '“Every problem solved builds a stronger pathway in your brain.”',
    '“Mistakes are proof that you are trying something new.”'
  ];
  let warmupA = 6, warmupB = 7, warmupSolved = false;
  function newWarmup() { warmupA = 3 + Math.floor(Math.random() * 12); warmupB = 3 + Math.floor(Math.random() * 12); warmupSolved = false; }

  function enhanceHome() {
    if (!content.querySelector('.continue-card') || content.querySelector('.fp-home-extras')) return;
    const grade = getGrade();
    const names = window.gradeSkillNames?.[grade] || [];
    let bp = {};
    try { bp = JSON.parse(localStorage.getItem('numoraBadgeProgress') || '{}'); } catch {}
    const finishedInGrade = names.filter(n => (bp.finishedLessons || []).includes(`${grade}|${n}`)).length;
    const masteryPct = names.length ? Math.round((finishedInGrade / names.length) * 100) : 0;

    // 7 days of current week
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const pDays = new Set(bp.practiceDays || []);
    const weekDots = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return `<span class="fp-day-dot ${pDays.has(key) ? 'done' : ''}" title="${key}">${days[d.getDay()][0]}</span>`;
    }).join('');

    let xpHist = [];
    try { xpHist = JSON.parse(localStorage.getItem('numoraXpHistory') || '[]').slice(0, 3); } catch {}
    const quote = quotes[new Date().getDate() % quotes.length];
    const allGrades = Object.keys(window.gradeSkillNames || {});
    const gIdx = Math.max(0, allGrades.indexOf(grade));
    const nearbyGrades = allGrades.slice(Math.max(0, gIdx - 1), gIdx + 3);

    const wrap = document.createElement('div');
    wrap.className = 'fp-home-extras';
    wrap.innerHTML = `
      <div class="fp-quote-bar card"><span>💡</span><em>${esc(quote)}</em></div>
      <div class="fp-home-widgets">
        <section class="card fp-widget">
          <div class="fp-widget-head"><strong>⚡ Quick Mental Math</strong><button type="button" class="text-link" data-fp="new-warmup">New</button></div>
          <p class="fp-warmup-q">What is <strong id="fp-wa">${warmupA}</strong> × <strong id="fp-wb">${warmupB}</strong>?</p>
          <div class="fp-inline-row"><input type="number" id="fp-warmup-in" class="fp-input-sm" placeholder="?"><button type="button" class="primary-btn" data-fp="check-warmup">Check (+5 XP)</button></div>
          <small id="fp-warmup-msg" class="fp-muted"></small>
        </section>
        <section class="card fp-widget">
          <div class="fp-widget-head"><strong>📊 ${esc(grade)} Mastery</strong><span>${finishedInGrade}/${names.length} (${masteryPct}%)</span></div>
          <div class="fp-bar"><span style="width:${masteryPct}%"></span></div>
          <div class="fp-week-row"><small>Last 7 days:</small><div class="fp-week-dots">${weekDots}</div></div>
          <div class="fp-grade-pills">${nearbyGrades.map(g => `<button type="button" class="fp-chip ${g === grade ? 'active' : ''}" data-fp-grade="${esc(g)}">${esc(g)}</button>`).join('')}</div>
        </section>
        <section class="card fp-widget">
          <div class="fp-widget-head"><strong>✦ Recent XP &amp; Labs</strong><button type="button" class="text-link" data-fp="random-lab">🎲 Surprise lab</button></div>
          ${xpHist.length ? `<ul class="fp-xp-mini">${xpHist.map(h => `<li><span>${esc(h.reason)}</span><b>${h.delta > 0 ? '+' : ''}${h.delta}</b></li>`).join('')}</ul>` : '<p class="fp-muted">Solve a question to see recent XP here.</p>'}
        </section>
      </div>
    `;
    content.querySelector('.dashboard-grid')?.after(wrap);
  }

  /* ================= 15–24: PRACTICE QUESTION ENHANCEMENTS ================= */
  let qTimerInterval = null, qSeconds = 0, qPromptSeen = '';
  let sessionCorrect = 0, sessionAttempts = 0;

  function enhancePractice() {
    const shell = content.querySelector('.practice-shell');
    if (!shell || content.querySelector('[data-challenge-time]')) {
      clearInterval(qTimerInterval);
      return;
    }
    const qHeading = shell.querySelector('.question-card h1')?.textContent?.trim() || '';
    if (qHeading && qHeading !== qPromptSeen) {
      qPromptSeen = qHeading;
      qSeconds = 0;
    }
    const meta = shell.querySelector('.practice-meta');
    if (meta && !meta.querySelector('.fp-practice-pills')) {
      const pills = document.createElement('span');
      pills.className = 'fp-practice-pills';
      pills.innerHTML = `<span class="fp-mini-pill">⏱ <b id="fp-q-sec">${qSeconds}s</b></span> <span class="fp-mini-pill">✓ <b id="fp-q-acc">${sessionCorrect}/${sessionAttempts}</b></span>`;
      meta.appendChild(pills);
      clearInterval(qTimerInterval);
      qTimerInterval = setInterval(() => {
        if (!content.querySelector('.practice-shell')) { clearInterval(qTimerInterval); return; }
        qSeconds++;
        const sEl = document.querySelector('#fp-q-sec');
        if (sEl) sEl.textContent = `${qSeconds}s`;
      }, 1000);
    }

    const controls = shell.querySelector('.practice-controls');
    if (controls && !controls.querySelector('[data-fp="copy-q"]')) {
      controls.insertAdjacentHTML('beforeend', `
        <button type="button" class="secondary-btn" data-fp="copy-q" title="Copy question">📋 Copy</button>
        <button type="button" class="secondary-btn" data-fp="numpad-toggle" title="Toggle keypad">🔢 Keypad</button>
        <button type="button" class="secondary-btn" data-fp="skip-queue" title="Save to Practice queue & skip">☷ Queue &amp; skip</button>
        <button type="button" class="secondary-btn" data-fp="nudge-hint" title="Quick operation clue">💡 Nudge</button>
      `);
    }

    const qCard = shell.querySelector('.question-card');
    if (qCard && !qCard.querySelector('.fp-numpad')) {
      const pad = document.createElement('div');
      pad.className = 'fp-numpad hidden';
      pad.innerHTML = ['7','8','9','4','5','6','1','2','3','0','.','-','/','⌫'].map(k => `<button type="button" class="fp-pad-key" data-fp-pad="${k}">${k}</button>`).join('');
      controls?.before(pad);
    }
  }

  /* ================= 25–30: SKILL LIBRARY & SAVED SKILLS ================= */
  function enhanceSkills() {
    const grid = content.querySelector('.skill-library-grid');
    if (!grid) return;
    const isSavedPage = pageTitle.textContent === 'Saved skills';
    if (!isSavedPage && !content.querySelector('.fp-skill-bar')) {
      const cards = [...grid.querySelectorAll('.skill-card')];
      const fin = cards.filter(c => c.classList.contains('skill-finished')).length;
      const prog = cards.filter(c => !c.classList.contains('skill-finished') && Number(c.dataset.progress) > 0).length;
      const todo = cards.length - fin - prog;
      const bar = document.createElement('div');
      bar.className = 'fp-skill-bar card';
      bar.innerHTML = `<span>✓ <b>${fin}</b> Finished</span><span>◐ <b>${prog}</b> In progress</span><span>○ <b>${todo}</b> Not started</span>
        <div class="fp-skill-bar-actions">
          <button type="button" class="secondary-btn" data-fp="queue-5">＋ Queue 5 unfinished</button>
          <button type="button" class="secondary-btn" data-fp="export-grade">⬇ Export checklist</button>
        </div>`;
      content.querySelector('.skill-library-tools')?.before(bar);
    }
    if (isSavedPage && !content.querySelector('.fp-saved-tools')) {
      const bar = document.createElement('div');
      bar.className = 'fp-saved-tools';
      bar.innerHTML = `<input type="search" id="fp-saved-search" class="fp-input" placeholder="Search saved skills…">
        <button type="button" class="secondary-btn" data-fp="clear-finished-saved">🧹 Remove finished</button>`;
      grid.before(bar);
    }
  }

  /* ================= 31–36: PROGRESS & BADGES ================= */
  function enhanceProgressAndBadges() {
    if (pageTitle.textContent === 'Progress' && !content.querySelector('.fp-progress-extras')) {
      const completed = Number(localStorage.getItem('numoraCompleted') || 0);
      const mins = Math.round(completed * 1.5);
      const card = document.createElement('section');
      card.className = 'card fp-progress-extras';
      card.innerHTML = `<div><strong>⏱ Estimated study time: ${mins} minutes</strong><small>Based on ${completed} solved questions (~1.5 min each)</small></div>
        <button type="button" class="secondary-btn" data-fp="print-report">🖨 Print / Save PDF</button>`;
      content.querySelector('.page-wrap')?.appendChild(card);
    }
    if (pageTitle.textContent === 'Badges' && !content.querySelector('.fp-badge-filters')) {
      const wrap = content.querySelector('.page-wrap');
      const grid = wrap?.querySelector('.badge-grid, .badges-grid, [class*="badge"]');
      const bar = document.createElement('div');
      bar.className = 'fp-badge-filters';
      bar.innerHTML = `<button type="button" class="secondary-btn active" data-fp-badge-filter="all">All badges</button>
        <button type="button" class="secondary-btn" data-fp-badge-filter="earned">Earned</button>
        <button type="button" class="secondary-btn" data-fp-badge-filter="locked">Locked</button>`;
      wrap?.querySelector('.hero-row')?.after(bar);
    }
  }

  /* ================= 37–46: CHALLENGE, QUIZ, MISTAKES, NOTES ================= */
  function enhanceOtherViews() {
    if (pageTitle.textContent === 'Mistake notebook' && !content.querySelector('.fp-mistake-tools')) {
      const bar = document.createElement('div');
      bar.className = 'fp-mistake-tools';
      bar.innerHTML = `<button type="button" class="secondary-btn" data-fp="export-mistakes">⬇ Download mistake study sheet</button>`;
      content.querySelector('.hero-row')?.appendChild(bar);
    }
    if (pageTitle.textContent === 'My notes' && !content.querySelector('.fp-notes-quick')) {
      const box = document.createElement('section');
      box.className = 'card fp-notes-quick';
      box.innerHTML = `<h3>Quick study note</h3><div class="fp-inline-row"><input type="text" id="fp-quick-note-in" class="fp-input" placeholder="Write a quick math reminder or formula…"><button type="button" class="primary-btn" data-fp="save-quick-note">Save note</button></div>`;
      content.querySelector('.hero-row')?.after(box);
    }
    if (pageTitle.textContent === 'Custom quiz' && !content.querySelector('.fp-quiz-sprint')) {
      const card = content.querySelector('.card');
      if (card) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'secondary-btn fp-quiz-sprint';
        btn.dataset.fp = 'quick-sprint';
        btn.textContent = '⚡ 5-Question Quick Sprint';
        card.appendChild(btn);
      }
    }
  }

  /* ================= 47–49: XP SHOP & GOALS ================= */
  function enhanceModals() {
    const shop = document.querySelector('.xp-shop:not(.avatar-customizer)');
    if (shop && !shop.querySelector('#fp-shop-search')) {
      const filters = shop.querySelector('.xp-shop-filters');
      if (filters) {
        filters.insertAdjacentHTML('beforebegin', `<div class="fp-shop-tools"><input type="search" id="fp-shop-search" class="fp-input" placeholder="Search XP rewards…"><button type="button" class="secondary-btn" data-fp="afford-only">Can afford now</button></div>`);
      }
    }
  }

  function runEnhancers() {
    enhanceHome();
    enhancePractice();
    enhanceSkills();
    enhanceProgressAndBadges();
    enhanceOtherViews();
  }

  new MutationObserver(runEnhancers).observe(content, { childList: true, subtree: true });
  new MutationObserver(enhanceModals).observe(document.body, { childList: true, subtree: true });

  /* ================= GLOBAL EVENT HANDLERS ================= */
  document.addEventListener('click', async e => {
    const t = e.target instanceof Element ? e.target : null;
    if (!t) return;

    const fpBtn = t.closest('[data-fp]');
    if (fpBtn) {
      const act = fpBtn.dataset.fp;
      if (act === 'quick-jump') openQuickJump();
      else if (act === 'shortcuts') openShortcutsModal();
      else if (act === 'close-modal') fpModal.classList.add('hidden');
      else if (act === 'toggle-theme') {
        const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
        window.applyTheme?.(next);
        window.saveCurrentAccountProgress?.();
      } else if (act === 'fullscreen') {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
        else document.exitFullscreen?.().catch(() => {});
      } else if (act === 'new-warmup') {
        newWarmup();
        document.querySelector('#fp-wa').textContent = String(warmupA);
        document.querySelector('#fp-wb').textContent = String(warmupB);
        document.querySelector('#fp-warmup-in').value = '';
        document.querySelector('#fp-warmup-msg').textContent = '';
      } else if (act === 'check-warmup') {
        const val = Number(document.querySelector('#fp-warmup-in')?.value);
        const msg = document.querySelector('#fp-warmup-msg');
        if (!warmupSolved && val === warmupA * warmupB) {
          warmupSolved = true;
          if (typeof window.setXpBalance === 'function') window.setXpBalance(getXP() + 5, 'Home mental math');
          if (msg) msg.textContent = 'Correct! +5 XP';
          window.showToast?.('Nice! +5 XP');
        } else if (!warmupSolved && msg) {
          msg.textContent = 'Try again!';
        }
      } else if (act === 'random-lab') {
        const labs = ['calculator-lab','graphing-lab','percent-lab','factor-lab','probability-lab','quadratic-lab','pythagoras-lab','matrix-lab','stats-lab','volume3d-lab'];
        const pick = labs[Math.floor(Math.random() * labs.length)];
        document.querySelector(`.nav-item[data-view="${pick}"]`)?.click();
      } else if (act === 'copy-q') {
        const q = content.querySelector('.question-card h1')?.textContent || '';
        try { await navigator.clipboard.writeText(q); window.showToast?.('Question copied.'); } catch {}
      } else if (act === 'numpad-toggle') {
        content.querySelector('.fp-numpad')?.classList.toggle('hidden');
      } else if (act === 'skip-queue') {
        const lesson = window.currentActiveLesson || '';
        if (lesson) window.numoraAddToPracticeQueue?.(getGrade(), lesson);
        window.renderLessonQuestion?.();
        window.showToast?.('Added to Practice queue & skipped.');
      } else if (act === 'nudge-hint') {
        const q = content.querySelector('.question-card h1')?.textContent || '';
        let nudge = 'Read the numbers carefully and check what operation is needed.';
        if (q.includes('+')) nudge = 'Combine the values using addition (+).';
        else if (q.includes('−') || q.includes('-')) nudge = 'Find the difference using subtraction (−).';
        else if (q.includes('×') || q.includes('*')) nudge = 'Think of equal groups using multiplication (×).';
        else if (q.includes('÷') || q.includes('/')) nudge = 'Split into equal parts or check fractions.';
        else if (q.includes('%')) nudge = 'Convert the percent by dividing by 100.';
        window.showToast?.(`💡 ${nudge}`);
      } else if (act === 'queue-5') {
        const grade = getGrade();
        const names = window.gradeSkillNames?.[grade] || [];
        let added = 0;
        for (const n of names) {
          if (added >= 5) break;
          if (window.numoraAddToPracticeQueue?.(grade, n) === 'added') added++;
        }
        window.showToast?.(added ? `Added ${added} lessons to Practice queue.` : 'No new lessons to queue.');
      } else if (act === 'export-grade') {
        const grade = getGrade();
        const names = window.gradeSkillNames?.[grade] || [];
        const blob = new Blob([`${grade} Math Checklist\n\n` + names.map((n, i) => `${i + 1}. [ ] ${n}`).join('\n')], { type: 'text/plain' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${grade.toLowerCase().replace(/\s+/g, '-')}-checklist.txt`; a.click();
        URL.revokeObjectURL(a.href);
      } else if (act === 'clear-finished-saved') {
        document.querySelectorAll('.skill-finished [data-toggle-saved-skill]').forEach(b => b.click());
      } else if (act === 'print-report') {
        window.print();
      } else if (act === 'export-mistakes') {
        const mistakes = window.readMistakeNotebook?.() || [];
        const text = mistakes.map((m, i) => `${i + 1}. [${m.grade} - ${m.lesson}] ${m.prompt}\n   Answer: ${m.correctAnswer}`).join('\n\n') || 'No mistakes recorded.';
        const blob = new Blob([`Numora Mistake Study Sheet\n\n${text}`], { type: 'text/plain' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'numora-mistakes.txt'; a.click();
        URL.revokeObjectURL(a.href);
      } else if (act === 'save-quick-note') {
        const inp = document.querySelector('#fp-quick-note-in');
        const txt = inp?.value.trim();
        if (!txt) return;
        let notes = {};
        try { notes = JSON.parse(localStorage.getItem('numoraLessonNotes') || '{}'); } catch {}
        notes[`${getGrade()}|General Study Note`] = txt;
        localStorage.setItem('numoraLessonNotes', JSON.stringify(notes));
        window.saveCurrentAccountProgress?.();
        window.showToast?.('Study note saved!');
        document.querySelector('.nav-item[data-view="notes"]')?.click();
      } else if (act === 'quick-sprint') {
        const countSel = document.querySelector('#custom-count');
        if (countSel) countSel.value = '5';
        document.querySelector('[data-action="start-custom-quiz"]')?.click();
      } else if (act === 'afford-only') {
        fpBtn.classList.toggle('active');
        const only = fpBtn.classList.contains('active');
        const xp = getXP();
        document.querySelectorAll('[data-xp-reward-card]').forEach(c => {
          const cost = Number(c.querySelector('small')?.textContent?.match(/\d+/)?.[0] || 0);
          c.classList.toggle('hidden', only && cost > xp);
        });
      }
      return;
    }

    const gradeChip = t.closest('[data-fp-grade]');
    if (gradeChip) {
      localStorage.setItem('numoraGrade', gradeChip.dataset.fpGrade);
      window.selectedGrade = gradeChip.dataset.fpGrade;
      window.syncProfile?.();
      window.homeView?.();
      return;
    }

    const padBtn = t.closest('[data-fp-pad]');
    if (padBtn) {
      const inp = content.querySelector('.practice-shell .answer-input');
      if (!inp) return;
      const k = padBtn.dataset.fpPad;
      inp.value = k === '⌫' ? inp.value.slice(0, -1) : inp.value + k;
      inp.focus();
      return;
    }

    const jumpBtn = t.closest('[data-fp-jump-type]');
    if (jumpBtn) {
      fpModal.classList.add('hidden');
      if (jumpBtn.dataset.fpJumpType === 'view') {
        document.querySelector(`.nav-item[data-view="${jumpBtn.dataset.fpJumpVal}"]`)?.click();
      } else {
        window.practiceView?.(jumpBtn.dataset.fpJumpVal);
      }
      return;
    }

    const badgeFilter = t.closest('[data-fp-badge-filter]');
    if (badgeFilter) {
      document.querySelectorAll('[data-fp-badge-filter]').forEach(b => b.classList.toggle('active', b === badgeFilter));
      const mode = badgeFilter.dataset.fpBadgeFilter;
      content.querySelectorAll('.badge-card').forEach(c => {
        const earned = !c.classList.contains('locked');
        c.classList.toggle('hidden', (mode === 'earned' && !earned) || (mode === 'locked' && earned));
      });
      return;
    }

    if (t.closest('.practice-shell .check-btn') && !content.querySelector('[data-challenge-time]')) {
      setTimeout(() => {
        const fb = content.querySelector('.practice-shell .feedback');
        if (!fb) return;
        if (fb.classList.contains('success')) { sessionCorrect++; sessionAttempts++; }
        else if (fb.classList.contains('error')) { sessionAttempts++; }
        const accEl = document.querySelector('#fp-q-acc');
        if (accEl) accEl.textContent = `${sessionCorrect}/${sessionAttempts}`;
      }, 0);
    }
  });

  document.addEventListener('input', e => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement)) return;
    if (t.id === 'fp-saved-search') {
      const q = t.value.trim().toLowerCase();
      content.querySelectorAll('.saved-skill-card').forEach(c => {
        c.classList.toggle('hidden', Boolean(q) && !c.textContent.toLowerCase().includes(q));
      });
    } else if (t.id === 'fp-shop-search') {
      const q = t.value.trim().toLowerCase();
      document.querySelectorAll('[data-xp-reward-card]').forEach(c => {
        c.classList.toggle('hidden', Boolean(q) && !c.textContent.toLowerCase().includes(q));
      });
    }
  });

  runEnhancers();
})();
