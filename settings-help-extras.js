(() => {
  const accentOptions = [
    { id: 'violet', label: 'Violet', labelEs: 'Violeta', color: '#6356eb' },
    { id: 'teal', label: 'Teal', labelEs: 'Verde azulado', color: '#0e9f7e' },
    { id: 'ocean', label: 'Ocean', labelEs: 'Océano', color: '#2563eb' },
    { id: 'coral', label: 'Coral', labelEs: 'Coral', color: '#e05b48' },
    { id: 'amber', label: 'Amber', labelEs: 'Ámbar', color: '#d97706' }
  ];

  const isEs = () => localStorage.getItem('numoraLanguage') === 'es';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  function applyAccent(id) {
    const found = accentOptions.find(opt => opt.id === id) || accentOptions[0];
    document.documentElement.style.setProperty('--violet', found.color);
    document.documentElement.style.setProperty('--accent', found.color);
    document.body.dataset.accentColor = found.id;
  }

  function applyFontStyle(style) {
    document.body.dataset.fontStyle = style === 'friendly' ? 'friendly' : 'standard';
  }

  function applyCompactSidebar(enabled) {
    document.body.dataset.compactSidebar = enabled ? 'true' : 'false';
  }

  function applyStreakTip(show) {
    const tip = document.querySelector('.tip-card');
    if (tip) tip.classList.toggle('hidden', !show);
  }

  function applyFocusMode(enabled) {
    document.body.dataset.focusMode = enabled ? 'true' : 'false';
  }

  applyAccent(localStorage.getItem('numoraAccentColor') || 'violet');
  applyFontStyle(localStorage.getItem('numoraFontStyle') || 'standard');
  applyCompactSidebar(localStorage.getItem('numoraCompactSidebar') === 'true');
  applyStreakTip(localStorage.getItem('numoraShowStreakTip') !== 'false');
  applyFocusMode(localStorage.getItem('numoraFocusMode') === 'true');

  function enhanceSettings(panel) {
    if (!panel || panel.dataset.settingsEnhanced === 'true') return;
    panel.dataset.settingsEnhanced = 'true';
    const es = isEs();
    const currentAccent = localStorage.getItem('numoraAccentColor') || 'violet';
    const currentFont = localStorage.getItem('numoraFontStyle') || 'standard';
    const currentGrade = localStorage.getItem('numoraGrade') || 'Pre-K';
    const showTimer = localStorage.getItem('numoraShowTimer') === 'true';
    const compactSidebar = localStorage.getItem('numoraCompactSidebar') === 'true';
    const showStreakTip = localStorage.getItem('numoraShowStreakTip') !== 'false';
    const focusMode = localStorage.getItem('numoraFocusMode') === 'true';
    const defaultLessonLen = Number(localStorage.getItem('numoraDefaultLessonLength') || 10);
    const weeklyGoal = Number(localStorage.getItem('numoraWeeklyGoal') || 25);
    const speechRate = localStorage.getItem('numoraSpeechRate') || '1';
    const displayName = localStorage.getItem('numoraUser') || 'Guest';
    const grades = Object.keys(window.gradeSkillNames || { 'Pre-K': [] });

    let savedSkillsCount = 0, mistakesCount = 0, queueCount = 0;
    try { savedSkillsCount = JSON.parse(localStorage.getItem('numoraSavedSkills') || '[]').length || 0; } catch {}
    try { mistakesCount = JSON.parse(localStorage.getItem('numoraMistakes') || '[]').length || 0; } catch {}
    try { queueCount = JSON.parse(localStorage.getItem('numoraPracticeQueue') || '[]').length || 0; } catch {}

    const searchHtml = `<div class="settings-search-wrap">
      <input type="search" class="help-search settings-filter-input" placeholder="${es ? 'Filtrar ajustes (ej. voz, tema, respaldo)…' : 'Filter settings (e.g. voice, theme, backup)…'}" aria-label="${es ? 'Filtrar ajustes' : 'Filter settings'}">
    </div>`;
    panel.querySelector('p')?.insertAdjacentHTML('afterend', searchHtml);

    const profileHtml = `<div class="answer-setting">
      <strong>${es ? 'Perfil y barra lateral' : 'Profile & layout'}</strong>
      <label class="setting-row">${es ? 'Nombre visible' : 'Display name'}
        <span class="setting-inline-group">
          <input type="text" maxlength="20" value="${esc(displayName)}" data-display-name-input class="setting-text-input">
          <button type="button" class="secondary-btn" data-save-display-name>${es ? 'Guardar' : 'Save'}</button>
        </span>
      </label>
      <label class="setting-check">
        <input type="checkbox" data-compact-sidebar ${compactSidebar ? 'checked' : ''}>
        <span>${es ? 'Barra lateral compacta' : 'Compact sidebar spacing'}</span>
      </label>
      <label class="setting-check">
        <input type="checkbox" data-show-streak-tip ${showStreakTip ? 'checked' : ''}>
        <span>${es ? 'Mostrar tarjeta de recordatorio de racha' : 'Show streak reminder card in sidebar'}</span>
      </label>
      <label class="setting-check">
        <input type="checkbox" data-focus-mode ${focusMode ? 'checked' : ''}>
        <span>${es ? 'Modo enfoque (ocultar enlaces externos de la barra)' : 'Focus mode (hide external game links in sidebar)'}</span>
      </label>
    </div>`;

    const voiceHtml = `<div class="answer-setting">
      <strong>${es ? 'Velocidad de voz' : 'Voice & speech rate'}</strong>
      <label class="setting-row">${es ? 'Velocidad al leer preguntas' : 'Read-aloud speed'}
        <span class="setting-inline-group">
          <select data-speech-rate>
            <option value="0.8" ${speechRate === '0.8' ? 'selected' : ''}>${es ? 'Lenta (0.8×)' : 'Slow (0.8×)'}</option>
            <option value="1" ${speechRate === '1' ? 'selected' : ''}>${es ? 'Normal (1.0×)' : 'Normal (1.0×)'}</option>
            <option value="1.2" ${speechRate === '1.2' ? 'selected' : ''}>${es ? 'Rápida (1.2×)' : 'Fast (1.2×)'}</option>
          </select>
          <button type="button" class="secondary-btn" data-test-voice>${es ? '🔊 Probar' : '🔊 Test'}</button>
        </span>
      </label>
    </div>`;

    const accentHtml = `<div class="answer-setting">
      <strong>${es ? 'Color de acento' : 'Accent color'}</strong>
      <div class="accent-swatches" role="group" aria-label="${es ? 'Color de acento' : 'Accent color'}">
        ${accentOptions.map(opt => `<button type="button" class="accent-swatch ${currentAccent === opt.id ? 'active' : ''}" data-accent-choice="${opt.id}" title="${es ? opt.labelEs : opt.label}"><i style="background:${opt.color}"></i><span>${es ? opt.labelEs : opt.label}</span></button>`).join('')}
      </div>
    </div>`;

    const extraPrefsHtml = `<div class="answer-setting">
      <strong>${es ? 'Lectura y práctica' : 'Reading & practice extras'}</strong>
      <label class="setting-row">${es ? 'Estilo de letra' : 'Reading font style'}
        <select data-font-style>
          <option value="standard" ${currentFont === 'standard' ? 'selected' : ''}>${es ? 'Estándar' : 'Standard'}</option>
          <option value="friendly" ${currentFont === 'friendly' ? 'selected' : ''}>${es ? 'Lectura fácil (espaciada)' : 'Easy-read (spaced)'}</option>
        </select>
      </label>
      <label class="setting-row">${es ? 'Grado activo' : 'Active grade level'}
        <select data-default-grade>
          ${grades.map(g => `<option value="${esc(g)}" ${g === currentGrade ? 'selected' : ''}>${esc(g)}</option>`).join('')}
        </select>
      </label>
      <label class="setting-check">
        <input type="checkbox" data-show-timer ${showTimer ? 'checked' : ''}>
        <span>${es ? 'Mostrar cronómetro durante las lecciones' : 'Show elapsed timer during lessons'}</span>
      </label>
      <label class="setting-row">${es ? 'Preguntas por lección' : 'Default lesson length'}
        <select data-default-lesson-len>
          ${[5, 10, 15, 20].map(v => `<option value="${v}" ${defaultLessonLen === v ? 'selected' : ''}>${v} ${es ? 'preguntas' : 'questions'}</option>`).join('')}
        </select>
      </label>
      <label class="setting-row">${es ? 'Meta semanal de preguntas' : 'Weekly question goal'}
        <select data-weekly-goal-setting>
          ${[15, 25, 40, 60, 100].map(v => `<option value="${v}" ${weeklyGoal === v ? 'selected' : ''}>${v} ${es ? 'preguntas' : 'questions'}</option>`).join('')}
        </select>
      </label>
      <div class="setting-row">
        <span>${es ? 'Probar sonido de acierto' : 'Preview correct-answer chime'}</span>
        <button type="button" class="secondary-btn" data-test-chime>${es ? '♪ Probar' : '♪ Play chime'}</button>
      </div>
    </div>`;

    const dataSummaryHtml = `<div class="answer-setting">
      <strong>${es ? 'Resumen de datos guardados' : 'Saved account data'}</strong>
      <div class="settings-data-grid">
        <div><strong>${savedSkillsCount}</strong><small>${es ? 'Guardadas' : 'Saved skills'}</small></div>
        <div><strong>${queueCount}</strong><small>${es ? 'En lista' : 'In queue'}</small></div>
        <div><strong>${mistakesCount}</strong><small>${es ? 'Errores' : 'Mistakes'}</small></div>
      </div>
    </div>`;

    const backupAndResetHtml = `<div class="answer-setting settings-backup-tools">
      <strong>${es ? 'Restaurar o restablecer' : 'Restore & reset'}</strong>
      <p>${es ? 'Importa un archivo de respaldo JSON o restablece solo tus preferencias visuales.' : 'Import a JSON backup file or reset your visual/audio preferences without losing progress.'}</p>
      <div class="settings-tool-buttons">
        <label class="secondary-btn import-backup-btn">
          ${es ? '⬆ Importar respaldo' : '⬆ Import backup'}
          <input type="file" accept="application/json,.json" data-import-progress hidden>
        </label>
        <button type="button" class="secondary-btn" data-reset-settings>${es ? '↺ Restablecer ajustes' : '↺ Reset preferences'}</button>
      </div>
    </div>`;

    panel.insertAdjacentHTML('beforeend', profileHtml + voiceHtml + accentHtml + extraPrefsHtml + dataSummaryHtml + backupAndResetHtml);
  }

  function enhanceHelp(panel) {
    if (!panel || panel.dataset.helpEnhanced === 'true') return;
    panel.dataset.helpEnhanced = 'true';
    const es = isEs();

    const filterRow = panel.querySelector('.help-category-filters');
    if (filterRow) {
      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'help-expand-all';
      toggleBtn.dataset.helpToggleAll = 'expand';
      toggleBtn.textContent = es ? 'Expandir todo' : 'Expand all';
      filterRow.appendChild(toggleBtn);
      const tags = ['XP', 'Calculator', 'Grapher', 'Backup', 'Voice', 'Streak'];
      filterRow.insertAdjacentHTML('afterend', `<div class="help-quick-tags" aria-label="${es ? 'Temas populares' : 'Popular topics'}"><span>${es ? 'Populares:' : 'Popular:'}</span>${tags.map(t => `<button type="button" data-help-tag="${esc(t)}">${esc(t)}</button>`).join('')}</div>`);
    }

    const shortcutsBox = `<div class="help-extra-card">
      <strong>${es ? '⌨ Atajos rápidos' : '⌨ Keyboard & practice shortcuts'}</strong>
      <ul>
        <li><b>Enter / Space</b> — ${es ? 'Comprobar respuesta cuando el cuadro está listo' : 'Check answer when the answer box is ready'}</li>
        <li><b>Tab</b> — ${es ? 'Moverse entre botones, pistas y borrador' : 'Move between answer controls, hints, and scratchpad'}</li>
        <li><b>✎ ${es ? 'Borrador' : 'Scratchpad'}</b> — ${es ? 'Dibuja pasos con ratón o lápiz dentro de la lección' : 'Sketch steps with mouse, touch, or stylus inside any lesson'}</li>
      </ul>
    </div>`;

    const user = localStorage.getItem('numoraUser') || 'Guest';
    const grade = localStorage.getItem('numoraGrade') || 'Pre-K';
    const xp = localStorage.getItem('numoraXP') || '0';
    const lang = localStorage.getItem('numoraLanguage') === 'es' ? 'Español' : 'English';
    const theme = document.body.dataset.theme === 'dark' ? (es ? 'Oscuro' : 'Dark') : (es ? 'Claro' : 'Light');

    const diagnosticsBox = `<div class="help-extra-card help-diagnostics">
      <div>
        <strong>${es ? 'Estado de la cuenta' : 'Session summary'}</strong>
        <small>${esc(user)} · ${esc(grade)} · ${esc(xp)} XP · ${esc(lang)} · ${esc(theme)}</small>
      </div>
      <button type="button" class="secondary-btn" data-help-copy-info>${es ? 'Copiar datos' : 'Copy info'}</button>
    </div>`;

    const shortcuts = panel.querySelector('.help-shortcuts');
    if (shortcuts) {
      const tourBox = `<div class="help-extra-card help-tour-card">
        <div class="help-tour-head">
          <strong>${es ? '✦ Recorrido rápido de 4 pasos' : '✦ 4-step quick tour'}</strong>
          <button type="button" class="secondary-btn" data-help-tour-next>${es ? 'Siguiente paso →' : 'Next step →'}</button>
        </div>
        <p class="help-tour-body" data-help-tour-step="0">${es ? '1/4 · Elige tu grado en la Biblioteca de habilidades y abre cualquier lección de 10 preguntas.' : '1/4 · Pick your grade in Skill library and open any 10-question lesson.'}</p>
      </div>`;

      const troubleshootBox = `<div class="help-extra-card">
        <strong>${es ? '🛠 Solución rápida de problemas' : '🛠 Quick troubleshooting fixes'}</strong>
        <div class="help-fix-grid">
          <button type="button" class="secondary-btn" data-help-fix="large-text">${es ? 'Activar texto grande' : 'Turn on Large text'}</button>
          <button type="button" class="secondary-btn" data-help-fix="both-controls">${es ? 'Activar Ratón + Espacio' : 'Enable Mouse + Space'}</button>
          <button type="button" class="secondary-btn" data-help-fix="auto-read">${es ? 'Activar lectura en voz alta' : 'Enable Read aloud'}</button>
        </div>
      </div>`;

      const whatsNewBox = `<div class="help-extra-card">
        <strong>${es ? '✨ Novedades en Numora' : '✨ What’s new in Numora'}</strong>
        <ul>
          <li>${es ? '5 nuevos laboratorios: Calculadora científica, Plano cartesiano, Porcentajes, Factores/MCD/MCM y Probabilidad.' : '5 new interactive labs: Scientific calculator, Coordinate grapher, Percent visualizer, Factors/GCF/LCM, and Probability lab.'}</li>
          <li>${es ? 'Nuevos ajustes: Colores de acento, letra de lectura fácil, velocidad de voz, modo enfoque e importar respaldo.' : 'New Settings: Accent colors, easy-read font, voice speed, focus mode, and JSON backup import.'}</li>
        </ul>
      </div>`;

      shortcuts.insertAdjacentHTML('beforebegin', shortcutsBox + tourBox + troubleshootBox + whatsNewBox + diagnosticsBox);
      shortcuts.insertAdjacentHTML('beforeend', `<button class="secondary-btn" data-help-nav="practice-queue">${es ? 'Lista de práctica' : 'Practice queue'}</button><button class="secondary-btn" data-help-nav="calculator-lab">${es ? 'Calculadora' : 'Calculator'}</button><button class="secondary-btn" data-help-nav="daily-puzzle">${es ? 'Reto diario' : 'Daily puzzle'}</button>`);
    }
  }

  const originalOpenUtility = window.openUtilityPanel;
  if (typeof originalOpenUtility === 'function') {
    window.openUtilityPanel = function (type) {
      originalOpenUtility.call(this, type);
      const modal = document.querySelector('#utility-modal');
      if (!modal) return;
      if (type === 'settings') enhanceSettings(modal.querySelector('.settings-panel'));
      if (type === 'help') enhanceHelp(modal.querySelector('.help-panel'));
      window.applyNumoraLanguage?.();
    };
  }

  document.addEventListener('click', async event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const accentBtn = target.closest('[data-accent-choice]');
    if (accentBtn) {
      const id = accentBtn.dataset.accentChoice;
      localStorage.setItem('numoraAccentColor', id);
      applyAccent(id);
      window.saveCurrentAccountProgress?.();
      document.querySelectorAll('[data-accent-choice]').forEach(btn => btn.classList.toggle('active', btn === accentBtn));
      window.showToast?.(isEs() ? 'Color de acento actualizado.' : 'Accent color updated.');
      return;
    }

    if (target.closest('[data-reset-settings]')) {
      ['numoraTheme', 'numoraAccentColor', 'numoraFontStyle', 'numoraReadingSize', 'numoraReduceMotion', 'numoraHighContrast', 'numoraSoundEffects', 'numoraAutoRead', 'numoraAutoFocusAnswer', 'numoraAutoExplain', 'numoraShowTimer', 'numoraAnswerControl', 'numoraClickToTypeAnswer', 'numoraLessonCelebrations', 'numoraSpeechRate', 'numoraCompactSidebar', 'numoraShowStreakTip', 'numoraFocusMode', 'numoraDefaultLessonLength'].forEach(k => localStorage.removeItem(k));
      window.applyTheme?.('light');
      applyAccent('violet');
      applyFontStyle('standard');
      applyCompactSidebar(false);
      applyStreakTip(true);
      applyFocusMode(false);
      document.body.dataset.readingSize = 'normal';
      document.body.dataset.reduceMotion = 'false';
      document.body.dataset.highContrast = 'false';
      window.saveCurrentAccountProgress?.();
      window.openUtilityPanel?.('settings');
      window.showToast?.(isEs() ? 'Preferencias restablecidas.' : 'Preferences reset to defaults.');
      return;
    }

    const toggleAll = target.closest('[data-help-toggle-all]');
    if (toggleAll) {
      const expand = toggleAll.dataset.helpToggleAll === 'expand';
      document.querySelectorAll('.help-faq-item:not(.hidden)').forEach(item => { item.open = expand; });
      toggleAll.dataset.helpToggleAll = expand ? 'collapse' : 'expand';
      toggleAll.textContent = expand ? (isEs() ? 'Contraer todo' : 'Collapse all') : (isEs() ? 'Expandir todo' : 'Expand all');
      return;
    }

    const helpNav = target.closest('[data-help-nav]');
    if (helpNav) {
      document.querySelector('#utility-modal')?.classList.add('hidden');
      const navBtn = document.querySelector(`.nav-item[data-view="${helpNav.dataset.helpNav}"]`);
      navBtn?.click();
      return;
    }

    if (target.closest('[data-help-copy-info]')) {
      const info = `Numora | User: ${localStorage.getItem('numoraUser') || 'Guest'} | Grade: ${localStorage.getItem('numoraGrade') || 'Pre-K'} | XP: ${localStorage.getItem('numoraXP') || '0'} | Lang: ${localStorage.getItem('numoraLanguage') || 'en'} | Theme: ${document.body.dataset.theme || 'light'}`;
      try {
        await navigator.clipboard.writeText(info);
        window.showToast?.(isEs() ? 'Información copiada.' : 'Session info copied.');
      } catch {
        window.showToast?.(isEs() ? 'No se pudo copiar.' : 'Could not copy right now.');
      }
      return;
    }

    if (target.closest('[data-save-display-name]')) {
      const input = document.querySelector('[data-display-name-input]');
      const next = input?.value.trim().slice(0, 20);
      if (!next || next.length < 2) {
        window.showToast?.(isEs() ? 'Escribe un nombre de al menos 2 letras.' : 'Enter a name with at least 2 characters.');
        return;
      }
      window.userName = next;
      localStorage.setItem('numoraUser', next);
      window.syncProfile?.();
      window.saveCurrentAccountProgress?.();
      window.showToast?.(isEs() ? 'Nombre actualizado.' : 'Display name updated.');
      return;
    }

    if (target.closest('[data-test-voice]')) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(isEs() ? 'Hola, esta es una prueba de lectura de Numora.' : 'Hello! This is a Numora voice speed test.');
        utter.lang = isEs() ? 'es-ES' : 'en-US';
        utter.rate = Number(localStorage.getItem('numoraSpeechRate') || 1);
        window.speechSynthesis.speak(utter);
      } else {
        window.showToast?.(isEs() ? 'Tu navegador no soporta voz.' : 'Speech synthesis is not supported in this browser.');
      }
      return;
    }

    const tourBtn = target.closest('[data-help-tour-next]');
    if (tourBtn) {
      const body = document.querySelector('[data-help-tour-step]');
      if (!body) return;
      const steps = isEs() ? [
        '1/4 · Elige tu grado en la Biblioteca de habilidades y abre cualquier lección de 10 preguntas.',
        '2/4 · Usa Pistas, Mostrar explicación y el Borrador para resolver paso a paso.',
        '3/4 · Gana XP y mantén tu racha diaria; canjea XP en Usa tus XP.',
        '4/4 · Explora los laboratorios: Calculadora, Plano cartesiano, Porcentajes, Factores y Probabilidad.'
      ] : [
        '1/4 · Pick your grade in Skill library and open any 10-question lesson.',
        '2/4 · Use Hints, Show explanation, and the Math scratchpad to work step by step.',
        '3/4 · Earn XP and build your daily streak; spend XP in the reward shop.',
        '4/4 · Explore the interactive labs: Calculator, Grapher, Percent, Factors, and Probability.'
      ];
      const next = (Number(body.dataset.helpTourStep || 0) + 1) % steps.length;
      body.dataset.helpTourStep = String(next);
      body.textContent = steps[next];
      return;
    }

    const helpTag = target.closest('[data-help-tag]');
    if (helpTag) {
      const search = document.querySelector('#help-search');
      if (search) {
        search.value = helpTag.dataset.helpTag;
        search.dispatchEvent(new Event('input', { bubbles: true }));
      }
      return;
    }

    if (target.closest('[data-test-chime]')) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.09);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.29);
      } catch {
        window.showToast?.(isEs() ? 'Audio no disponible.' : 'Audio preview unavailable.');
      }
      return;
    }

    const fixBtn = target.closest('[data-help-fix]');
    if (fixBtn) {
      const fix = fixBtn.dataset.helpFix;
      if (fix === 'large-text') {
        localStorage.setItem('numoraReadingSize', 'large');
        document.body.dataset.readingSize = 'large';
        window.showToast?.(isEs() ? 'Texto grande activado.' : 'Large text turned on.');
      } else if (fix === 'both-controls') {
        localStorage.setItem('numoraAnswerControl', 'both');
        localStorage.setItem('numoraClickToTypeAnswer', 'true');
        window.showToast?.(isEs() ? 'Controles Ratón + Espacio activados.' : 'Mouse + Space controls enabled.');
      } else if (fix === 'auto-read') {
        localStorage.setItem('numoraAutoRead', 'true');
        window.showToast?.(isEs() ? 'Lectura automática activada.' : 'Automatic read-aloud enabled.');
      }
      window.saveCurrentAccountProgress?.();
    }
  });

  document.addEventListener('change', async event => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.matches('[data-font-style]')) {
      localStorage.setItem('numoraFontStyle', target.value);
      applyFontStyle(target.value);
      window.saveCurrentAccountProgress?.();
      window.showToast?.(isEs() ? 'Estilo de letra actualizado.' : 'Reading font style updated.');
    } else if (target.matches('[data-compact-sidebar]')) {
      localStorage.setItem('numoraCompactSidebar', String(target.checked));
      applyCompactSidebar(target.checked);
      window.saveCurrentAccountProgress?.();
    } else if (target.matches('[data-show-streak-tip]')) {
      localStorage.setItem('numoraShowStreakTip', String(target.checked));
      applyStreakTip(target.checked);
      window.saveCurrentAccountProgress?.();
    } else if (target.matches('[data-focus-mode]')) {
      localStorage.setItem('numoraFocusMode', String(target.checked));
      applyFocusMode(target.checked);
      window.saveCurrentAccountProgress?.();
      window.showToast?.(target.checked ? (isEs() ? 'Modo enfoque activado.' : 'Focus mode enabled.') : (isEs() ? 'Modo enfoque desactivado.' : 'Focus mode turned off.'));
    } else if (target.matches('[data-default-lesson-len]')) {
      localStorage.setItem('numoraDefaultLessonLength', target.value);
      window.saveCurrentAccountProgress?.();
      window.showToast?.(isEs() ? `Longitud predeterminada: ${target.value} preguntas.` : `Default lesson length set to ${target.value} questions.`);
    } else if (target.matches('[data-weekly-goal-setting]')) {
      localStorage.setItem('numoraWeeklyGoal', target.value);
      window.saveCurrentAccountProgress?.();
      window.showToast?.(isEs() ? `Meta semanal: ${target.value} preguntas.` : `Weekly goal set to ${target.value} questions.`);
    } else if (target.matches('[data-speech-rate]')) {
      localStorage.setItem('numoraSpeechRate', target.value);
      window.saveCurrentAccountProgress?.();
      window.showToast?.(isEs() ? `Velocidad de voz: ${target.value}×` : `Voice speed set to ${target.value}×`);
    } else if (target.matches('[data-default-grade]')) {
      const grade = target.value;
      window.selectedGrade = grade;
      localStorage.setItem('numoraGrade', grade);
      window.syncProfile?.();
      window.saveCurrentAccountProgress?.();
      window.showToast?.(isEs() ? `Grado cambiado a ${grade}.` : `Active grade set to ${grade}.`);
    } else if (target.matches('[data-show-timer]')) {
      localStorage.setItem('numoraShowTimer', String(target.checked));
      window.saveCurrentAccountProgress?.();
      window.showToast?.(target.checked ? (isEs() ? 'Cronómetro activado.' : 'Lesson timer enabled.') : (isEs() ? 'Cronómetro desactivado.' : 'Lesson timer hidden.'));
    } else if (target.matches('[data-import-progress]') && target instanceof HTMLInputElement && target.files?.[0]) {
      try {
        const text = await target.files[0].text();
        const data = JSON.parse(text);
        if (!data || data.app !== 'Numora' || !data.progress || typeof data.progress !== 'object') {
          throw new Error('Invalid backup file');
        }
        let restored = 0;
        Object.entries(data.progress).forEach(([k, v]) => {
          if (typeof v === 'string' && typeof window.isNumoraProgressKey === 'function' && window.isNumoraProgressKey(k)) {
            localStorage.setItem(k, v);
            restored++;
          }
        });
        window.saveCurrentAccountProgress?.();
        window.syncProfile?.();
        window.showToast?.(isEs() ? `Se restauraron ${restored} ajustes y datos.` : `Restored ${restored} saved items. Reloading…`);
        setTimeout(() => location.reload(), 900);
      } catch {
        window.showToast?.(isEs() ? 'Archivo de respaldo no válido.' : 'Invalid Numora backup file.');
      }
    }
  });
  document.addEventListener('input', event => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.matches('.settings-filter-input')) return;
    const q = target.value.trim().toLowerCase();
    document.querySelectorAll('.settings-panel .answer-setting').forEach(section => {
      section.classList.toggle('hidden', Boolean(q) && !section.textContent.toLowerCase().includes(q));
    });
  });
})();
