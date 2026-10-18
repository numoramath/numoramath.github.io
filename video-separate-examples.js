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
  let workedExample=questionSource(grade,lesson,currentQuestion+11);
  for(let offset=12;workedExample.prompt===activePrompt&&offset<20;offset++)workedExample=questionSource(grade,lesson,currentQuestion+offset);
  const explanation=workedExample.explanation.replace(/<[^>]*>/g,'');
  const titleText='Watch: '+lesson;
  const markup='<span>Worked '+grade+' example: '+workedExample.prompt+'</span><span>'+explanation+'</span><span><b>Example answer: '+workedExample.answer+'</b></span>';
  if(title.textContent!==titleText)title.textContent=titleText;
  if(example.innerHTML!==markup)example.innerHTML=markup;
  video.dataset.gradeLessonVideo=grade+'|'+lesson+'|'+currentQuestion;
}

const gradeLessonVideoObserver=new MutationObserver(syncGradeLessonVideo);
gradeLessonVideoObserver.observe(document.body,{childList:true,subtree:true,characterData:true});
setInterval(syncGradeLessonVideo,150);
