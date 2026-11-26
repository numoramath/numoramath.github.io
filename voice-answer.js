(() => {
  const content = document.querySelector('#app-content');
  if (!content) return;
  const isSpanish = () => localStorage.getItem('numoraLanguage') === 'es';
  const units = {
    zero:0,oh:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,
    eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,
    twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90,
    cero:0,uno:1,una:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8,nueve:9,diez:10,
    once:11,doce:12,trece:13,catorce:14,quince:15,dieciseis:16,dieciséis:16,diecisiete:17,dieciocho:18,diecinueve:19,
    veinte:20,veintiuno:21,veintiun:21,veintidos:22,veintidós:22,veintitres:23,veintitrés:23,veinticuatro:24,
    veinticinco:25,veintiseis:26,veintiséis:26,veintisiete:27,veintiocho:28,veintinueve:29,
    treinta:30,cuarenta:40,cincuenta:50,sesenta:60,setenta:70,ochenta:80,noventa:90
  };
  function wordsToNumber(words) {
    const negative = words[0] === 'minus' || words[0] === 'menos';
    let total = 0, current = 0, found = false;
    for (const word of words) {
      if (word === 'and' || word === 'y' || word === 'minus' || word === 'menos') continue;
      if (word === 'hundred' || word === 'cien' || word === 'ciento') { current = (current || 1) * 100; found = true; continue; }
      if (word === 'thousand' || word === 'mil') { total += (current || 1) * 1000; current = 0; found = true; continue; }
      if (Object.hasOwn(units, word)) { current += units[word]; found = true; continue; }
      if (/^\d+$/.test(word)) { current += Number(word); found = true; continue; }
      return null;
    }
    return found ? (negative ? -1 : 1) * (total + current) : null;
  }
  function normalizeTranscript(transcript) {
    const cleaned = transcript.toLocaleLowerCase().replace(/[¿?.,!¡]/g, ' ').replace(/\s+/g, ' ').trim();
    const fraction = cleaned.match(/^(one|uno|una|two|dos|three|tres)\s+(half|mitad|quarter|cuarto|cuartos)$/);
    if (fraction) {
      const numerator = ({one:1,uno:1,una:1,two:2,dos:2,three:3,tres:3})[fraction[1]];
      const denominator = /half|mitad/.test(fraction[2]) ? 2 : 4;
      return `${numerator}/${denominator}`;
    }
    const parts = cleaned.split(/\s+(?:point|punto|coma)\s+/);
    const integer = parts[0] ? wordsToNumber(parts[0].split(/\s+/)) : 0;
    if (integer === null) return transcript.trim();
    if (parts.length === 1) return String(integer);
    const decimalWords = parts.slice(1).join(' ').split(/\s+/);
    const digits = decimalWords.map(word => Object.hasOwn(units, word) && units[word] < 10 ? units[word] : /^\d$/.test(word) ? word : null);
    if (digits.some(digit => digit === null)) return transcript.trim();
    return `${integer}.${digits.join('')}`;
  }
  function ensureButton() {
    const input = content.querySelector('.practice-shell .question-card .answer-input');
    const solved = Boolean(content.querySelector('.practice-shell .feedback.success, .practice-shell .answer-input.correct'));
    const existing = content.querySelector('[data-voice-answer]');
    if (!input || solved || content.querySelector('[data-challenge-time]')) {
      existing?.remove();
      return;
    }
    if (existing) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'secondary-btn voice-answer-btn';
    button.dataset.voiceAnswer = '';
    button.textContent = isSpanish() ? '🎙 Responder hablando' : '🎙 Speak answer';
    button.setAttribute('aria-label', isSpanish() ? 'Decir la respuesta en voz alta' : 'Speak your answer');
    input.insertAdjacentElement('afterend', button);
  }
  document.addEventListener('click', event => {
    const button = event.target instanceof Element ? event.target.closest('[data-voice-answer]') : null;
    if (!button) return;
    event.preventDefault();
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { window.showToast?.(isSpanish() ? 'El dictado por voz no está disponible en este navegador.' : 'Voice input is not available in this browser.'); return; }
    const input = content.querySelector('.practice-shell .question-card .answer-input');
    if (!input) return;
    const recognition = new Recognition();
    recognition.lang = isSpanish() ? 'es-ES' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    button.disabled = true;
    button.textContent = isSpanish() ? '🎙 Escuchando…' : '🎙 Listening…';
    recognition.onresult = resultEvent => {
      if (!input.isConnected) return;
      const transcript = resultEvent.results?.[0]?.[0]?.transcript || '';
      input.value = normalizeTranscript(transcript);
      input.dispatchEvent(new Event('input', {bubbles:true}));
      input.focus();
      window.showToast?.(isSpanish() ? 'Respuesta escuchada. Revísala y comprueba.' : 'Answer captured. Review it, then check it.');
    };
    recognition.onerror = errorEvent => {
      const message = errorEvent.error === 'not-allowed' ? (isSpanish() ? 'Permite el micrófono para usar la voz.' : 'Allow microphone access to use voice input.') : (isSpanish() ? 'No se pudo escuchar. Inténtalo otra vez.' : 'Could not hear that. Try again.');
      window.showToast?.(message);
    };
    recognition.onend = () => {
      button.disabled = false;
      button.textContent = isSpanish() ? '🎙 Responder hablando' : '🎙 Speak answer';
    };
    try { recognition.start(); } catch { button.disabled = false; button.textContent = isSpanish() ? '🎙 Responder hablando' : '🎙 Speak answer'; }
  });
  new MutationObserver(ensureButton).observe(content, {childList:true, subtree:true, attributes:true, attributeFilter:['class']});
  ensureButton();
})();
