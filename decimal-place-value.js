(function(){
  const lab={ones:3,tenths:4,hundredths:7,target:'tenths',score:0,solved:false,feedback:'',steps:false};
  const placeNames={ones:{en:'ones',es:'unidades'},tenths:{en:'tenths',es:'décimas'},hundredths:{en:'hundredths',es:'centésimas'}};
  const isSpanish=()=>localStorage.getItem('numoraLanguage')==='es';
  const decimalNumber=()=>`${lab.ones}.${lab.tenths}${lab.hundredths}`;
  const placeValue=place=>place==='ones'?lab.ones:place==='tenths'?lab.tenths/10:lab.hundredths/100;
  const prettyValue=value=>Number(value).toString();
  function updateDecimalLab(){
    const es=isSpanish(),number=decimalNumber();
    for(const place of ['ones','tenths','hundredths']){
      const slider=content.querySelector(`[data-decimal-digit="${place}"]`),digits=content.querySelectorAll(`[data-decimal-output="${place}"]`),value=content.querySelector(`[data-decimal-value="${place}"]`),cell=content.querySelector(`[data-decimal-cell="${place}"]`);
      if(slider&&Number(slider.value)!==lab[place])slider.value=String(lab[place]);
      digits.forEach(digit=>digit.textContent=String(lab[place]));
      if(value)value.textContent=prettyValue(placeValue(place));
      if(cell){cell.classList.toggle('is-target',place===lab.target);cell.setAttribute('aria-pressed',String(place===lab.target));}
    }
    const numberNode=content.querySelector('[data-decimal-number]'),decomposition=content.querySelector('[data-decimal-decomposition]'),prompt=content.querySelector('[data-decimal-prompt]'),feedback=content.querySelector('.decimal-lab-feedback'),steps=content.querySelector('.decimal-lab-steps');
    if(numberNode)numberNode.textContent=number;
    if(decomposition)decomposition.textContent=`${lab.ones} + ${lab.tenths}/10 + ${lab.hundredths}/100 = ${number}`;
    if(prompt)prompt.textContent=es?`En ${number}, ¿cuál es el valor del dígito de las ${placeNames[lab.target].es}?`:`In ${number}, what is the value of the ${placeNames[lab.target].en} digit?`;
    if(feedback)feedback.textContent=lab.feedback;
    if(steps)steps.classList.toggle('hidden',!lab.steps);
    const answer=content.querySelector('#decimal-lab-answer'),check=content.querySelector('[data-decimal-action="check"]');
    if(answer)answer.disabled=lab.solved;
    if(check)check.disabled=lab.solved;
    const solution=content.querySelector('[data-decimal-solution]');if(solution)solution.innerHTML=es?`El dígito ${lab[lab.target]} está en las ${placeNames[lab.target].es}. Su valor es <strong>${prettyValue(placeValue(lab.target))}</strong>.`:`The digit ${lab[lab.target]} is in the ${placeNames[lab.target].en} place. Its value is <strong>${prettyValue(placeValue(lab.target))}</strong>.`;
  }
  function renderDecimalLab(){
    const es=isSpanish();pageTitle.textContent=es?'Laboratorio de valor posicional decimal':'Decimal place-value lab';
    content.innerHTML=`<div class="page-wrap decimal-lab-page"><div class="hero-row"><div><span class="eyebrow">${es?'EXPLORA LOS DECIMALES':'EXPLORE DECIMALS'}</span><h1>${es?'Laboratorio de valor posicional':'Place-value lab'}</h1><p>${es?'Construye un número y descubre cuánto vale cada dígito.':'Build a number and explore what each digit is worth.'}</p></div><div class="decimal-lab-score"><strong>${lab.score}</strong><span>${es?'respuestas correctas':'correct answers'}</span></div></div><section class="card decimal-number-card"><span>${es?'Tu número':'Your number'}</span><strong data-decimal-number></strong><p data-decimal-decomposition></p></section><section class="decimal-lab-workspace"><div class="card decimal-digit-controls"><h2>${es?'Construye tu número':'Build your number'}</h2>${['ones','tenths','hundredths'].map(place=>`<label class="decimal-digit-slider"><span>${placeNames[place][es?'es':'en']} <strong data-decimal-output="${place}">${lab[place]}</strong></span><input type="range" min="0" max="9" step="1" value="${lab[place]}" data-decimal-digit="${place}" aria-label="${placeNames[place][es?'es':'en']}"></label>`).join('')}</div><div class="card decimal-place-chart"><h2>${es?'Tabla de valor posicional':'Place-value chart'}</h2><div class="decimal-chart-grid">${['ones','tenths','hundredths'].map(place=>`<button type="button" class="decimal-place-cell ${place===lab.target?'is-target':''}" data-decimal-cell="${place}" aria-pressed="${place===lab.target}"><small>${placeNames[place][es?'es':'en']}</small><strong data-decimal-output="${place}">${lab[place]}</strong><span>${es?'valor':'value'}: <b data-decimal-value="${place}">${prettyValue(placeValue(place))}</b></span></button>`).join('')}</div><p>${es?'Elige una columna para cambiar el dígito del reto.':'Choose a column to change the challenge digit.'}</p></div></section><section class="card decimal-lab-challenge"><span class="report-kicker">${es?'RETO RÁPIDO':'QUICK CHALLENGE'}</span><h2>${es?'¿Cuánto vale el dígito?':'What is the digit worth?'}</h2><p data-decimal-prompt></p><div class="decimal-answer-row"><input id="decimal-lab-answer" type="number" step="0.01" inputmode="decimal" placeholder="${es?'Escribe su valor':'Enter its value'}" aria-label="${es?'Tu respuesta':'Your answer'}" ${lab.solved?'disabled':''}><button type="button" class="primary-btn" data-decimal-action="check" ${lab.solved?'disabled':''}>${es?'Comprobar':'Check answer'}</button></div><p class="decimal-lab-feedback" aria-live="polite"></p><div class="decimal-lab-steps hidden"><strong>${es?'Valor posicional':'Place value'}</strong><p data-decimal-solution></p></div><div class="decimal-lab-actions"><button type="button" class="secondary-btn" data-decimal-action="steps">${es?'Mostrar explicación':'Show explanation'}</button><button type="button" class="primary-btn" data-decimal-action="new">${es?'Nuevo número':'New number'} →</button></div></section></div>`;
    updateDecimalLab();
  }
  document.addEventListener('click',event=>{
    if(!(event.target instanceof Element))return;
    const nav=event.target.closest('[data-view="decimal-lab"]'),cell=event.target.closest('[data-decimal-cell]'),action=event.target.closest('[data-decimal-action]');
    if(nav){event.preventDefault();event.stopImmediatePropagation();lab.feedback='';renderDecimalLab();document.querySelectorAll('.nav-item').forEach(item=>item.classList.toggle('active',item===nav));return;}
    if(cell){event.preventDefault();event.stopImmediatePropagation();lab.target=cell.dataset.decimalCell;lab.solved=false;lab.feedback='';lab.steps=false;const input=content.querySelector('#decimal-lab-answer');if(input)input.value='';updateDecimalLab();return;}
    if(!action)return;event.preventDefault();event.stopImmediatePropagation();const es=isSpanish();
    if(action.dataset.decimalAction==='new'){lab.ones=Math.floor(Math.random()*10);lab.tenths=Math.floor(Math.random()*10);lab.hundredths=Math.floor(Math.random()*10);lab.target=['ones','tenths','hundredths'][Math.floor(Math.random()*3)];lab.solved=false;lab.feedback='';lab.steps=false;renderDecimalLab();return;}
    if(action.dataset.decimalAction==='steps'){lab.steps=!lab.steps;updateDecimalLab();return;}
    if(lab.solved)return;
    const input=content.querySelector('#decimal-lab-answer');if(!input)return;
    if(!input.value.trim()){lab.feedback=es?'Escribe una respuesta primero.':'Enter an answer first.';updateDecimalLab();return;}
    const expected=placeValue(lab.target),entered=Number(input.value);
    if(Number.isFinite(entered)&&Math.abs(entered-expected)<0.00001){lab.solved=true;lab.score++;lab.feedback=es?'¡Correcto! Ganaste 10 XP.':'Correct! You earned 10 XP.';setXpBalance(getXpBalance()+10);showToast(es?'¡Muy bien! +10 XP':'Nice work! +10 XP');}
    else lab.feedback=es?'Aún no. Compara el dígito con su posición en la tabla.':'Not quite. Compare the digit with its place in the chart.';
    updateDecimalLab();
  },true);
  document.addEventListener('input',event=>{if(!(event.target instanceof Element)||!event.target.matches('[data-decimal-digit]'))return;const place=event.target.dataset.decimalDigit,value=Number(event.target.value);if(!Number.isInteger(value)||value<0||value>9)return;lab[place]=value;lab.solved=false;lab.feedback='';lab.steps=false;const answer=content.querySelector('#decimal-lab-answer');if(answer)answer.value='';updateDecimalLab();});
  document.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target instanceof Element&&event.target.id==='decimal-lab-answer')content.querySelector('[data-decimal-action="check"]')?.click();});
})();
