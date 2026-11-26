(() => {
  const accentOptions = [
    { id: 'violet', label: 'Violet', labelEs: 'Violeta', color: '#6356eb' },
    { id: 'indigo', label: 'Indigo', labelEs: 'Índigo', color: '#4f46e5' },
    { id: 'teal', label: 'Teal', labelEs: 'Verde azulado', color: '#0e9f7e' },
    { id: 'emerald', label: 'Emerald', labelEs: 'Esmeralda', color: '#10b981' },
    { id: 'mint', label: 'Mint', labelEs: 'Menta', color: '#14b8a6' },
    { id: 'ocean', label: 'Ocean', labelEs: 'Océano', color: '#2563eb' },
    { id: 'sky', label: 'Sky', labelEs: 'Cielo', color: '#0284c7' },
    { id: 'coral', label: 'Coral', labelEs: 'Coral', color: '#e05b48' },
    { id: 'crimson', label: 'Crimson', labelEs: 'Carmesí', color: '#dc2626' },
    { id: 'rose', label: 'Rose', labelEs: 'Rosa', color: '#e11d48' },
    { id: 'magenta', label: 'Magenta', labelEs: 'Magenta', color: '#c026d3' },
    { id: 'plum', label: 'Plum', labelEs: 'Ciruela', color: '#7c3aed' },
    { id: 'amber', label: 'Amber', labelEs: 'Ámbar', color: '#d97706' },
    { id: 'gold', label: 'Gold', labelEs: 'Dorado', color: '#ca8a04' },
    { id: 'slate', label: 'Slate', labelEs: 'Pizarra', color: '#475569' }
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

  function applySettingVars() {
    const b = document.body.dataset;
    b.cardRadius = localStorage.getItem('numoraCardRadius') || 'rounded';
    b.cardShadow = localStorage.getItem('numoraCardShadow') || 'soft';
    b.pageWidth = localStorage.getItem('numoraPageWidth') || 'standard';
    b.bgTint = localStorage.getItem('numoraBgTint') || 'default';
    b.lineSpacing = localStorage.getItem('numoraLineSpacing') || 'normal';
    b.bigButtons = localStorage.getItem('numoraBigButtons') === 'true' ? 'true' : 'false';
    b.boldQuestions = localStorage.getItem('numoraBoldQuestions') === 'true' ? 'true' : 'false';
    b.focusRing = localStorage.getItem('numoraFocusRing') === 'true' ? 'true' : 'false';
    b.monoMode = localStorage.getItem('numoraMonoMode') === 'true' ? 'true' : 'false';
    b.hideQuotes = localStorage.getItem('numoraShowQuotes') === 'false' ? 'true' : 'false';
  }
  applySettingVars();

  const extra50Schema = [
    // Appearance (10)
    { k:'numoraCardRadius', cat:'appearance', type:'select', label:'1. Card corner style', opts:[['rounded','Rounded'],['sharp','Sharp'],['pill','Extra soft']] },
    { k:'numoraCardShadow', cat:'appearance', type:'select', label:'2. Card shadow depth', opts:[['soft','Soft'],['flat','Flat'],['elevated','Elevated']] },
    { k:'numoraPageWidth', cat:'appearance', type:'select', label:'3. Page width', opts:[['standard','Standard'],['wide','Wide'],['compact','Compact']] },
    { k:'numoraBgTint', cat:'appearance', type:'select', label:'4. Background tint', opts:[['default','Default'],['warm','Warm'],['cool','Cool'],['mint','Mint']] },
    { k:'numoraTopbarBlur', cat:'appearance', type:'check', label:'5. Topbar glass blur effect', def:'true' },
    { k:'numoraShowTopAvatar', cat:'appearance', type:'check', label:'6. Show avatar in topbar', def:'true' },
    { k:'numoraShowProfileGrade', cat:'appearance', type:'check', label:'7. Show grade label under profile name', def:'true' },
    { k:'numoraNavHighlight', cat:'appearance', type:'select', label:'8. Active sidebar item style', opts:[['fill','Filled pill'],['border','Left accent border']] },
    { k:'numoraCompactModals', cat:'appearance', type:'check', label:'9. Compact dialog spacing', def:'false' },
    { k:'numoraBackdropDim', cat:'appearance', type:'select', label:'10. Modal backdrop darkness', opts:[['medium','Medium'],['light','Light'],['dark','Dark']] },
    // Practice (12)
    { k:'numoraAutoClearWrong', cat:'practice', type:'check', label:'11. Auto-clear input on wrong answer', def:'false' },
    { k:'numoraShowQCounter', cat:'practice', type:'check', label:'12. Show question counter (e.g. 3 of 10)', def:'true' },
    { k:'numoraShowLessonBar', cat:'practice', type:'check', label:'13. Show progress bar in lessons', def:'true' },
    { k:'numoraShowTryAnother', cat:'practice', type:'check', label:'14. Show "Try another question" button', def:'true' },
    { k:'numoraShowHintCount', cat:'practice', type:'check', label:'15. Show remaining hint count on button', def:'true' },
    { k:'numoraAutoScratchpad', cat:'practice', type:'check', label:'16. Auto-open scratchpad on multi-step lessons', def:'false' },
    { k:'numoraPenColor', cat:'practice', type:'select', label:'17. Default scratchpad pen color', opts:[['#26324a','Black'],['#4263eb','Blue'],['#e05b48','Red']] },
    { k:'numoraPenSize', cat:'practice', type:'select', label:'18. Default scratchpad pen size', opts:[['3','Medium'],['2','Thin'],['5','Thick']] },
    { k:'numoraShowCombo', cat:'practice', type:'check', label:'19. Show combo multiplier badge', def:'true' },
    { k:'numoraShowSymBar', cat:'practice', type:'check', label:'20. Show math symbol bar in lessons', def:'true' },
    { k:'numoraAutoFocusNext', cat:'practice', type:'check', label:'21. Focus Next button after correct answer', def:'false' },
    { k:'numoraConfirmLeaveLesson', cat:'practice', type:'check', label:'22. Confirm before leaving active lesson', def:'false' },
    // Audio & Voice (8)
    { k:'numoraChimePitch', cat:'audio', type:'select', label:'23. Correct-answer chime pitch', opts:[['medium','Medium'],['low','Low'],['high','High']] },
    { k:'numoraClickSound', cat:'audio', type:'check', label:'24. Subtle click sound on buttons', def:'false' },
    { k:'numoraFinishFanfare', cat:'audio', type:'check', label:'25. Play chime when finishing a lesson', def:'true' },
    { k:'numoraWrongTone', cat:'audio', type:'check', label:'26. Play gentle tone on wrong answer', def:'false' },
    { k:'numoraVoicePitch', cat:'audio', type:'select', label:'27. Read-aloud voice pitch', opts:[['1','Normal (1.0)'],['0.8','Lower (0.8)'],['1.2','Higher (1.2)']] },
    { k:'numoraStopVoiceSubmit', cat:'audio', type:'check', label:'28. Stop speech when submitting answer', def:'true' },
    { k:'numoraVoiceAutoSubmit', cat:'audio', type:'check', label:'29. Auto-check after speaking answer', def:'false' },
    { k:'numoraMasterMute', cat:'audio', type:'check', label:'30. Mute all app sound effects', def:'false' },
    // Accessibility (8)
    { k:'numoraBigButtons', cat:'accessibility', type:'check', label:'31. Extra-large touch buttons', def:'false' },
    { k:'numoraBoldQuestions', cat:'accessibility', type:'check', label:'32. Bold question headings', def:'false' },
    { k:'numoraFocusRing', cat:'accessibility', type:'check', label:'33. High-visibility keyboard focus ring', def:'false' },
    { k:'numoraLineSpacing', cat:'accessibility', type:'select', label:'34. Reading line spacing', opts:[['normal','Normal'],['relaxed','Relaxed'],['wide','Wide']] },
    { k:'numoraSolidCards', cat:'accessibility', type:'check', label:'35. Solid high-clarity card borders', def:'false' },
    { k:'numoraHideHeadingEmoji', cat:'accessibility', type:'check', label:'36. Hide decorative emojis in headings', def:'false' },
    { k:'numoraKeyHints', cat:'accessibility', type:'check', label:'37. Show keyboard shortcut hints', def:'true' },
    { k:'numoraMonoMode', cat:'accessibility', type:'check', label:'38. Monochrome / grayscale display mode', def:'false' },
    // Goals & Alerts (6)
    { k:'numoraStreakAlerts', cat:'goals', type:'check', label:'39. Show streak milestone alerts', def:'true' },
    { k:'numoraXpToasts', cat:'goals', type:'check', label:'40. Show "+10 XP" toast popups', def:'true' },
    { k:'numoraToastDuration', cat:'goals', type:'select', label:'41. Notification toast duration', opts:[['3000','Normal (3s)'],['1800','Short (1.8s)'],['5000','Long (5s)']] },
    { k:'numoraDailyReminder', cat:'goals', type:'check', label:'42. Show daily goal reminder banner', def:'true' },
    { k:'numoraWeekendMult', cat:'goals', type:'select', label:'43. Weekend practice goal boost', opts:[['1','1× (Same)'],['1.5','1.5×'],['2','2×']] },
    { k:'numoraShowQuotes', cat:'goals', type:'check', label:'44. Show daily math quote on Home', def:'true' },
    // Data & Profile (6)
    { k:'numoraGreetingStyle', cat:'data', type:'select', label:'45. Home greeting style', opts:[['time','Time of day'],['welcome','Welcome back'],['learn','Ready to learn']] },
    { k:'numoraShowJoinDate', cat:'data', type:'check', label:'46. Show account join date on Home', def:'true' },
    { k:'numoraShowRecentXp', cat:'data', type:'check', label:'47. Show recent XP feed on Home', def:'true' },
    { k:'numoraAutoSaveNotes', cat:'data', type:'check', label:'48. Auto-save lesson notes while typing', def:'true' },
    { k:'numoraConfirmClear', cat:'data', type:'check', label:'49. Confirm before clearing queue or notes', def:'true' }
  ];

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

    const searchHtml = `<div class="settings-cat-tabs" role="group" aria-label="${es ? 'Categorías de ajustes' : 'Settings categories'}">
      <button type="button" class="secondary-btn active" data-settings-cat="all">${es ? 'Todo' : 'All'}</button>
      <button type="button" class="secondary-btn" data-settings-cat="appearance">${es ? 'Apariencia' : 'Appearance'}</button>
      <button type="button" class="secondary-btn" data-settings-cat="practice">${es ? 'Práctica' : 'Practice'}</button>
      <button type="button" class="secondary-btn" data-settings-cat="audio">${es ? 'Voz y sonido' : 'Audio & Voice'}</button>
      <button type="button" class="secondary-btn" data-settings-cat="accessibility">${es ? 'Accesibilidad' : 'Accessibility'}</button>
      <button type="button" class="secondary-btn" data-settings-cat="goals">${es ? 'Metas y avisos' : 'Goals & Alerts'}</button>
      <button type="button" class="secondary-btn" data-settings-cat="data">${es ? 'Datos y perfil' : 'Data & Profile'}</button>
    </div>
    <div class="settings-search-wrap">
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

    const catMap = {
      appearance: 'Appearance', practice: 'Practice', audio: 'Audio & Voice',
      accessibility: 'Accessibility', goals: 'Goals & Alerts', data: 'Data & Profile'
    };
    const extra50Html = Object.entries(catMap).map(([catId, catTitle]) => {
      const rows = extra50Schema.filter(item => item.cat === catId).map(item => {
        const cur = localStorage.getItem(item.k);
        if (item.type === 'check') {
          const checked = cur !== null ? cur === 'true' : item.def === 'true';
          return `<label class="setting-check"><input type="checkbox" data-extra-setting="${item.k}" ${checked ? 'checked' : ''}><span>${esc(item.label)}</span></label>`;
        }
        const val = cur ?? item.opts[0][0];
        return `<label class="setting-row">${esc(item.label)}<select data-extra-setting="${item.k}">${item.opts.map(([ov, ol]) => `<option value="${esc(ov)}" ${val === ov ? 'selected' : ''}>${esc(ol)}</option>`).join('')}</select></label>`;
      }).join('');
      const extraBtn = catId === 'data' ? `<div class="settings-tool-buttons" style="margin-top:10px"><button type="button" class="secondary-btn" data-export-settings-only>50. Export settings JSON</button></div>` : '';
      return `<div class="answer-setting" data-setting-cat="${catId}"><strong>${esc(catTitle)}</strong>${rows}${extraBtn}</div>`;
    }).join('');

    panel.insertAdjacentHTML('beforeend', profileHtml + voiceHtml + accentHtml + extraPrefsHtml + extra50Html + dataSummaryHtml + backupAndResetHtml);

    // Tag existing core setting sections by category for the category filter buttons
    panel.querySelectorAll('.answer-setting:not([data-setting-cat])').forEach(sec => {
      const txt = sec.textContent.toLowerCase();
      if (txt.includes('language') || txt.includes('backup') || txt.includes('saved account') || txt.includes('profile')) sec.dataset.settingCat = 'data';
      else if (txt.includes('accent') || txt.includes('theme')) sec.dataset.settingCat = 'appearance';
      else if (txt.includes('voice') || txt.includes('accessibility') || txt.includes('contrast') || txt.includes('font')) sec.dataset.settingCat = 'accessibility';
      else if (txt.includes('goal')) sec.dataset.settingCat = 'goals';
      else sec.dataset.settingCat = 'practice';
    });
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

    const catBtn = target.closest('[data-settings-cat]');
    if (catBtn) {
      const cat = catBtn.dataset.settingsCat;
      document.querySelectorAll('[data-settings-cat]').forEach(b => b.classList.toggle('active', b === catBtn));
      document.querySelectorAll('.settings-panel .answer-setting').forEach(sec => {
        sec.classList.toggle('hidden', cat !== 'all' && sec.dataset.settingCat !== cat);
      });
      return;
    }

    if (target.closest('[data-export-settings-only]')) {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('numora') && !k.includes('Password') && !k.includes('Accounts'));
      const data = Object.fromEntries(keys.map(k => [k, localStorage.getItem(k)]));
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'numora-settings.json'; a.click();
      URL.revokeObjectURL(a.href);
      window.showToast?.('Settings JSON exported.');
      return;
    }

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

    if (target.matches('[data-extra-setting]')) {
      const key = target.dataset.extraSetting;
      const val = target instanceof HTMLInputElement && target.type === 'checkbox' ? String(target.checked) : target.value;
      localStorage.setItem(key, val);
      applySettingVars();
      window.saveCurrentAccountProgress?.();
      window.showToast?.('Setting saved.');
      return;
    }

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
