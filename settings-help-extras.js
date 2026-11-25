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

  applyAccent(localStorage.getItem('numoraAccentColor') || 'violet');
  applyFontStyle(localStorage.getItem('numoraFontStyle') || 'standard');

  function enhanceSettings(panel) {
    if (!panel || panel.dataset.settingsEnhanced === 'true') return;
    panel.dataset.settingsEnhanced = 'true';
    const es = isEs();
    const currentAccent = localStorage.getItem('numoraAccentColor') || 'violet';
    const currentFont = localStorage.getItem('numoraFontStyle') || 'standard';
    const currentGrade = localStorage.getItem('numoraGrade') || 'Pre-K';
    const showTimer = localStorage.getItem('numoraShowTimer') === 'true';
    const grades = Object.keys(window.gradeSkillNames || { 'Pre-K': [] });

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

    panel.insertAdjacentHTML('beforeend', accentHtml + extraPrefsHtml + backupAndResetHtml);
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
      shortcuts.insertAdjacentHTML('beforebegin', shortcutsBox + diagnosticsBox);
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
      ['numoraTheme', 'numoraAccentColor', 'numoraFontStyle', 'numoraReadingSize', 'numoraReduceMotion', 'numoraHighContrast', 'numoraSoundEffects', 'numoraAutoRead', 'numoraAutoFocusAnswer', 'numoraAutoExplain', 'numoraShowTimer', 'numoraAnswerControl', 'numoraClickToTypeAnswer', 'numoraLessonCelebrations'].forEach(k => localStorage.removeItem(k));
      window.applyTheme?.('light');
      applyAccent('violet');
      applyFontStyle('standard');
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
})();
