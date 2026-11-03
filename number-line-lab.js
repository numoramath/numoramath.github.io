(function(){
  const lab={start:2,step:3,jumps:4,score:0,solved:false,feedback:'',steps:false};
  const endValue=()=>lab.start+lab.step*lab.jumps;
  const isSpanish=()=>localStorage.getItem('numoraLanguage')==='es';
  function lineSvg(){
    const end=endValue(),max=end+2,left=48,right=752,axisY=134,scale=(right-left)/max;
    const x=value=>left+value*scale;
    const ticks=Array.from({length:max+1},(_,value)=>{const major=value===0||value===end||value%5===0||value===lab.start||value>lab.start&&(value-lab.start)%lab.step===0;return `<line class="number-line-tick ${major?'is-major':''}" x1="${x(value)}" y1="${axisY- (major?9:5)}" x2="${x(value)}" y2="${axisY+(major?9:5)}"/>${major?`<text class="number-line-label" x="${x(value)}" y="${axisY+29}" text-anchor="middle">${value}</text>`:''}`;}).join('');
    const arcs=Array.from({length:lab.jumps},(_,index)=>{const from=lab.start+index*lab.step,to=from+lab.step,y=axisY-28-(index%2)*10;return `<path class="number-line-arc" d="M ${x(from)} ${axisY-4} Q ${(x(from)+x(to))/2} ${y} ${x(to)} ${axisY-4}"/><path class="number-line-arrow" d="M ${x(to)-5} ${axisY-10} L ${x(to)} ${axisY-4} L ${x(to)-6} ${axisY}"/>`;}).join('');
    const dots=Array.from({length:lab.jumps+1},(_,index)=>{const value=lab.start+index*lab.step;return `<circle class="number-line-dot ${index===lab.jumps?'is-end':''}" cx="${x(value)}" cy="${axisY}" r="${index===lab.jumps?9:6}"/>`;}).join('');
    const es=isSpanish();
    return `<svg class="number-line-svg" viewBox="0 0 800 210" role="img" aria-label="${es?`Línea numérica desde ${lab.start} hasta ${end}, con ${lab.jumps} saltos de ${lab.step}`:`Number line from ${lab.start} to ${end} with ${lab.jumps} jumps of ${lab.step}`}" focusable="false"><line class="number-line-axis" x1="${left}" y1="${axisY}" x2="${right}" y2="${axisY}"/>${ticks}${arcs}${dots}</svg>`;
  }
  function updateLineLab(){
    const es=isSpanish(),end=endValue(),svg=content.querySelector('.number-line-svg');
    if(svg)svg.outerHTML=lineSvg();
    const startOutput=content.querySelector('[data-line-output="start"]'),stepOutput=content.querySelector('[data-line-output="step"]'),jumpsOutput=content.querySelector('[data-line-output="jumps"]');
    if(startOutput)startOutput.textContent=String(lab.start);if(stepOutput)stepOutput.textContent=String(lab.step);if(jumpsOutput)jumpsOutput.textContent=String(lab.jumps);
    const formula=content.querySelector('[data-line-formula]');if(formula)formula.textContent=`${lab.start} + (${lab.step} × ${lab.jumps}) = ${end}`;
    const prompt=content.querySelector('[data-line-prompt]');if(prompt)prompt.textContent=es?`Empieza en ${lab.start} y da ${lab.jumps} saltos de ${lab.step}. ¿En qué número terminas?`:`Start at ${lab.start} and make ${lab.jumps} jumps of ${lab.step}. Where do you land?`;
    const steps=content.querySelector('[data-line-steps]');if(steps)steps.innerHTML=Array.from({length:lab.jumps+1},(_,index)=>lab.start+index*lab.step).join(es?' → ':' → ');
    const stepsCard=content.querySelector('.number-line-steps');if(stepsCard)stepsCard.classList.toggle('hidden',!lab.steps);
    const feedback=content.querySelector('.number-line-feedback');if(feedback)feedback.textContent=lab.feedback;
    const answer=content.querySelector('#number-line-answer'),check=content.querySelector('[data-line-action="check"]');if(answer)answer.disabled=lab.solved;if(check)check.disabled=lab.solved;
  }
  function renderLineLab(){
    const es=isSpanish();pageTitle.textContent=es?'Laboratorio de línea numérica':'Number line lab';
    content.innerHTML=`<div class="page-wrap number-line-page"><div class="hero-row"><div><span class="eyebrow">${es?'VISUALIZA LOS SALTOS':'SEE EACH JUMP'}</span><h1>${es?'Laboratorio de línea numérica':'Number line lab'}</h1><p>${es?'Cambia el inicio, el tamaño del salto y cuántas veces saltas.':'Change the starting number, jump size, and number of jumps.'}</p></div><div class="number-line-score"><strong>${lab.score}</strong><span>${es?'retos correctos':'challenges solved'}</span></div></div><section class="card number-line-model"><h2>${es?'Mira los saltos':'Follow the jumps'}</h2><div class="number-line-stage"><svg class="number-line-svg" viewBox="0 0 800 210" role="img" aria-label=""></svg></div><p class="number-line-formula" data-line-formula></p></section><section class="card number-line-controls"><h2>${es?'Ajusta la línea':'Change the number line'}</h2><div class="number-line-sliders"><label><span>${es?'Número inicial':'Start at'} <strong data-line-output="start">${lab.start}</strong></span><input type="range" min="0" max="10" step="1" value="${lab.start}" data-line-size="start" aria-label="${es?'Número inicial':'Starting number'}"></label><label><span>${es?'Tamaño del salto':'Jump size'} <strong data-line-output="step">${lab.step}</strong></span><input type="range" min="1" max="5" step="1" value="${lab.step}" data-line-size="step" aria-label="${es?'Tamaño del salto':'Jump size'}"></label><label><span>${es?'Cantidad de saltos':'Number of jumps'} <strong data-line-output="jumps">${lab.jumps}</strong></span><input type="range" min="1" max="5" step="1" value="${lab.jumps}" data-line-size="jumps" aria-label="${es?'Cantidad de saltos':'Number of jumps'}"></label></div></section><section class="card number-line-challenge"><span class="report-kicker">${es?'PRACTICA':'PRACTICE'}</span><h2>${es?'¿Dónde aterrizas?':'Where do you land?'}</h2><p data-line-prompt></p><div class="number-line-answer-row"><input id="number-line-answer" type="number" min="0" step="1" inputmode="numeric" placeholder="${es?'Escribe el número':'Enter the number'}" aria-label="${es?'Tu respuesta':'Your answer'}" ${lab.solved?'disabled':''}><button type="button" class="primary-btn" data-line-action="check" ${lab.solved?'disabled':''}>${es?'Comprobar':'Check answer'}</button></div><p class="number-line-feedback" aria-live="polite"></p><div class="number-line-steps hidden"><strong>${es?'Cada salto':'Each jump'}</strong><p data-line-steps></p></div><div class="number-line-actions"><button type="button" class="secondary-btn" data-line-action="steps">${es?'Mostrar los pasos':'Show steps'}</button><button type="button" class="primary-btn" data-line-action="new">${es?'Nuevo reto':'New challenge'} →</button></div></section></div>`;
    updateLineLab();
  }
  document.addEventListener('click',event=>{
    if(!(event.target instanceof Element))return;
    const nav=event.target.closest('[data-view="number-line"]'),action=event.target.closest('[data-line-action]');
    if(nav){event.preventDefault();event.stopImmediatePropagation();lab.feedback='';renderLineLab();document.querySelectorAll('.nav-item').forEach(item=>item.classList.toggle('active',item===nav));return;}
    if(!action)return;event.preventDefault();event.stopImmediatePropagation();const es=isSpanish();
    if(action.dataset.lineAction==='new'){lab.start=Math.floor(Math.random()*11);lab.step=1+Math.floor(Math.random()*5);lab.jumps=1+Math.floor(Math.random()*5);lab.solved=false;lab.feedback='';lab.steps=false;renderLineLab();return;}
    if(action.dataset.lineAction==='steps'){lab.steps=!lab.steps;updateLineLab();return;}
    if(lab.solved)return;const input=content.querySelector('#number-line-answer');if(!input)return;
    if(!input.value.trim()){lab.feedback=es?'Escribe tu respuesta primero.':'Enter an answer first.';updateLineLab();return;}
    if(Number(input.value)===endValue()){lab.solved=true;lab.score++;lab.feedback=es?'¡Correcto! Ganaste 10 XP.':'Correct! You earned 10 XP.';setXpBalance(getXpBalance()+10);showToast(es?'¡Muy bien! +10 XP':'Nice work! +10 XP');}
    else lab.feedback=es?'Aún no. Cuenta cada salto desde el número inicial.':'Not quite. Count each jump from the starting number.';
    updateLineLab();
  },true);
  document.addEventListener('input',event=>{if(!(event.target instanceof Element)||!event.target.matches('[data-line-size]'))return;const key=event.target.dataset.lineSize,value=Number(event.target.value),limit=key==='start'?10:5;if(!Number.isInteger(value)||value<(key==='start'?0:1)||value>limit)return;lab[key]=value;lab.solved=false;lab.feedback='';lab.steps=false;const answer=content.querySelector('#number-line-answer');if(answer)answer.value='';updateLineLab();});
  document.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target instanceof Element&&event.target.id==='number-line-answer')content.querySelector('[data-line-action="check"]')?.click();});
})();
