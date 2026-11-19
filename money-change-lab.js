(function(){
  const goods=[
    {en:'Apple',es:'Manzana',icon:'🍎'}, {en:'Pencil',es:'Lápiz',icon:'✏️'},
    {en:'Notebook',es:'Cuaderno',icon:'📓'}, {en:'Juice',es:'Jugo',icon:'🧃'},
    {en:'Toy car',es:'Carrito',icon:'🚗'}, {en:'Book',es:'Libro',icon:'📘'},
    {en:'Ball',es:'Pelota',icon:'⚽'}, {en:'Snack',es:'Bocadillo',icon:'🥨'}
  ];
  const lab={basket:[],total:0,payment:0,score:0,solved:false,feedback:'',showSteps:false};
  const isSpanish=()=>localStorage.getItem('numoraLanguage')==='es';
  function difficulty(){const grade=localStorage.getItem('numoraGrade')||'Pre-K',match=/^Grade (\d+)$/.exec(grade),n=match?Number(match[1]):0;return{early:grade==='Pre-K'||grade==='Kindergarten'||n<=2,coins:n>=3&&n<=5,advanced:n>=6||grade==='College'};}
  function money(cents){return new Intl.NumberFormat(isSpanish()?'es-US':'en-US',{style:'currency',currency:'USD'}).format(cents/100);}
  function createBasket(){
    const level=difficulty(),count=level.early?2:3,chosen=[];
    while(chosen.length<count){const item=goods[Math.floor(Math.random()*goods.length)];if(!chosen.includes(item))chosen.push(item);}
    lab.basket=chosen.map(item=>{const quantity=level.early?1:1+Math.floor(Math.random()*3);let unit;if(level.early)unit=(1+Math.floor(Math.random()*5))*100;else if(level.coins)unit=(1+Math.floor(Math.random()*12))*25;else unit=(25+Math.floor(Math.random()*150))*5;return{item,quantity,unit,total:unit*quantity};});
    lab.total=lab.basket.reduce((sum,line)=>sum+line.total,0);
    const paymentStep=level.advanced?500:100;
    lab.payment=(Math.floor(lab.total/paymentStep)+1)*paymentStep;
    lab.solved=false;lab.feedback='';lab.showSteps=false;
  }
  function coinBreakdown(cents){let rest=cents;const values=[[100,'$1'],[25,'25¢'],[10,'10¢'],[5,'5¢'],[1,'1¢']];return values.map(([value,label])=>{const count=Math.floor(rest/value);rest%=value;return{label,count};}).filter(coin=>coin.count>0);}
  function solutionText(){const es=isSpanish(),change=lab.payment-lab.total,coins=coinBreakdown(change),breakdown=coins.length?coins.map(coin=>`${coin.count} × ${coin.label}`).join(es?' + ':' + '):(es?'sin cambio':'exact payment');return es?`Pagas ${money(lab.payment)} − ${money(lab.total)} = <strong>${money(change)}</strong>. Puedes contar el cambio con monedas: ${breakdown}.`:`Payment ${money(lab.payment)} − total ${money(lab.total)} = <strong>${money(change)}</strong>. One way to make that change is: ${breakdown}.`;}
  function renderMoneyLab(){
    const es=isSpanish(),level=difficulty();pageTitle.textContent=es?'Laboratorio de dinero y cambio':'Money & change lab';
    const basket=lab.basket.map(line=>`<div class="money-item"><span class="money-item-icon" aria-hidden="true">${line.item.icon}</span><span class="money-item-name">${line.item[es?'es':'en']}${line.quantity>1?` × ${line.quantity}`:''}</span><strong>${money(line.total)}</strong></div>`).join('');
    content.innerHTML=`<div class="page-wrap money-lab-page"><div class="hero-row"><div><span class="eyebrow">${es?'PRACTICA EN LA TIENDA':'SHOPPING MATH'}</span><h1>${es?'Laboratorio de dinero y cambio':'Money & change lab'}</h1><p>${es?'Suma una compra, paga y calcula cuánto cambio debes recibir.':'Add up a purchase, pay, and figure out how much change you should get back.'}</p></div><div class="money-lab-score"><strong>${lab.score}</strong><span>${es?'compras resueltas':'checkout challenges solved'}</span></div></div><div class="money-lab-workspace"><section class="card money-receipt"><div class="money-receipt-heading"><span>${es?'TIENDA NUMORA':'NUMORA MARKET'}</span><strong>${es?'RECIBO':'RECEIPT'}</strong></div><div class="money-items">${basket}</div><div class="money-total-row"><span>${es?'Total':'Total'}</span><strong>${money(lab.total)}</strong></div></section><section class="card money-checkout"><div class="money-checkout-icon" aria-hidden="true">💵</div><span class="report-kicker">${es?'PAGO':'PAYMENT'}</span><h2>${es?'Pagas':'You pay'} ${money(lab.payment)}</h2><p>${es?'¿Cuánto cambio debes recibir?':'How much change should you get back?'}</p><label for="money-change-answer">${es?'Tu cambio':'Your change'}</label><div class="money-answer-row"><span aria-hidden="true">$</span><input id="money-change-answer" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0.00" aria-label="${es?'Cantidad de cambio':'Change amount'}" ${lab.solved?'disabled':''}></div><button type="button" class="primary-btn money-check-btn" data-money-action="check" ${lab.solved?'disabled':''}>${es?'Comprobar cambio':'Check change'}</button><p class="money-lab-feedback" aria-live="polite">${lab.feedback}</p></section></div><section class="card money-lesson-note"><div><span class="report-kicker">${es?'PISTA DE DINERO':'MONEY TIP'}</span><h2>${es?'Calcula por partes':'Work it out in steps'}</h2><p>${level.early?(es?'Cuenta hacia adelante desde el total hasta la cantidad que pagaste.':'Count up from the total until you reach the amount you paid.'):(es?'Resta el total de la cantidad pagada. Luego comprueba el cambio sumando monedas.':'Subtract the total from the payment. Then check your change by adding coins.')}</p></div><div class="money-lab-actions"><button type="button" class="secondary-btn" data-money-action="steps">${es?'Mostrar solución':'Show solution'}</button><button type="button" class="primary-btn" data-money-action="new">${es?'Nueva compra':'New basket'} →</button></div><div class="money-lab-solution ${lab.showSteps?'':'hidden'}"><strong>${es?'Solución':'Worked solution'}</strong><p data-money-solution>${solutionText()}</p></div></section></div>`;
  }
  document.addEventListener('click',event=>{
    if(!(event.target instanceof Element))return;
    const nav=event.target.closest('[data-view="money-lab"]'),action=event.target.closest('[data-money-action]');
    if(nav){event.preventDefault();event.stopImmediatePropagation();createBasket();renderMoneyLab();document.querySelectorAll('.nav-item').forEach(item=>item.classList.toggle('active',item===nav));return;}
    if(!action)return;event.preventDefault();event.stopImmediatePropagation();const es=isSpanish();
    if(action.dataset.moneyAction==='new'){createBasket();renderMoneyLab();return;}
    if(action.dataset.moneyAction==='steps'){lab.showSteps=!lab.showSteps;renderMoneyLab();return;}
    if(lab.solved)return;const input=content.querySelector('#money-change-answer');if(!input)return;
    if(!input.value.trim()){lab.feedback=es?'Escribe cuánto cambio recibirías.':'Enter the change amount first.';renderMoneyLab();return;}
    const cents=Math.round(Number(input.value)*100),expected=lab.payment-lab.total;
    if(Number.isFinite(cents)&&cents===expected){lab.solved=true;lab.feedback=es?'¡Correcto! Ganaste 10 XP.':'Correct! You earned 10 XP.';setXpBalance(getXpBalance()+10);showToast(es?'¡Muy bien! +10 XP':'Nice work! +10 XP');}
    else lab.feedback=es?'No exactamente. Resta el total de lo que pagaste y vuelve a intentarlo.':'Not quite. Subtract the total from the payment and try again.';
    renderMoneyLab();
  },true);
  document.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target instanceof Element&&event.target.id==='money-change-answer')content.querySelector('[data-money-action="check"]')?.click();});
  createBasket();
})();
