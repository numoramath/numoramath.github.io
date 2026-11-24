(() => {
  const content = document.querySelector('#app-content');
  if (!content) return;

  const spanish = () => localStorage.getItem('numoraLanguage') === 'es';
  const backdrop = document.createElement('div');
  backdrop.className = 'scratchpad-backdrop';
  backdrop.hidden = true;
  backdrop.innerHTML = `<section class="scratchpad-panel" role="dialog" aria-modal="true" aria-labelledby="scratchpad-title"><header><div><span class="scratchpad-kicker">${spanish() ? 'ESPACIO DE TRABAJO' : 'WORK SPACE'}</span><h2 id="scratchpad-title">${spanish() ? 'Borrador de matemáticas' : 'Math scratchpad'}</h2></div><button type="button" class="scratchpad-close" data-scratchpad-action="close" aria-label="${spanish() ? 'Cerrar borrador' : 'Close scratchpad'}">×</button></header><p>${spanish() ? 'Dibuja o escribe los pasos. Este borrador se borra al salir de la lección.' : 'Draw or work through the steps. This scratchpad clears when you leave the lesson.'}</p><div class="scratchpad-tools" role="toolbar" aria-label="${spanish() ? 'Herramientas del borrador' : 'Scratchpad tools'}"><button type="button" data-scratchpad-color="#26324a" aria-label="${spanish() ? 'Lápiz negro' : 'Black pen'}" aria-pressed="true"><i class="scratchpad-swatch black"></i></button><button type="button" data-scratchpad-color="#4263eb" aria-label="${spanish() ? 'Lápiz azul' : 'Blue pen'}" aria-pressed="false"><i class="scratchpad-swatch blue"></i></button><button type="button" data-scratchpad-color="#e05b48" aria-label="${spanish() ? 'Lápiz rojo' : 'Red pen'}" aria-pressed="false"><i class="scratchpad-swatch red"></i></button><button type="button" data-scratchpad-action="eraser" aria-pressed="false">${spanish() ? '⌫ Borrador' : '⌫ Eraser'}</button><button type="button" data-scratchpad-action="undo" disabled>${spanish() ? '↶ Deshacer' : '↶ Undo'}</button></div><canvas class="scratchpad-canvas" aria-label="${spanish() ? 'Área para trabajar matemáticas' : 'Math work area'}"></canvas><footer><span>${spanish() ? 'Usa el ratón, el tacto o un lápiz digital.' : 'Use a mouse, touch, or a stylus.'}</span><button type="button" class="secondary-btn" data-scratchpad-action="clear">${spanish() ? 'Borrar todo' : 'Clear all'}</button></footer></section>`;
  document.body.appendChild(backdrop);
  const canvas = backdrop.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  let lessonIdentity = '';
  let drawing = false;
  let lastPoint = null;
  let lastOpener = null;
  let penColor = '#26324a';
  let erasing = false;
  let undoStack = [];

  function setCanvasSize(preserveDrawing = false) {
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    let snapshot = null;
    if (preserveDrawing && canvas.width > 1 && canvas.height > 1) {
      snapshot = document.createElement('canvas');
      snapshot.width = canvas.width;
      snapshot.height = canvas.height;
      snapshot.getContext('2d').drawImage(canvas, 0, 0);
    }
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 3;
    ctx.globalCompositeOperation = erasing ? 'destination-out' : 'source-over';
    if (snapshot) ctx.drawImage(snapshot, 0, 0, snapshot.width, snapshot.height, 0, 0, width, height);
    undoStack = [];
    syncUndoButton();
  }

  function resetCanvas() {
    setCanvasSize(false);
  }

  function clearDrawing() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    undoStack = [];
    syncUndoButton();
  }

  function fitCanvas() {
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) setCanvasSize(true);
  }

  function syncUndoButton() {
    const undo = backdrop.querySelector('[data-scratchpad-action="undo"]');
    if (undo) undo.disabled = undoStack.length === 0;
  }

  function openScratchpad(opener) {
    lastOpener = opener;
    backdrop.hidden = false;
    requestAnimationFrame(() => {
      fitCanvas();
      backdrop.querySelector('[data-scratchpad-action="close"]').focus();
    });
  }

  function closeScratchpad() {
    const wasOpen = !backdrop.hidden;
    backdrop.hidden = true;
    drawing = false;
    if (wasOpen && lastOpener?.isConnected) lastOpener.focus();
  }

  backdrop.querySelector('[data-scratchpad-action="close"]').addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    closeScratchpad();
  });
  backdrop.querySelector('[data-scratchpad-action="clear"]').addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    clearDrawing();
  });

  function pointFrom(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function addButton(shell) {
    if (shell.querySelector('.scratchpad-launch')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'secondary-btn scratchpad-launch';
    button.dataset.scratchpadAction = 'open';
    button.textContent = `${spanish() ? '✎ Abrir borrador' : '✎ Open scratchpad'}`;
    shell.querySelector('.question-card')?.before(button);
  }

  function updateLesson() {
    const shell = content.querySelector('.practice-shell');
    if (!shell || shell.querySelector('[data-challenge-time]')) {
      if (lessonIdentity) {
        lessonIdentity = '';
        closeScratchpad();
        resetCanvas();
      }
      return;
    }
    const identity = `${shell.querySelector('.practice-meta b')?.textContent || ''}|${shell.querySelector('.skill-tag')?.textContent || ''}`;
    if (identity !== lessonIdentity) {
      lessonIdentity = identity;
      closeScratchpad();
      resetCanvas();
    }
    addButton(shell);
  }

  content.addEventListener('click', event => {
    const button = event.target instanceof Element ? event.target.closest('[data-scratchpad-action]') : null;
    if (!button) return;
    event.preventDefault();
    if (button.dataset.scratchpadAction === 'open') openScratchpad(button);
    if (button.dataset.scratchpadAction === 'close') closeScratchpad();
    if (button.dataset.scratchpadAction === 'clear') resetCanvas();
  });
  backdrop.addEventListener('click', event => {
    const tool = event.target instanceof Element ? event.target.closest('[data-scratchpad-action],[data-scratchpad-color]') : null;
    if (tool) {
      if (tool.dataset.scratchpadColor) {
        penColor = tool.dataset.scratchpadColor;
        erasing = false;
        ctx.strokeStyle = penColor;
        ctx.globalCompositeOperation = 'source-over';
        backdrop.querySelectorAll('[data-scratchpad-color]').forEach(button => button.setAttribute('aria-pressed', String(button === tool)));
        backdrop.querySelector('[data-scratchpad-action="eraser"]').setAttribute('aria-pressed', 'false');
      }
      if (tool.dataset.scratchpadAction === 'eraser') {
        erasing = !erasing;
        ctx.globalCompositeOperation = erasing ? 'destination-out' : 'source-over';
        backdrop.querySelector('[data-scratchpad-action="eraser"]').setAttribute('aria-pressed', String(erasing));
      }
      if (tool.dataset.scratchpadAction === 'undo' && undoStack.length) {
        ctx.putImageData(undoStack.pop(), 0, 0);
        syncUndoButton();
      }
      if (tool.dataset.scratchpadAction === 'clear' || tool.dataset.scratchpadAction === 'close') return;
      event.preventDefault();
      return;
    }
    if (event.target === backdrop) closeScratchpad();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !backdrop.hidden) closeScratchpad();
  });
  canvas.addEventListener('pointerdown', event => {
    if (backdrop.hidden) return;
    drawing = true;
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (undoStack.length > 20) undoStack.shift();
    syncUndoButton();
    lastPoint = pointFrom(event);
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (!drawing || !lastPoint) return;
    const nextPoint = pointFrom(event);
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(nextPoint.x, nextPoint.y);
    ctx.stroke();
    lastPoint = nextPoint;
  });
  const stopDrawing = () => { drawing = false; lastPoint = null; };
  canvas.addEventListener('pointerup', stopDrawing);
  canvas.addEventListener('pointercancel', stopDrawing);
  new MutationObserver(updateLesson).observe(content, { childList: true, subtree: true, characterData: true });
  updateLesson();
})();
