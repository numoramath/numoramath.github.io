function syncGradeLessonVideo(){
  const video=document.querySelector('.lesson-video');
  const title=document.querySelector('.lesson-video .video-copy strong');
  const example=document.querySelector('.lesson-video .video-example');
  const lesson=window.currentActiveLesson||'';
  const questionSource=window.gradeLessonQuestion||window.gradeLevelContent;
  if(!video||!title||!example||!lesson||!questionSource)return;
  const grade=localStorage.getItem('numoraGrade')||'Pre-K';
  const currentQuestion=Number(window.currentLessonQuestionCount||0);
  const activePrompt=document.querySelector('.question-card h1')?.textContent||'';
  const stateKey=grade+'|'+lesson+'|'+currentQuestion+'|'+activePrompt;
  if(video.dataset.gradeLessonVideo===stateKey)return;
  const isLongDivision=lesson.toLowerCase().includes('long division');
  const currentExample=isLongDivision?window.makeThreeDigitDivisionQuestion():questionSource(grade,lesson,currentQuestion);
  let workedExample=isLongDivision?window.makeThreeDigitDivisionQuestion():questionSource(grade,lesson,currentQuestion+11);
  for(let offset=12;!isLongDivision&&offset<52&&(workedExample.prompt===activePrompt||Number(workedExample.answer)===Number(currentExample.answer));offset++)workedExample=questionSource(grade,lesson,currentQuestion+offset);
  const explanation=workedExample.explanation.replace(/<[^>]*>/g,'');
  const titleText='Watch: '+grade+' · '+lesson;
  const markup='<span>'+(isLongDivision?'Three-digit long division: ':'Worked '+grade+' example: ')+workedExample.prompt+'</span><span>'+explanation+'</span><span><b>Example answer: '+workedExample.answer+'</b></span>';
  if(title.textContent!==titleText)title.textContent=titleText;
  if(example.innerHTML!==markup)example.innerHTML=markup;
  video.dataset.gradeLessonVideo=stateKey;
}

const gradeLessonVideoObserver=new MutationObserver(syncGradeLessonVideo);
gradeLessonVideoObserver.observe(document.body,{childList:true,subtree:true,characterData:true});
setInterval(syncGradeLessonVideo,150);
