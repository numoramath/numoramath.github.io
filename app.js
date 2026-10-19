const content = document.querySelector('#app-content');
const pageTitle = document.querySelector('#page-title');
const toast = document.querySelector('#toast');
let currentQuestion = null;
let activeLesson = '';
let activeLessonIndex = 0;
let lessonQuestionCount = 0;
let completed = Number(localStorage.getItem('numoraCompleted') || 0);
let streak = Number(localStorage.getItem('numoraStreak') || 0);
let accuracyAttempts=Number(localStorage.getItem('numoraAccuracyAttempts')||0);
let accuracyCorrect=Number(localStorage.getItem('numoraAccuracyCorrect')||0);
let userName = localStorage.getItem('numoraUser') || 'Guest';
let selectedGrade = localStorage.getItem('numoraGrade') || 'Pre-K';
let freshStart = localStorage.getItem('numoraFreshStart') === 'true';
let badgeProgress=(()=>{try{return JSON.parse(localStorage.getItem('numoraBadgeProgress')||'{"earned":[],"practiceDays":[],"practicedLessons":[],"finishedLessons":[]}');}catch{return{earned:[],practiceDays:[],practicedLessons:[],finishedLessons:[]};}})();
const badgeDefinitions=[
  ['first-answer','✨','First Answer','Get your first question right.'],['quick-starter','🚀','Quick Starter','Finish your first lesson.'],['sharp-shooter','🎯','Sharp Shooter','Get 10 questions right.'],['keep-growing','🌱','Keep Growing','Practice 3 different lessons.'],['lesson-legend','🏆','Lesson Legend','Finish 10 different lessons.'],['first-streak','🔥','First Streak','Practice 3 days in a row.'],
  ['questions-25','🧠','Brain Builder','Get 25 questions right.'],['questions-50','💡','Bright Idea','Get 50 questions right.'],['questions-100','💯','Century Solver','Get 100 questions right.'],['questions-250','⚡','Quick Thinker','Get 250 questions right.'],['questions-500','🌟','Math Star','Get 500 questions right.'],
  ['finish-five','📚','Lesson Learner','Finish 5 lessons.'],['finish-25','🎓','Lesson Pro','Finish 25 lessons.'],['finish-50','👑','Lesson Champion','Finish 50 lessons.'],
  ['practice-day-one','☀️','Showed Up','Practice on your first day.'],['streak-seven','🗓️','Week of Wins','Practice 7 days in a row.'],['streak-fourteen','🌈','Two-Week Trail','Practice 14 days in a row.'],['big-momentum','🔥','Big Momentum','Practice 30 days in a row.'],['practice-days-60','🌻','Steady Learner','Practice on 60 different days.'],['practice-days-100','💎','Dedicated Learner','Practice on 100 different days.'],
  ['practice-five-skills','🧩','Skill Collector','Try 5 different lessons.'],['practice-25-skills','🗺️','Skill Explorer','Try 25 different lessons.'],['daily-five','🏁','Daily Goal','Answer 5 questions correctly in one day.'],['daily-ten','🎉','Double Digits','Answer 10 questions correctly in one day.'],['monthly-25','🌙','Monthly Momentum','Answer 25 questions correctly in one month.'],
  ['explore-two-grades','🪜','Level Hopper','Practice in 2 different grades.'],['explore-five-grades','🧭','Grade Explorer','Practice in 5 different grades.'],['explore-ten-grades','🌍','Math Traveler','Practice in 10 different grades.'],['finish-two-grades','🏅','Across Levels','Finish a lesson in 2 different grades.'],['finish-five-grades','🏵️','All-Round Learner','Finish a lesson in 5 different grades.']
];
const questionBadgeIcons=['🧮','✨','💡','🚀','🎯','🌟'];
const lessonBadgeIcons=['📘','📚','🏅','🎓','🏆'];
const dayBadgeIcons=['🌱','☀️','🌻','🌈','💎'];
const streakBadgeIcons=['🔥','⚡','🌠','🦉','👑'];
for(let goal=20;goal<=1000;goal+=10){if([30,50,100,250,500].includes(goal))continue;badgeDefinitions.push([`questions-${goal}`,questionBadgeIcons[(goal/10)%questionBadgeIcons.length],`Question Quest ${goal}`,`Answer ${goal} questions correctly.`]);}
for(let goal=2;goal<=100;goal+=2){if([10,50].includes(goal))continue;badgeDefinitions.push([`lessons-${goal}`,lessonBadgeIcons[(goal/2)%lessonBadgeIcons.length],`Lesson Milestone ${goal}`,`Finish ${goal} different lessons.`]);}
for(let goal=2;goal<=100;goal+=2){if([60,100].includes(goal))continue;badgeDefinitions.push([`practice-days-${goal}`,dayBadgeIcons[(goal/2)%dayBadgeIcons.length],`Practice Pal ${goal}`,`Practice on ${goal} different days.`]);}
for(let goal=5;goal<=100;goal+=5){if(goal===30)continue;badgeDefinitions.push([`streak-${goal}`,streakBadgeIcons[(goal/5)%streakBadgeIcons.length],`Streak Star ${goal}`,`Practice ${goal} days in a row.`]);}
const completedQuestionMilestones=[5,15,75,150,300,750,1500,2500,4000,7500,10000,15000];
completedQuestionMilestones.forEach((goal,index)=>badgeDefinitions.push([`complete-questions-${goal}`,questionBadgeIcons[index%questionBadgeIcons.length],`Question Finisher ${goal}`,`Complete ${goal} questions by answering them correctly.`]));
const extendedQuestionMilestones=Array.from({length:303},(_,index)=>16+index).filter(goal=>![75,150,300].includes(goal)).slice(0,300);
extendedQuestionMilestones.forEach((goal,index)=>badgeDefinitions.push([`complete-questions-${goal}`,questionBadgeIcons[index%questionBadgeIcons.length],`Question Finisher ${goal.toLocaleString()}`,`Complete ${goal.toLocaleString()} questions by answering them correctly.`]));
function readNumoraAccounts(){try{const saved=JSON.parse(localStorage.getItem('numoraAccounts')||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))return saved;}catch{}return{};}
function saveNumoraAccount(email,account){const accounts=readNumoraAccounts();accounts[String(email||'').trim().toLowerCase()]=account;localStorage.setItem('numoraAccounts',JSON.stringify(accounts));}
function findNumoraAccount(email){const normalized=String(email||'').trim().toLowerCase();const accounts=readNumoraAccounts();if(accounts[normalized])return accounts[normalized];const match=Object.keys(accounts).find(key=>key.toLowerCase()===normalized);if(match){accounts[normalized]=accounts[match];delete accounts[match];localStorage.setItem('numoraAccounts',JSON.stringify(accounts));return accounts[normalized];}const legacyEmail=localStorage.getItem('numoraEmail');if(legacyEmail&&legacyEmail.trim().toLowerCase()===normalized){const legacy={username:localStorage.getItem('numoraUser')||normalized.split('@')[0]||'Learner',password:localStorage.getItem('numoraPassword')||'',progress:Object.fromEntries(numoraProgressKeys().map(key=>[key,localStorage.getItem(key)]))};saveNumoraAccount(normalized,legacy);return legacy;}return null;}
function localDateKey(date=new Date()){const year=date.getFullYear(),month=String(date.getMonth()+1).padStart(2,'0'),day=String(date.getDate()).padStart(2,'0');return `${year}-${month}-${day}`;}
function calculateCurrentStreak(days=[]){const sorted=[...new Set(days)].sort();if(!sorted.length)return 0;const today=Date.parse(new Date().toISOString().slice(0,10)+'T00:00:00Z');const latest=Date.parse(sorted[sorted.length-1]+'T00:00:00Z');if(!Number.isFinite(latest)||today-latest>86400000||latest>today)return 0;let run=1;for(let i=sorted.length-1;i>0;i--){const current=Date.parse(sorted[i]+'T00:00:00Z'),previous=Date.parse(sorted[i-1]+'T00:00:00Z');if(current-previous!==86400000)break;run++;}return run;}
function accountJoinDateLabel(){const email=localStorage.getItem('numoraActiveEmail');if(!email)return 'Welcome to Numora';const account=findNumoraAccount(email);if(!account)return 'Welcome to Numora';if(!account.joinedAt){let firstPractice='';try{const saved=JSON.parse(account.progress?.numoraBadgeProgress||'{}');firstPractice=(saved.practiceDays||[]).slice().sort()[0]||'';}catch{}account.joinedAt=firstPractice||localDateKey();saveNumoraAccount(email,account);}const [year,month,day]=account.joinedAt.split('-').map(Number);const date=new Date(year,month-1,day);return `Joined ${date.toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'})}`;}
function isNumoraProgressKey(key){return /^(numoraGrade$|numoraFreshStart$|numoraCompleted$|numoraStreak$|numoraAccuracyAttempts$|numoraAccuracyCorrect$|numoraTodayDate$|numoraTodayCompleted$|numoraMonthKey$|numoraMonthCompleted$|numoraBadgeProgress$|numoraLessonIndex_|numoraPausedLesson_)/.test(key);}
function numoraProgressKeys(){return Object.keys(localStorage).filter(isNumoraProgressKey);}
function saveCurrentAccountProgress(){const email=localStorage.getItem('numoraActiveEmail');if(!email||!localStorage.getItem('numoraUser'))return;const account=findNumoraAccount(email);if(!account)return;account.progress={};numoraProgressKeys().forEach(key=>account.progress[key]=localStorage.getItem(key));saveNumoraAccount(email,account);}
function startFreshAccount(){numoraProgressKeys().forEach(key=>localStorage.removeItem(key));selectedGrade='Pre-K';freshStart=true;completed=0;streak=0;accuracyAttempts=0;accuracyCorrect=0;todayCompleted=0;monthCompleted=0;lessonQuestionCount=0;activeLesson='';activeLessonIndex=0;badgeProgress={earned:[],practiceDays:[],practicedLessons:[],finishedLessons:[]};localStorage.setItem('numoraGrade',selectedGrade);localStorage.setItem('numoraFreshStart','true');localStorage.setItem('numoraCompleted','0');localStorage.setItem('numoraStreak','0');localStorage.setItem('numoraAccuracyAttempts','0');localStorage.setItem('numoraAccuracyCorrect','0');localStorage.setItem('numoraTodayDate',todayKey);localStorage.setItem('numoraTodayCompleted','0');localStorage.setItem('numoraMonthKey',monthKey);localStorage.setItem('numoraMonthCompleted','0');saveBadgeProgress();if(typeof syncProfile==='function')syncProfile();if(typeof syncDailySummary==='function')syncDailySummary();}
function restoreAccountProgress(email,account){numoraProgressKeys().forEach(key=>localStorage.removeItem(key));const saved=account?.progress;if(saved&&typeof saved==='object')Object.entries(saved).forEach(([key,value])=>{if(typeof value==='string'&&isNumoraProgressKey(key))localStorage.setItem(key,value);});localStorage.setItem('numoraActiveEmail',email);selectedGrade=localStorage.getItem('numoraGrade')||'Pre-K';freshStart=localStorage.getItem('numoraFreshStart')==='true';completed=Number(localStorage.getItem('numoraCompleted')||0);accuracyAttempts=Number(localStorage.getItem('numoraAccuracyAttempts')||0);accuracyCorrect=Number(localStorage.getItem('numoraAccuracyCorrect')||0);todayCompleted=localStorage.getItem('numoraTodayDate')===todayKey?Number(localStorage.getItem('numoraTodayCompleted')||0):0;monthCompleted=localStorage.getItem('numoraMonthKey')===monthKey?Number(localStorage.getItem('numoraMonthCompleted')||0):0;if(localStorage.getItem('numoraTodayDate')!==todayKey){localStorage.setItem('numoraTodayDate',todayKey);localStorage.setItem('numoraTodayCompleted','0');}if(localStorage.getItem('numoraMonthKey')!==monthKey){localStorage.setItem('numoraMonthKey',monthKey);localStorage.setItem('numoraMonthCompleted','0');}try{badgeProgress=JSON.parse(localStorage.getItem('numoraBadgeProgress')||'{"earned":[],"practiceDays":[],"practicedLessons":[],"finishedLessons":[]}');}catch{badgeProgress={earned:[],practiceDays:[],practicedLessons:[],finishedLessons:[]};}streak=calculateCurrentStreak(badgeProgress.practiceDays||[]);localStorage.setItem('numoraStreak',String(streak));}
if(!localStorage.getItem('numoraActiveEmail')&&localStorage.getItem('numoraUser')&&localStorage.getItem('numoraEmail')){const legacyEmail=localStorage.getItem('numoraEmail');saveNumoraAccount(legacyEmail,{username:localStorage.getItem('numoraUser'),password:localStorage.getItem('numoraPassword')||'',progress:Object.fromEntries(numoraProgressKeys().map(key=>[key,localStorage.getItem(key)]))});localStorage.setItem('numoraActiveEmail',legacyEmail);}
if(localStorage.getItem('numoraActiveEmail')){const activeEmail=localStorage.getItem('numoraActiveEmail').trim().toLowerCase();const activeAccount=findNumoraAccount(activeEmail);if(activeAccount){localStorage.setItem('numoraActiveEmail',activeEmail);localStorage.setItem('numoraEmail',activeEmail);userName=activeAccount.username||activeEmail.split('@')[0]||'Learner';localStorage.setItem('numoraUser',userName);}}
const todayKey=new Date().toISOString().slice(0,10);
let todayCompleted=localStorage.getItem('numoraTodayDate')===todayKey?Number(localStorage.getItem('numoraTodayCompleted')||0):0;
const monthKey=new Date().toISOString().slice(0,7);
let monthCompleted=localStorage.getItem('numoraMonthKey')===monthKey?Number(localStorage.getItem('numoraMonthCompleted')||0):0;
if(localStorage.getItem('numoraTodayDate')!==todayKey){localStorage.setItem('numoraTodayDate',todayKey);localStorage.setItem('numoraTodayCompleted','0');}
if(localStorage.getItem('numoraMonthKey')!==monthKey){localStorage.setItem('numoraMonthKey',monthKey);localStorage.setItem('numoraMonthCompleted','0');}
if(localStorage.getItem('numoraProgressResetV2') !== 'true'){selectedGrade='Pre-K';freshStart=true;completed=0;streak=0;todayCompleted=0;localStorage.setItem('numoraGrade','Pre-K');localStorage.setItem('numoraFreshStart','true');localStorage.setItem('numoraCompleted','0');localStorage.setItem('numoraStreak','0');localStorage.setItem('numoraTodayCompleted','0');localStorage.setItem('numoraProgressResetV2','true');}
if(localStorage.getItem('numoraGradeLevelV3') !== 'true'){selectedGrade='Pre-K';localStorage.setItem('numoraGrade','Pre-K');localStorage.setItem('numoraGradeLevelV3','true');}
streak=calculateCurrentStreak(badgeProgress.practiceDays||[]);localStorage.setItem('numoraStreak',String(streak));
function firstName(){return userName.trim() || 'Learner';}
function syncProfile(){const profileName=document.querySelector('.profile-chip strong');const profileGrade=document.querySelector('#profile-grade');const initials=(userName.trim().slice(0,2)||'NU').toUpperCase();if(profileName)profileName.textContent=userName;if(profileGrade)profileGrade.textContent=selectedGrade+' Explorer';document.querySelectorAll('.mini-avatar,.avatar').forEach(avatar=>avatar.textContent=initials);const badgeCount=document.querySelector('.badge-count');if(badgeCount)badgeCount.textContent=String(badgeProgress.earned.length);const streakCount=document.querySelector('#streak-count');if(streakCount)streakCount.textContent=String(streak);const goalCount=document.querySelector('.nav-item[data-view="goals"] em');if(goalCount)goalCount.textContent=Math.min(todayCompleted,5)+'/5';const tip=document.querySelector('.tip-card small');if(tip)tip.textContent=Math.max(0,5-todayCompleted)+' more questions today';}
function saveBadgeProgress(){localStorage.setItem('numoraBadgeProgress',JSON.stringify(badgeProgress));}
function showBadgeNotice(name,icon){showToast(`${icon} Badge earned: ${name}!`);}
function awardBadge(id){if((badgeProgress.earned||[]).includes(id))return;badgeProgress.earned=[...(badgeProgress.earned||[]),id];saveBadgeProgress();const badge=badgeDefinitions.find(item=>item[0]===id);if(badge){showBadgeNotice(badge[2],badge[1]);const count=document.querySelector('.badge-count');if(count)count.textContent=String(badgeProgress.earned.length);}}
function updateBadgeProgress(lesson,isLessonFinished=false){
  const day=new Date().toISOString().slice(0,10);
  badgeProgress.practiceDays=[...new Set([...(badgeProgress.practiceDays||[]),day])].sort();
  const lessonKey=selectedGrade+'|'+lesson;
  badgeProgress.practicedLessons=[...new Set([...(badgeProgress.practicedLessons||[]),lessonKey])];
  if(isLessonFinished)badgeProgress.finishedLessons=[...new Set([...(badgeProgress.finishedLessons||[]),lessonKey])];
  badgeProgress.gradesPracticed=[...new Set([...(badgeProgress.gradesPracticed||[]),selectedGrade])];
  if(isLessonFinished)badgeProgress.gradesFinished=[...new Set([...(badgeProgress.gradesFinished||[]),selectedGrade])];
  saveBadgeProgress();
  const days=badgeProgress.practiceDays;
  let run=0,maxRun=0,priorDate=null;
  days.forEach(value=>{const date=new Date(value+'T00:00:00Z');run=priorDate&&date-priorDate===86400000?run+1:1;maxRun=Math.max(maxRun,run);priorDate=date;});
  streak=calculateCurrentStreak(days);localStorage.setItem('numoraStreak',String(streak));if(typeof syncProfile==='function')syncProfile();
  if(maxRun>=3)awardBadge('first-streak');
  if(maxRun>=7)awardBadge('streak-seven');
  if(maxRun>=14)awardBadge('streak-fourteen');
  if(maxRun>=30)awardBadge('big-momentum');
  const correct=Number(localStorage.getItem('numoraCompleted')||0);
  if(correct>=1)awardBadge('first-answer');
  if(correct>=10)awardBadge('sharp-shooter');
  if(correct>=25)awardBadge('questions-25');
  if(correct>=50)awardBadge('questions-50');
  if(correct>=100)awardBadge('questions-100');
  if(correct>=250)awardBadge('questions-250');
  if(correct>=500)awardBadge('questions-500');
  for(let goal=20;goal<=1000;goal+=10){if(![30,50,100,250,500].includes(goal)&&correct>=goal)awardBadge(`questions-${goal}`);}
  completedQuestionMilestones.forEach(goal=>{if(correct>=goal)awardBadge(`complete-questions-${goal}`);});
  extendedQuestionMilestones.forEach(goal=>{if(correct>=goal)awardBadge(`complete-questions-${goal}`);});
  if(badgeProgress.practicedLessons.length>=3)awardBadge('keep-growing');
  if(badgeProgress.practicedLessons.length>=5)awardBadge('practice-five-skills');
  if(badgeProgress.practicedLessons.length>=25)awardBadge('practice-25-skills');
  if(badgeProgress.practiceDays.length>=1)awardBadge('practice-day-one');
  if(badgeProgress.practiceDays.length>=60)awardBadge('practice-days-60');
  if(badgeProgress.practiceDays.length>=100)awardBadge('practice-days-100');
  for(let goal=2;goal<=100;goal+=2){if(![60,100].includes(goal)&&badgeProgress.practiceDays.length>=goal)awardBadge(`practice-days-${goal}`);}
  for(let goal=5;goal<=100;goal+=5){if(goal!==30&&maxRun>=goal)awardBadge(`streak-${goal}`);}
  if(isLessonFinished&&badgeProgress.finishedLessons.length>=1)awardBadge('quick-starter');
  if(badgeProgress.finishedLessons.length>=10)awardBadge('lesson-legend');
  if(badgeProgress.finishedLessons.length>=5)awardBadge('finish-five');
  if(badgeProgress.finishedLessons.length>=25)awardBadge('finish-25');
  if(badgeProgress.finishedLessons.length>=50)awardBadge('finish-50');
  for(let goal=2;goal<=100;goal+=2){if(![10,50].includes(goal)&&badgeProgress.finishedLessons.length>=goal)awardBadge(`lessons-${goal}`);}
  if(todayCompleted>=5)awardBadge('daily-five');
  if(todayCompleted>=10)awardBadge('daily-ten');
  if(monthCompleted>=25)awardBadge('monthly-25');
  if(badgeProgress.gradesPracticed.length>=2)awardBadge('explore-two-grades');
  if(badgeProgress.gradesPracticed.length>=5)awardBadge('explore-five-grades');
  if(badgeProgress.gradesPracticed.length>=10)awardBadge('explore-ten-grades');
  if(badgeProgress.gradesFinished.length>=2)awardBadge('finish-two-grades');
  if(badgeProgress.gradesFinished.length>=5)awardBadge('finish-five-grades');
}

const skills = [
  {icon:'⊕', title:'Add & subtract decimals', desc:'Place value · 6 questions', progress:68, color:'var(--mint)', level:'In progress'},
  {icon:'▦', title:'Ratios & rates', desc:'Unit rates · 8 questions', progress:42, color:'var(--orange)', level:'Keep going'},
  {icon:'◒', title:'Area of triangles', desc:'Geometry · 10 questions', progress:85, color:'var(--violet)', level:'Almost there'},
  {icon:'ⅹ', title:'Multiply fractions', desc:'Fractions · 7 questions', progress:25, color:'var(--orange)', level:'New skill'},
  {icon:'∠', title:'Coordinate plane', desc:'Graphing · 6 questions', progress:54, color:'var(--mint)', level:'In progress'},
  {icon:'≈', title:'Percent problems', desc:'Percents · 8 questions', progress:12, color:'var(--orange)', level:'New skill'},
  {icon:'◇', title:'Patterns and sequences', desc:'Patterns · 6 questions', progress:0, color:'var(--violet)', level:'New skill'},
  {icon:'∑', title:'Problem solving', desc:'Word problems · 8 questions', progress:0, color:'var(--mint)', level:'New skill'},
  {icon:'⌁', title:'Measurement', desc:'Measurement · 7 questions', progress:0, color:'var(--orange)', level:'New skill'},
  {icon:'▤', title:'Data and graphs', desc:'Data · 6 questions', progress:0, color:'var(--violet)', level:'New skill'}
];
const gradeLessonCounts={'Pre-K':18,'Kindergarten':24,'Grade 1':32,'Grade 2':36,'Grade 3':42,'Grade 4':48,'Grade 5':54,'Grade 6':60,'Grade 7':66,'Grade 8':72,'Grade 9':78,'Grade 10':84,'Grade 11':90,'Grade 12':96,'College':120};
const gradeSkillNames={'Pre-K':['Counting to 10','Shapes around us','Big and small','Patterns everywhere','More or less','Sorting objects'],'Kindergarten':['Count to 100','Addition within 10','2D and 3D shapes','Compare numbers','Measurement basics','Number patterns'],'Grade 1':['Add within 20','Place value','Telling time','Shapes and fractions','Length measurement','Word problems'],'Grade 2':['Add and subtract within 100','Skip-counting','Money math','Time to the minute','Two-step word problems','Picture graphs'],'Grade 3':['Multiplication facts','Division basics','Fractions on a number line','Area and perimeter','Elapsed time','Bar graphs'],'Grade 4':['Multi-digit multiplication','Equivalent fractions','Angles and lines','Decimals to hundredths','Factors and multiples','Data and graphs'],'Grade 5':['Operations with fractions','Volume','Coordinate plane','Place value with decimals','Expressions','Classify shapes'],'Grade 6':['Add & subtract decimals','Ratios & rates','Area of triangles','Multiply fractions','Coordinate plane','Percent problems'],'Grade 7':['Proportional relationships','Rational numbers','Scale drawings','Probability','Expressions and equations','Circle geometry'],'Grade 8':['Linear equations','Pythagorean theorem','Functions','Transformations','Scatter plots','Systems of equations'],'Grade 9':['Real numbers','Exponents','Linear functions','Congruence and similarity','Statistics','Quadratic patterns'],'Grade 10':['Quadratic equations','Polynomials','Right triangle trigonometry','Geometric proofs','Conditional probability','Sequences'],'Grade 11':['Logarithms','Complex numbers','Trigonometric functions','Conic sections','Limits','Data analysis'],'Grade 12':['Derivatives','Integrals','Vectors','Advanced probability','Modeling with functions','Financial math'],'College':['Calculus foundations','Functions & graphs','Statistics','Linear algebra','Discrete mathematics','Applied modeling']};
const extraGradeLessons={'Pre-K':['Colors and sorting','Counting objects','Simple patterns','Shapes and positions'],'Kindergarten':['Number bonds','Compare lengths','Picture graphs','Addition stories'],'Grade 1':['Subtraction within 20','Number lines','Money and coins','Data and charts'],'Grade 2':['Place value to 1,000','Odd and even numbers','Fractions of shapes','Line plots'],'Grade 3':['Multi-digit addition','Equivalent fractions','Perimeter','Area models'],'Grade 4':['Long division','Mixed numbers','Symmetry','Line plots'],'Grade 5':['Decimal operations','Order of operations','Classify triangles','Volume models'],'Grade 6':['Integer operations','Expressions','Statistics','Surface area'],'Grade 7':['Percent change','Inequalities','Angles','Sampling'],'Grade 8':['Systems of equations','Exponents','Volume and cones','Two-way tables'],'Grade 9':['Inequalities','Polynomials','Similarity','Data displays'],'Grade 10':['Functions','Rational expressions','Trigonometry','Probability models'],'Grade 11':['Sequences and series','Matrices','Vectors','Inference'],'Grade 12':['Limits','Optimization','Parametric equations','Expected value'],'College':['Integral applications','Differential equations','Proofs','Regression models']};Object.keys(extraGradeLessons).forEach(grade=>{gradeSkillNames[grade]=[...(gradeSkillNames[grade]||[]),...extraGradeLessons[grade]];});
function librarySkills(){const names=gradeSkillNames[selectedGrade]||gradeSkillNames['Grade 6'];const finished=new Set(badgeProgress.finishedLessons||[]);return skills.map((skill,index)=>{const title=names[index]||'Math practice';return{...skill,title,desc:`${selectedGrade} · 10 questions`,finished:finished.has(selectedGrade+'|'+title)};});}
function lessonIndexKey(){return 'numoraLessonIndex_'+selectedGrade;}
function savedLessonIndex(){return Number(localStorage.getItem(lessonIndexKey())||0);}
function pausedLessonKey(){return 'numoraPausedLesson_'+selectedGrade;}
function savedPausedLesson(){try{return JSON.parse(localStorage.getItem(pausedLessonKey())||'null');}catch{return null;}}
function savePausedLesson(){if(activeLesson)localStorage.setItem(pausedLessonKey(),JSON.stringify({lesson:activeLesson,index:activeLessonIndex,question:lessonQuestionCount}));}
function clearPausedLesson(){localStorage.removeItem(pausedLessonKey());}
function resumeLessonName(){const names=gradeSkillNames[selectedGrade]||gradeSkillNames['Grade 6'];const paused=savedPausedLesson();return paused&&names.includes(paused.lesson)?paused.lesson:names[Math.min(savedLessonIndex(),names.length-1)];}
function showLessonComplete(){lessonQuestionCount=10;window.currentLessonQuestionCount=10;updateBadgeProgress(activeLesson,true);const names=gradeSkillNames[selectedGrade]||gradeSkillNames['Grade 6'];const nextIndex=Math.min(activeLessonIndex+1,names.length-1);localStorage.setItem(lessonIndexKey(),String(nextIndex));clearPausedLesson();content.innerHTML=`<div class="page-wrap"><section class="card empty-state"><div style="font-size:50px">🎉</div><h2>Good job! You finished the lesson.</h2><p>You completed all 10 questions in <strong>${activeLesson}</strong>.</p>${activeLessonIndex<names.length-1?`<button class="primary-btn next-lesson-btn">Go to next lesson: ${names[nextIndex]} →</button>`:'<p>You finished every lesson in this level!</p>'}</section></div>`;}

function homeView(){
 pageTitle.textContent='Today';
 const fresh=freshStart;
 const names=gradeSkillNames[selectedGrade]||gradeSkillNames['Grade 6'];
 const lesson=fresh?names[0]:resumeLessonName();
 const paused=savedPausedLesson();
 const pausedCount=paused?.lesson===lesson?Math.min(10,Math.max(0,Number(paused.question)||0)):0;
 const progress=fresh?0:Math.round(pausedCount/10*100);
 const progressText=fresh?'Your first lesson is ready to go.':pausedCount>0?`Pick up where you left off · ${pausedCount} of 10 questions`:'Your next lesson is ready to go · 0 of 10 questions';
 content.innerHTML=`<div class="page-wrap"><div class="hero-row"><div><span class="eyebrow">${accountJoinDateLabel()}</span><h1>Good afternoon, ${firstName()} <span>✦</span></h1><p>${fresh?'Welcome to your first learning adventure.':'A little practice today makes a big difference tomorrow.'}</p></div><span class="date-label">${fresh?'Starting fresh':'Week 3 of 12'}</span></div><div class="dashboard-grid"><section class="card continue-card"><div class="card-head"><h3>${fresh?'Start learning':'Continue learning'}</h3><span class="dots">•••</span></div><span class="skill-tag">${selectedGrade.toUpperCase()} · MATH</span><h2>${lesson}</h2><p>${progressText}</p><div class="progress-line"><span style="width:${progress}%"></span></div><div class="continue-footer"><button class="primary-btn" data-practice="${lesson}">${fresh?'Start first lesson →':'Continue practice →'}</button><small>${progress}% complete</small></div></section><section class="card stats-card"><div class="card-head"><h3>Your snapshot</h3><span class="dots">•••</span></div><div class="stat"><div class="stat-icon purple">✦</div><div><strong>${fresh?'0%':'82%'}</strong><small>Average accuracy</small></div></div><div class="stat"><div class="stat-icon peach">⚡</div><div><strong>${fresh?'0':'7'} days</strong><small>Current streak</small></div></div><div class="stat"><div class="stat-icon green">✓</div><div><strong>${fresh?'0':todayCompleted}</strong><small>Questions today</small></div></div></section></div><div class="section-heading"><h2>${fresh?'Your first skills':'Recommended for you'}</h2><button class="text-link" data-view="skills">See all skills →</button></div><div class="skill-grid">${librarySkills().slice(0,3).map(skillCard).join('')}</div><div class="section-heading"><h2>Recent activity</h2><button class="text-link" data-view="reports">View progress →</button></div><section class="card activity-card"><div class="activity-row"><small>${fresh?'Not started':'Today, 3:42 PM'}</small><strong>${lesson}</strong><span class="good">${fresh?'Ready to begin':'92% correct'}</span></div><div class="activity-row"><small>${fresh?'Not started':'Yesterday'}</small><strong>${names[1]}</strong><span class="good">${fresh?'—':'84% correct'}</span></div><div class="activity-row"><small>${fresh?'Not started':'Mon, Sep 23'}</small><strong>${names[2]}</strong><span class="good">${fresh?'—':'76% correct'}</span></div></section></div>`;syncProfile();syncDailySummary();
}
function skillCard(s){const shownProgress=s.finished?100:freshStart?0:s.progress;const status=s.finished?'✓ Finished':freshStart?'Not started':s.level;return `<article class="skill-card ${s.finished?'skill-finished':''}" data-practice="lesson" data-lesson="${s.title}"><div class="skill-top"><span class="skill-icon">${s.finished?'✓':s.icon}</span><span class="level ${s.finished?'finished':''}">${status}</span></div><h3>${s.title}</h3><p>${s.finished?'You finished this lesson!':s.desc}</p><div class="tiny-progress"><span style="width:${shownProgress}%;background:${s.finished?'var(--mint)':s.color}"></span></div></article>`}
function skillsView(){pageTitle.textContent='Skill library';const lessonCount=gradeLessonCounts[selectedGrade]||24;content.innerHTML=`<div class="page-wrap"><div class="hero-row"><div><span class="eyebrow">${selectedGrade} Explorer</span><h1>Find your next win</h1><p>Explore ${lessonCount} lessons matched to your grade and goals.</p></div><button class="secondary-btn">${selectedGrade} ⌄</button></div><div class="section-heading"><h2>${selectedGrade} Math · ${lessonCount} lessons</h2><button class="text-link">Filter & sort ☷</button></div><div class="skill-grid">${librarySkills().map(skillCard).join('')}</div></div>`}
function badgeDifficulty(id){
  const fixed={ 'first-answer':1,'practice-day-one':2,'quick-starter':3,'daily-five':4.5,'sharp-shooter':5,'keep-growing':6.5,'practice-five-skills':7.5,'first-streak':8,'daily-ten':9,'monthly-25':18,'finish-two-grades':20,'finish-five-grades':32,'explore-two-grades':12,'explore-five-grades':22,'explore-ten-grades':36 };
  if(fixed[id]!==undefined)return fixed[id];
  if(id==='lesson-legend')return 20;
  if(id==='big-momentum')return 40;
  let match=id.match(/^(?:questions|complete-questions)-(\d+)$/);if(match)return 5+Number(match[1])*.1;
  match=id.match(/^(?:lessons|finish)-(\d+)$/);if(match)return 7+Number(match[1])*1.3;
  match=id.match(/^practice-(\d+)-skills$/);if(match)return 6+Number(match[1])*.8;
  match=id.match(/^practice-days-(\d+)$/);if(match)return 3+Number(match[1])*.8;
  match=id.match(/^streak-(\d+)$/);if(match)return 7+Number(match[1]);
  if(id==='streak-seven')return 14;if(id==='streak-fourteen')return 21;
  return 50;
}
function badgesView(){if(badgeProgress.earned.includes('questions-30')){badgeProgress.earned=badgeProgress.earned.filter(id=>id!=='questions-30');saveBadgeProgress();saveCurrentAccountProgress();const count=document.querySelector('.badge-count');if(count)count.textContent=String(badgeProgress.earned.length);}pageTitle.textContent='Badges';const earnedCount=badgeProgress.earned.length;const orderedBadges=[...badgeDefinitions].sort((a,b)=>badgeDifficulty(a[0])-badgeDifficulty(b[0])||a[2].localeCompare(b[2]));content.innerHTML=`<div class="page-wrap"><div class="hero-row"><div><span class="eyebrow">Your collection</span><h1>Celebrate every win</h1><p>Badges are ordered from easier goals to harder challenges.</p></div><div class="badge-total">✹ <strong>${earnedCount}</strong> of ${badgeDefinitions.length} earned</div></div><div class="badge-grid">${orderedBadges.map(([id,icon,name,description])=>{const earned=badgeProgress.earned.includes(id);return `<article class="badge-card ${earned?'earned':'locked'}"><div class="badge-icon">${icon}</div><h3>${name}</h3><p>${description}</p><span>${earned?'Earned':'Locked'}</span></article>`;}).join('')}</div></div>`}
function simpleView(type){const data={reports:['Progress','Small steps, visible growth.','Your learning journey','You’ve answered 148 questions this month. Keep going to reach your 200-question milestone.'],goals:['Daily goal','Build a habit that sticks.','Today’s goal','Complete 5 practice questions to keep your 7-day streak alive.'],badges:['Badges','Celebrate the milestones along the way.','Your collection','4 badges earned · 8 more to discover']}[type];pageTitle.textContent=data[0];content.innerHTML=`<div class="page-wrap"><div class="hero-row"><div><span class="eyebrow">${data[0]}</span><h1>${data[1]}</h1><p>${data[3]}</p></div></div><section class="card empty-state"><div style="font-size:50px">${type==='badges'?'✹':type==='goals'?'⚑':'◒'}</div><h2>${data[2]}</h2><p>${data[3]}</p><button class="primary-btn" data-practice="decimal">Start a practice set →</button></section></div>`}
function reportsView(){const monthName=new Date().toLocaleString(undefined,{month:'long'});const word=monthCompleted===1?'question':'questions';pageTitle.textContent='Progress';content.innerHTML=`<div class="page-wrap"><div class="hero-row"><div><span class="eyebrow">Monthly progress</span><h1>${monthName} learning progress</h1><p>Your monthly question total resets automatically when a new month begins.</p></div></div><section class="card empty-state"><div style="font-size:50px">◒</div><h2>${monthCompleted} ${word} completed this month</h2><p>Keep practicing to grow your total before the month ends.</p><button class="primary-btn" data-practice="${resumeLessonName()}">Continue practice →</button></section></div>`}
function practiceView(lessonOverride){const names=gradeSkillNames[selectedGrade]||gradeSkillNames['Grade 6'];const paused=savedPausedLesson();const pausedMatches=!lessonOverride||paused?.lesson===lessonOverride;let resumeComplete=false;if(pausedMatches&&paused&&names.includes(paused.lesson)){activeLessonIndex=Math.min(Math.max(0,Number(paused.index)||0),names.length-1);activeLesson=paused.lesson;const savedCount=Math.max(0,Number(paused.question)||0);resumeComplete=savedCount>=10;lessonQuestionCount=Math.min(9,savedCount);}else{activeLessonIndex=lessonOverride?Math.max(0,names.indexOf(lessonOverride)):Math.min(savedLessonIndex(),names.length-1);activeLesson=lessonOverride||names[activeLessonIndex];lessonQuestionCount=0;}window.currentActiveLesson=activeLesson;window.currentLessonQuestionCount=lessonQuestionCount;savePausedLesson();freshStart=false;localStorage.setItem('numoraFreshStart','false');pageTitle.textContent='Practice';if(resumeComplete){showLessonComplete();return;}renderLessonQuestion();}
function goToNextLesson(){const names=gradeSkillNames[selectedGrade]||gradeSkillNames['Grade 6'];if(activeLessonIndex<names.length-1){activeLessonIndex++;localStorage.setItem(lessonIndexKey(),String(activeLessonIndex));activeLesson=names[activeLessonIndex];window.currentActiveLesson=activeLesson;lessonQuestionCount=0;window.currentLessonQuestionCount=0;savePausedLesson();renderLessonQuestion();showToast('Next lesson: '+activeLesson);}else{clearPausedLesson();homeView();showToast('You completed every lesson in this level!');}}
window.practiceView=practiceView;
function newQuestion(){const lesson=(gradeSkillNames[selectedGrade]||gradeSkillNames['Grade 6'])[0];const isPreK=selectedGrade==='Pre-K';let a=isPreK?Math.floor(Math.random()*8)+1:Math.floor(Math.random()*7)+2;let b=isPreK?0:Math.floor(Math.random()*7)+1;currentQuestion={a,b,answer:isPreK?String(a+1):((a/10)+(b/10)).toFixed(1)};const prompt=isPreK?`What number comes after ${a}?`:`What is ${a/10} + ${b/10}?`;const explanation=isPreK?`Count forward one number: ${a}, then <b>${a+1}</b>.`:`Line up the decimal points, then add the tenths. ${a}/10 + ${b}/10 = ${(a+b)}/10, which is <b>${currentQuestion.answer}</b>.`;content.innerHTML=`<div class="practice-shell"><button class="back" data-view="home">← Back to my learning</button><div class="practice-meta"><span><b>${lesson.toUpperCase()}</b> · Practice</span><span>Question ${todayCompleted+1} of 10</span></div><div class="progress-line"><span style="width:${Math.min(92,todayCompleted*10+40)}%"></span></div><section class="question-card"><span class="skill-tag">${selectedGrade.toUpperCase()} WARM UP</span><h1>${prompt}</h1><input class="answer-input" inputmode="decimal" aria-label="Your answer" placeholder="Answer" autofocus /><div class="feedback"></div><div class="explain"><strong>Here’s the idea:</strong><br/>${explanation}</div><div class="practice-controls"><button class="secondary-btn explain-btn">Show explanation</button><button class="primary-btn check-btn">Check answer</button></div></section></div>`;bindPractice();}
function bindPractice(){const questionCard=document.querySelector('.question-card');const video=document.createElement('section');video.className='lesson-video';video.innerHTML='<div class="video-art"><span class="video-shape">＋</span><button class="video-play" aria-label="Play lesson video">▶</button></div><div class="video-copy"><strong>Watch: Adding decimals</strong><small>See a real example step by step · 2:14</small><div class="video-example">0.3 + 0.4 <b>= 0.7</b><em>3 tenths + 4 tenths = 7 tenths</em></div></div><span class="video-label">EXAMPLE LESSON</span>';questionCard.parentNode.insertBefore(video,questionCard);video.querySelector('.video-play').onclick=()=>{video.querySelector('.video-play').textContent='❚❚';video.classList.add('playing');showToast('Example video playing');};const tools=document.createElement('section');tools.className='tools-panel';tools.innerHTML='<div class="tools-title"><span>🧰 <strong>Tools</strong></span><small>Work it out here</small></div><div class="scratchpad"><div class="tool-label">Scratchpad</div><textarea placeholder="Write your steps here..."></textarea><small>Show your work before you submit.</small></div>';questionCard.parentNode.insertBefore(tools,questionCard);const input=document.querySelector('.answer-input'),feedback=document.querySelector('.feedback');input.readOnly=localStorage.getItem('numoraClickToTypeAnswer')==='false';input.setAttribute('aria-readonly',String(input.readOnly));if(input.readOnly)input.placeholder='Typing is off in Settings';document.querySelector('.check-btn').onclick=()=>{if(input.value.trim()==='')return;accuracyAttempts=Number(localStorage.getItem('numoraAccuracyAttempts')||0)+1;localStorage.setItem('numoraAccuracyAttempts',String(accuracyAttempts));let ok=Math.abs(Number(input.value)-Number(currentQuestion.answer))<.001;input.className='answer-input '+(ok?'correct':'wrong');feedback.className='feedback '+(ok?'success':'error');feedback.textContent=ok?'Nice work! That’s correct. ✦':'Not quite — try once more or peek at the explanation.';if(ok){accuracyCorrect=Number(localStorage.getItem('numoraAccuracyCorrect')||0)+1;localStorage.setItem('numoraAccuracyCorrect',String(accuracyCorrect));completed++;localStorage.setItem('numoraCompleted',String(completed));document.querySelector('.check-btn').textContent='Next question →';document.querySelector('.check-btn').onclick=newQuestion;showToast('Question complete · +10 XP');}};document.querySelector('.explain-btn').onclick=()=>document.querySelector('.explain').classList.toggle('show');input.addEventListener('keydown',e=>{if(e.key==='Enter')document.querySelector('.check-btn').click()})}
const lessonVideoObserver=new MutationObserver(()=>{const title=document.querySelector('.lesson-video .video-copy strong');const example=document.querySelector('.lesson-video .video-example');if(title){const lesson=(gradeSkillNames[selectedGrade]||gradeSkillNames['Grade 6'])[0];title.textContent='Watch: '+selectedGrade+' Math · '+lesson;if(example){if(selectedGrade==='Pre-K'){example.innerHTML='<span>Step 1: Start at '+currentQuestion.a+'.</span><span>Step 2: Count one more number.</span><span>Step 3: '+currentQuestion.a+' comes before <b>'+currentQuestion.answer+'</b>.</span>';}else{const total=(currentQuestion.a+currentQuestion.b)/10;example.innerHTML='<span>Step 1: Line up the decimal points.</span><span>Step 2: Add '+currentQuestion.a+' tenths + '+currentQuestion.b+' tenths = '+(currentQuestion.a+currentQuestion.b)+' tenths.</span><span>Step 3: Write the answer: <b>'+total.toFixed(1)+'</b>.</span>';}}}});lessonVideoObserver.observe(content,{childList:true,subtree:true});
lessonVideoObserver.disconnect();
const safeLessonVideoObserver=new MutationObserver(()=>{const title=document.querySelector('.lesson-video .video-copy strong');const example=document.querySelector('.lesson-video .video-example');if(!title||!example||!currentQuestion)return;const signature=selectedGrade+'-'+currentQuestion.a+'-'+currentQuestion.b+'-'+currentQuestion.answer;if(example.dataset.signature===signature)return;example.dataset.signature=signature;const lesson=(gradeSkillNames[selectedGrade]||gradeSkillNames['Grade 6'])[0];title.textContent='Watch: '+selectedGrade+' Math · '+lesson;if(selectedGrade==='Pre-K'){example.innerHTML='<span>Step 1: Start at '+currentQuestion.a+'.</span><span>Step 2: Count one more number.</span><span>Step 3: '+currentQuestion.a+' comes before <b>'+currentQuestion.answer+'</b>.</span>';}else{const total=(currentQuestion.a+currentQuestion.b)/10;example.innerHTML='<span>Step 1: Line up the decimal points.</span><span>Step 2: Add '+currentQuestion.a+' tenths + '+currentQuestion.b+' tenths = '+(currentQuestion.a+currentQuestion.b)+' tenths.</span><span>Step 3: Write the answer: <b>'+total.toFixed(1)+'</b>.</span>';}});safeLessonVideoObserver.observe(content,{childList:true,subtree:true});
const demoVideoObserver=new MutationObserver(()=>{const example=document.querySelector('.lesson-video .video-example');if(!example||example.dataset.demo==='true')return;example.dataset.demo='true';if(selectedGrade==='Pre-K'){example.innerHTML='<span>Example: What comes after 8?</span><span>Count one more number: 9.</span><span><b>8 comes before 9.</b></span>';}else{example.innerHTML='<span>Example: 0.2 + 0.5</span><span>2 tenths + 5 tenths = 7 tenths.</span><span><b>The example answer is 0.7.</b></span>';}});demoVideoObserver.observe(content,{childList:true,subtree:true});
const activeLessonObserver=new MutationObserver(()=>{const title=document.querySelector('.lesson-video .video-copy strong');const meta=document.querySelector('.practice-meta b');if(activeLesson&&title&&title.dataset.lesson!==activeLesson){title.dataset.lesson=activeLesson;title.textContent='Watch: '+selectedGrade+' Math · '+activeLesson;}if(activeLesson&&meta&&meta.dataset.lesson!==activeLesson){meta.dataset.lesson=activeLesson;meta.textContent=activeLesson.toUpperCase();}});activeLessonObserver.observe(content,{childList:true,subtree:true});
const lessonProgressObserver=new MutationObserver(()=>{lessonQuestionCount=Math.min(10,Math.max(0,lessonQuestionCount));const counter=document.querySelector('.practice-meta span:last-child');const bar=document.querySelector('.practice-shell .progress-line span');const desired='Question '+Math.min(lessonQuestionCount+1,10)+' of 10';const width=Math.min(100,lessonQuestionCount*10+10)+'%';if(counter&&counter.textContent!==desired&&counter.textContent.startsWith('Question'))counter.textContent=desired;if(bar&&bar.style.width!==width)bar.style.width=width;});lessonProgressObserver.observe(content,{childList:true,subtree:true});
const lessonExampleObserver=new MutationObserver(()=>{const example=document.querySelector('.lesson-video .video-example');if(!example||!activeLesson||example.dataset.lessonDemo===activeLesson)return;example.dataset.lessonDemo=activeLesson;const lesson=activeLesson.toLowerCase();if(lesson.includes('count'))example.innerHTML='<span>Example: What comes after 8?</span><span>Count one more: 9.</span><span><b>8 comes before 9.</b></span>';else if(lesson.includes('addition')||lesson.includes('add within'))example.innerHTML='<span>Example: 3 + 4</span><span>Start at 3 and count 4 more.</span><span><b>3 + 4 = 7</b></span>';else if(lesson.includes('multiplication'))example.innerHTML='<span>Example: 3 × 4</span><span>Three groups of four: 4 + 4 + 4.</span><span><b>3 × 4 = 12</b></span>';else if(lesson.includes('fraction'))example.innerHTML='<span>Example: 1/4 + 1/4</span><span>One fourth plus one fourth makes two fourths.</span><span><b>2/4 = 1/2</b></span>';else if(lesson.includes('equation'))example.innerHTML='<span>Example: x + 3 = 8</span><span>Subtract 3 from both sides.</span><span><b>x = 5</b></span>';else if(lesson.includes('quadratic'))example.innerHTML='<span>Example: x² = 25</span><span>5 × 5 = 25.</span><span><b>x = 5</b></span>';else if(lesson.includes('logarithm'))example.innerHTML='<span>Example: log₁₀(1000)</span><span>10³ = 1000.</span><span><b>The answer is 3</b></span>';else if(lesson.includes('derivative')||lesson.includes('calculus'))example.innerHTML='<span>Example: f(x) = x²</span><span>Its derivative is 2x.</span><span><b>At x = 3, f′(3) = 6</b></span>';else example.innerHTML='<span>Example: 0.2 + 0.5</span><span>2 tenths + 5 tenths = 7 tenths.</span><span><b>0.2 + 0.5 = 0.7</b></span>';});lessonExampleObserver.observe(content,{childList:true,subtree:true});
const practiceButtonObserver=new MutationObserver(()=>{document.querySelectorAll('[data-practice]').forEach(button=>button.onclick=()=>practiceView(button.dataset.lesson));});practiceButtonObserver.observe(content,{childList:true,subtree:true});
document.addEventListener('click',e=>{if(e.target.closest('.next-lesson-btn')){e.preventDefault();goToNextLesson();}});
function syncDailySummary(){if(localStorage.getItem('numoraTodayDate')===todayKey)todayCompleted=Number(localStorage.getItem('numoraTodayCompleted')||0);const stats=document.querySelectorAll('.stats-card .stat');if(stats[0]){const value=stats[0].querySelector('strong');const label=stats[0].querySelector('small');if(value)value.textContent=accuracyAttempts?Math.round(accuracyCorrect/accuracyAttempts*100)+'%':'—';if(label)label.textContent='Answer accuracy';}if(stats[1]){const value=stats[1].querySelector('strong');if(value)value.textContent=streak+' days';}if(stats[2]){const value=stats[2].querySelector('strong');const label=stats[2].querySelector('small');if(value)value.textContent=String(todayCompleted);if(label)label.textContent='Questions today';}const badgeCount=document.querySelector('.badge-count');if(badgeCount)badgeCount.textContent=String(badgeProgress.earned.length);}
const dailySaveObserver=new MutationObserver(()=>{const feedback=document.querySelector('.feedback.success');if(feedback&&!feedback.dataset.saved){feedback.dataset.saved='true';todayCompleted++;monthCompleted++;lessonQuestionCount++;window.currentLessonQuestionCount=lessonQuestionCount;updateBadgeProgress(activeLesson);savePausedLesson();localStorage.setItem('numoraTodayDate',todayKey);localStorage.setItem('numoraTodayCompleted',String(todayCompleted));localStorage.setItem('numoraMonthKey',monthKey);localStorage.setItem('numoraMonthCompleted',String(monthCompleted));const nextButton=document.querySelector('.check-btn');if(nextButton&&lessonQuestionCount>=10){nextButton.textContent='Finish lesson ✓';nextButton.onclick=showLessonComplete;}else if(nextButton){nextButton.textContent='Next question →';nextButton.onclick=renderLessonQuestion;}}});dailySaveObserver.observe(content,{attributes:true,subtree:true,attributeFilter:['class']});
const homeLessonObserver=new MutationObserver(()=>{const card=document.querySelector('.continue-card');const names=gradeSkillNames[selectedGrade]||gradeSkillNames['Grade 6'];const title=card?.querySelector('h2');if(title&&names[savedLessonIndex()]&&title.textContent!==names[savedLessonIndex()])title.textContent=names[savedLessonIndex()];});homeLessonObserver.observe(content,{childList:true,subtree:true});
let toastDismissTimer=0;
function showToast(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastDismissTimer);toastDismissTimer=setTimeout(()=>toast.classList.remove('show'),3000)}
document.addEventListener('click',e=>{const view=e.target.closest('[data-view]')?.dataset.view;if(view){({home:homeView,skills:skillsView,reports:reportsView,goals:()=>simpleView('goals'),badges:badgesView}[view])();document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view===view));}if(e.target.closest('[data-practice]')){practiceView(e.target.closest('[data-practice]').dataset.lesson);}});
document.addEventListener('click',e=>{const target=e.target instanceof Element?e.target.closest('[data-practice]'):null;if(target){e.preventDefault();practiceView(target.dataset.lesson);}});
document.addEventListener('click',e=>{const target=e.target instanceof Element?e.target.closest('.continue-card [data-practice],.empty-state [data-practice]'):null;if(target){e.preventDefault();e.stopImmediatePropagation();practiceView(target.dataset.lesson);}},true);
document.addEventListener('click',e=>{const target=e.target instanceof Element?e.target.closest('.check-btn'):null;if(!target)return;const isNext=target.textContent.includes('Next question');const isFinish=target.textContent.includes('Finish lesson');if(!isNext&&!isFinish)return;e.preventDefault();e.stopImmediatePropagation();if(isFinish||lessonQuestionCount>=10)showLessonComplete();else renderLessonQuestion();},true);
document.addEventListener('click',async e=>{
  const submit=e.target instanceof Element?e.target.closest('#auth-submit'):null;
  if(!submit)return;
  e.preventDefault();
  e.stopImmediatePropagation();
  const migrationReady=await accountMigrationPromise;
  if(!migrationReady){
    const error=document.querySelector('#auth-error');
    if(error){error.textContent='Secure password storage is unavailable. Please open Numora using its secure website.';error.classList.add('show');}
    document.querySelector('#password-input').value='';
    return;
  }
  const email=document.querySelector('#email-input')?.value.trim().toLowerCase()||'';
  const password=document.querySelector('#password-input')?.value||'';
  const passwordInput=document.querySelector('#password-input');
  const error=document.querySelector('#auth-error');
  const showAuthError=message=>{if(error){error.textContent=message;error.classList.add('show');}if(passwordInput)passwordInput.value='';};
  if(error){error.textContent='';error.classList.remove('show');}
  if(authMode==='resetPassword'||authMode==='resetUsername'){
    const account=findNumoraAccount(email);
    if(!account){showAuthError('Enter the email used for your Numora account.');return;}
    if(authMode==='resetPassword'){
      if(password.length<6){showAuthError('Your new password must be at least 6 characters.');return;}
      try{account.passwordHash=await hashNumoraPassword(password);delete account.password;}
      catch{showAuthError('Secure password storage is unavailable in this browser.');if(passwordInput)passwordInput.value='';return;}
      saveNumoraAccount(email,account);
      restoreAccountProgress(email,account);
      userName=account.username||email.split('@')[0]||'Learner';
      localStorage.setItem('numoraUser',userName);localStorage.setItem('numoraEmail',email);localStorage.removeItem('numoraPassword');
      authModal.classList.add('hidden');authMode='login';
      document.querySelector('.logout-btn')?.classList.remove('hidden');document.querySelector('.login-btn')?.classList.add('hidden');document.querySelector('.signup-btn')?.classList.add('hidden');
      if(passwordInput)passwordInput.value='';document.querySelector('#email-input').value='';document.querySelector('#name-input').value='';
      syncProfile();homeView();showToast('Password updated. Welcome back, '+firstName()+'!');return;
    }else{
      const newName=document.querySelector('#name-input')?.value.trim();
      if(!newName){showAuthError('Enter a new username.');return;}
      account.username=newName;
      if(localStorage.getItem('numoraActiveEmail')?.toLowerCase()===email){userName=newName;localStorage.setItem('numoraUser',newName);syncProfile();}
      showToast('Your new username was saved.');
    }
    saveNumoraAccount(email,account);authMode='login';authModal.classList.add('hidden');return;
  }
  const signup=authTitle.textContent.startsWith('Create');
  if(signup){
    if(!email||!/^\S+@\S+\.\S+$/.test(email)||password.length<6){showAuthError('Enter a valid email and a password with at least 6 characters.');return;}
    if(findNumoraAccount(email)){showAuthError('An account already uses this email. Please log in instead.');return;}
    userName=document.querySelector('#name-input')?.value.trim()||email.split('@')[0]||'Learner';
    let passwordHash;try{passwordHash=await hashNumoraPassword(password);}catch{showAuthError('Secure password storage is unavailable in this browser.');if(passwordInput)passwordInput.value='';return;}
    localStorage.setItem('numoraUser',userName);localStorage.setItem('numoraEmail',email);localStorage.removeItem('numoraPassword');localStorage.setItem('numoraActiveEmail',email);
    saveNumoraAccount(email,{username:userName,passwordHash,joinedAt:localDateKey(),progress:{}});startFreshAccount();saveCurrentAccountProgress();
  }else{
    const account=findNumoraAccount(email);
    let passwordValid=false;try{passwordValid=!!account&&await verifyNumoraPassword(account,password);}catch{}
    if(!passwordValid){showAuthError('We could not find an account with those details.');if(passwordInput)passwordInput.value='';return;}
    const previousEmail=(localStorage.getItem('numoraActiveEmail')||'').trim().toLowerCase();
    if(previousEmail&&previousEmail!==email)saveCurrentAccountProgress();
    restoreAccountProgress(email,account);
    userName=account.username||email.split('@')[0]||'Learner';
    localStorage.setItem('numoraUser',userName);localStorage.setItem('numoraEmail',email);localStorage.removeItem('numoraPassword');
  }
  authModal.classList.add('hidden');
  document.querySelector('.logout-btn')?.classList.remove('hidden');
  document.querySelector('.login-btn')?.classList.add('hidden');
  document.querySelector('.signup-btn')?.classList.add('hidden');
  if(passwordInput)passwordInput.value='';
  document.querySelector('#email-input').value='';
  document.querySelector('#name-input').value='';
  syncProfile();homeView();showToast('Welcome to Numora, '+firstName()+'!');
},true);
homeView();

const authModal=document.querySelector('#auth-modal');
const authTitle=document.querySelector('#auth-title');
const authEyebrow=document.querySelector('#auth-eyebrow');
const authCopy=document.querySelector('#auth-copy');
const authSubmit=document.querySelector('#auth-submit');
const authSwitch=document.querySelector('#auth-switch');
let authMode='login';
function openAuth(mode){authMode=mode;const signup=mode==='signup';authEyebrow.textContent=signup?'GET STARTED':'WELCOME BACK';authTitle.textContent=signup?'Create your Numora account':'Log in to Numora';authCopy.textContent=signup?'Save your progress, streaks, and favorite skills.':'Pick up your learning journey right where you left off.';authSubmit.textContent=signup?'Create account':'Log in';authSwitch.innerHTML=signup?'Already have an account? <button>Log in</button>':'New to Numora? <button>Sign up</button>';document.querySelector('#forgot-password').classList.toggle('hidden',signup);document.querySelector('#forgot-username').classList.add('hidden');document.querySelector('.name-field').classList.toggle('hidden',!signup);document.querySelector('.name-field').childNodes[0].textContent='Your name';document.querySelector('#password-input').parentElement.classList.remove('hidden');document.querySelector('#password-input').parentElement.childNodes[0].textContent='Password';document.querySelector('#password-input').placeholder='••••••••';document.querySelector('#password-input').value='';document.querySelector('#password-input').setAttribute('autocomplete',signup?'new-password':'current-password');document.querySelector('#email-input').value='';document.querySelector('#email-input').setAttribute('autocomplete','username');document.querySelector('#auth-error').textContent='';document.querySelector('#auth-error').classList.remove('show');authModal.classList.remove('hidden')}
document.addEventListener('click',e=>{if(e.target.closest('.login-btn'))openAuth('login');if(e.target.closest('.signup-btn'))openAuth('signup');if(e.target.closest('.logout-btn')){saveCurrentAccountProgress();localStorage.removeItem('numoraActiveEmail');localStorage.removeItem('numoraUser');numoraProgressKeys().forEach(key=>localStorage.removeItem(key));userName='Jordan Smith';selectedGrade='Pre-K';freshStart=true;completed=0;streak=0;todayCompleted=0;monthCompleted=0;badgeProgress={earned:[],practiceDays:[],practicedLessons:[],finishedLessons:[]};document.querySelector('.logout-btn').classList.add('hidden');document.querySelector('.login-btn').classList.remove('hidden');document.querySelector('.signup-btn').classList.remove('hidden');showToast('You have been logged out');openAuth('signup');}if(e.target.closest('.modal-close')||e.target===authModal)authModal.classList.add('hidden');if(e.target.closest('#auth-switch button'))openAuth(authTitle.textContent.startsWith('Log')?'signup':'login');if(e.target.closest('#forgot-password'))showToast('Password reset instructions are on the way');if(e.target.closest('#auth-submit')){if(authTitle.textContent.startsWith('Create')){const enteredName=document.querySelector('#name-input').value.trim();if(enteredName){userName=enteredName;localStorage.setItem('numoraUser',userName);}startFreshAccount();saveCurrentAccountProgress();}authModal.classList.add('hidden');document.querySelector('.logout-btn').classList.remove('hidden');document.querySelector('.login-btn').classList.add('hidden');document.querySelector('.signup-btn').classList.add('hidden');syncProfile();homeView();showToast('Welcome to Numora, '+firstName()+'!');}});
document.addEventListener('click',e=>{const gradeButton=e.target.closest('.secondary-btn');if(!gradeButton||!/^(?:Grade \d+|Pre-K|Kindergarten|College) ⌄$/.test(gradeButton.textContent.trim()))return;document.querySelector('.grade-menu')?.remove();const grades=['Pre-K','Kindergarten','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12','College'];const menu=document.createElement('div');menu.className='grade-menu';grades.forEach(grade=>{const option=document.createElement('button');option.textContent=grade;option.onclick=()=>{selectedGrade=grade;localStorage.setItem('numoraGrade',grade);syncProfile();menu.remove();skillsView();showToast('Now viewing '+grade+' Explorer');};menu.appendChild(option)});document.body.appendChild(menu);const rect=gradeButton.getBoundingClientRect();menu.style.position='fixed';menu.style.top=(rect.bottom+6)+'px';menu.style.left=(rect.right-145)+'px';});
if(localStorage.getItem('numoraUser')){document.querySelector('.logout-btn').classList.remove('hidden');document.querySelector('.login-btn').classList.add('hidden');document.querySelector('.signup-btn').classList.add('hidden');syncProfile();}else{userName='Guest';selectedGrade='Pre-K';freshStart=true;completed=0;streak=0;accuracyAttempts=0;accuracyCorrect=0;todayCompleted=0;monthCompleted=0;badgeProgress={earned:[],practiceDays:[],practicedLessons:[],finishedLessons:[]};document.querySelector('.logout-btn').classList.add('hidden');document.querySelector('.login-btn').classList.remove('hidden');document.querySelector('.signup-btn').classList.remove('hidden');document.querySelector('#app-content').innerHTML='<div class="page-wrap"><section class="card empty-state"><h2>You’re logged out</h2><p>Log in or create an account to continue learning.</p></section></div>';document.querySelector('#page-title').textContent='Welcome';syncProfile();openAuth('signup');}

function lessonQuestionData(){const lesson=(activeLesson||'').toLowerCase();if(lesson.includes('count')){const n=selectedGrade==='Pre-K'?4:19;return{prompt:`What number comes after ${n}?`,answer:String(n+1),explanation:`Count forward one number: ${n}, then <b>${n+1}</b>.`,a:n,b:1};}if(lesson.includes('addition')||lesson.includes('add within'))return{prompt:'What is 7 + 5?',answer:'12',explanation:'Start at 7 and count 5 more: 8, 9, 10, 11, 12.',a:7,b:5};if(lesson.includes('multiplication'))return{prompt:'What is 6 × 4?',answer:'24',explanation:'Add 6 four times: 6 + 6 + 6 + 6 = 24.',a:6,b:4};if(lesson.includes('fraction'))return{prompt:'What is 1/2 + 1/4?',answer:'0.75',explanation:'Change 1/2 to 2/4. Then 2/4 + 1/4 = 3/4 = 0.75.',a:2,b:1};if(lesson.includes('equation'))return{prompt:'Solve: x + 7 = 12',answer:'5',explanation:'Subtract 7 from both sides: x = 12 − 7 = 5.',a:12,b:7};if(lesson.includes('quadratic'))return{prompt:'Solve: x² = 49',answer:'7',explanation:'7 × 7 = 49, so the positive solution is x = 7.',a:7,b:7};if(lesson.includes('logarithm'))return{prompt:'What is log₁₀(100)?',answer:'2',explanation:'10² = 100, so log₁₀(100) = 2.',a:10,b:2};if(lesson.includes('derivative'))return{prompt:'If f(x) = x², what is f′(3)?',answer:'6',explanation:'The derivative of x² is 2x. At x = 3, 2 × 3 = 6.',a:2,b:3};if(lesson.includes('calculus'))return{prompt:'If f(x) = x³, what is f′(2)?',answer:'12',explanation:'The derivative of x³ is 3x². At x = 2, 3 × 2² = 12.',a:3,b:4};return{prompt:'What is 0.3 + 0.4?',answer:'0.7',explanation:'Line up the decimals: 3 tenths + 4 tenths = 7 tenths, or 0.7.',a:3,b:4};}
function renderLessonQuestion(){savePausedLesson();newQuestion();const data=window.lessonQuestionData();currentQuestion={...currentQuestion,...data};const question=document.querySelector('.question-card h1');const explanation=document.querySelector('.question-card .explain');if(question)question.textContent=data.prompt;if(explanation)explanation.innerHTML='<strong>Here’s the idea:</strong><br/>'+data.explanation;}

function applyTheme(theme){document.body.dataset.theme=theme==='dark'?'dark':'light';localStorage.setItem('numoraTheme',document.body.dataset.theme);}
function openUtilityPanel(type){
  let modal=document.querySelector('#utility-modal');
  if(!modal){modal=document.createElement('div');modal.id='utility-modal';modal.className='utility-modal hidden';document.body.appendChild(modal);}
  const dark=document.body.dataset.theme==='dark';
  modal.innerHTML=type==='settings'?`<section class="utility-panel" role="dialog" aria-modal="true" aria-labelledby="utility-title"><button class="utility-close" aria-label="Close">×</button><h2 id="utility-title">Settings</h2><p>Choose the look and answer controls that feel best while you practice.</p><strong>Color theme</strong><div class="theme-options"><button class="theme-option ${!dark?'active':''}" data-theme-choice="light">☀ Light</button><button class="theme-option ${dark?'active':''}" data-theme-choice="dark">◐ Dark</button></div></section>`:`<section class="utility-panel" role="dialog" aria-modal="true" aria-labelledby="utility-title"><button class="utility-close" aria-label="Close">×</button><h2 id="utility-title">Help center</h2><p>Here are quick ways to use Numora.</p><div class="help-list"><div class="help-item"><strong>Answer a question:</strong> Type your answer and click Check answer, or press Space.</div><div class="help-item"><strong>Continue later:</strong> Leave the app anytime. Your lesson and question are saved automatically.</div><div class="help-item"><strong>Change grade:</strong> Open Skill library and choose a grade from the grade menu.</div></div></section>`;
  if(type==='settings'){let control=localStorage.getItem('numoraAnswerControl')||'both';if(control==='space')control='both';const clickToType=localStorage.getItem('numoraClickToTypeAnswer')!=='false';modal.querySelector('.utility-panel').insertAdjacentHTML('beforeend',`<div class="answer-setting"><strong>Answer controls</strong><label class="setting-check"><input type="checkbox" data-click-to-type ${clickToType?'checked':''}><span>Click box to type answer</span></label><div class="theme-options answer-mode-options"><button class="theme-option ${control==='space-only'?'active':''}" data-answer-choice="space-only">⌨ Space bar</button><button class="theme-option ${control==='mouse'?'active':''}" data-answer-choice="mouse">🖱 Mouse</button><button class="theme-option ${control==='both'?'active':''}" data-answer-choice="both">⌨ + 🖱 Both</button></div></div>`);}
  modal.classList.remove('hidden');
}
applyTheme(localStorage.getItem('numoraTheme')||'light');
document.addEventListener('click',e=>{
  const action=e.target.closest('[data-action]')?.dataset.action;
  if(action==='settings'||action==='help'){e.preventDefault();openUtilityPanel(action);return;}
  const modal=e.target.closest('#utility-modal');
  if(modal&&(e.target===modal||e.target.closest('.utility-close')))modal.classList.add('hidden');
  const theme=e.target.closest('[data-theme-choice]')?.dataset.themeChoice;
  if(theme){applyTheme(theme);openUtilityPanel('settings');}
  const answerControl=e.target.closest('[data-answer-choice]')?.dataset.answerChoice;
  if(answerControl){localStorage.setItem('numoraAnswerControl',answerControl);openUtilityPanel('settings');}
  if(e.target.matches('[data-click-to-type]')){localStorage.setItem('numoraClickToTypeAnswer',String(e.target.checked));const input=document.querySelector('.answer-input');if(input){input.readOnly=!e.target.checked;input.setAttribute('aria-readonly',String(input.readOnly));input.placeholder=input.readOnly?'Typing is off in Settings':'Answer';}}
});
document.addEventListener('keydown',e=>{
  if(e.code!=='Space')return;
  const input=document.querySelector('.answer-input');
  if(!input||!document.querySelector('.practice-shell'))return;
  const mode=localStorage.getItem('numoraAnswerControl')||'both';
  if(mode==='mouse'){e.preventDefault();return;}
  e.preventDefault();
  if(input.readOnly){e.preventDefault();showToast('Turn on “Click box to type answer” in Settings first.');return;}
  if(document.activeElement!==input){input.focus();return;}
  const feedback=document.querySelector('.feedback');
  if(input.value.trim()||feedback?.classList.contains('success'))document.querySelector('.check-btn')?.click();
});
document.addEventListener('click',e=>{const button=e.target.closest('.check-btn');if(!button)return;const mode=localStorage.getItem('numoraAnswerControl')||'both';if(mode==='space-only'&&e.detail!==0){e.preventDefault();e.stopImmediatePropagation();showToast('Press Space bar to submit your answer.');}},true);
document.addEventListener('click',e=>{
  const button=e.target.closest('.messages-btn[aria-label="Numora messages"]');
  if(!button)return;
  document.querySelector('.notification-popover')?.remove();
  const note=document.createElement('section');
  note.className='notification-popover';
  const message=freshStart?`Welcome to Numora, ${firstName()}! Your first lesson is ready.`:`You have completed ${monthCompleted} question${monthCompleted===1?'':'s'} this month. Keep going!`;
  note.innerHTML=`<button class="notification-close" aria-label="Close notification">×</button><strong>${freshStart?'Welcome to Numora!':'Your learning update'}</strong><p>${message}</p>`;
  button.parentElement.appendChild(note);
  let swipeStart=0,swipeDistance=0;
  const dismiss=()=>{note.classList.add('swipe-away');setTimeout(()=>note.remove(),180);};
  note.querySelector('.notification-close').onclick=dismiss;
  note.addEventListener('pointerdown',event=>{if(event.target.closest('.notification-close'))return;swipeStart=event.clientX;swipeDistance=0;note.style.transition='none';note.setPointerCapture?.(event.pointerId);});
  note.addEventListener('pointermove',event=>{if(!swipeStart)return;swipeDistance=event.clientX-swipeStart;note.style.transform=`translateX(${swipeDistance}px)`;});
  note.addEventListener('pointerup',()=>{note.style.transition='';if(Math.abs(swipeDistance)>30)dismiss();else note.style.transform='';swipeStart=0;});
  note.addEventListener('pointercancel',()=>{note.style.transition='';note.style.transform='';swipeStart=0;});
  setTimeout(dismiss,3000);
  button.querySelector('i')?.remove();
});
document.addEventListener('click',e=>{
  if(e.target.closest('#forgot-password')){authMode='resetPassword';authEyebrow.textContent='ACCOUNT RECOVERY';authTitle.textContent='Create a new password';authCopy.textContent='Enter your account email and choose a new password.';document.querySelector('.name-field').classList.add('hidden');document.querySelector('#password-input').placeholder='New password';document.querySelector('#password-input').parentElement.childNodes[0].textContent='New password';authSubmit.textContent='Save new password';authSwitch.innerHTML='Back to login <button>Log in</button>';}
  if(e.target.closest('#forgot-username')){authMode='resetUsername';authEyebrow.textContent='ACCOUNT RECOVERY';authTitle.textContent='Create a new username';authCopy.textContent='Enter your account email and choose a new username.';document.querySelector('.name-field').classList.remove('hidden');document.querySelector('.name-field').childNodes[0].textContent='New username';document.querySelector('#password-input').parentElement.classList.add('hidden');authSubmit.textContent='Save new username';authSwitch.innerHTML='Back to login <button>Log in</button>';}
});

const passwordHashIterations=210000;
function passwordBytesToBase64(bytes){let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary);}
function passwordBase64ToBytes(value){return Uint8Array.from(atob(value),character=>character.charCodeAt(0));}
async function deriveNumoraPassword(password,salt,iterations=passwordHashIterations){
  if(!window.crypto?.subtle)throw new Error('Web Crypto is unavailable');
  const key=await window.crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  return new Uint8Array(await window.crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations,hash:'SHA-256'},key,256));
}
async function hashNumoraPassword(password){
  const salt=window.crypto.getRandomValues(new Uint8Array(16));
  const hash=await deriveNumoraPassword(password,salt);
  return `pbkdf2-sha256$${passwordHashIterations}$${passwordBytesToBase64(salt)}$${passwordBytesToBase64(hash)}`;
}
async function verifyNumoraPassword(account,password){
  if(account?.passwordHash){
    const [algorithm,iterationText,saltText,hashText]=account.passwordHash.split('$');
    if(algorithm!=='pbkdf2-sha256'||!saltText||!hashText)return false;
    const actual=await deriveNumoraPassword(password,passwordBase64ToBytes(saltText),Number(iterationText));
    const expected=passwordBase64ToBytes(hashText);
    if(actual.length!==expected.length)return false;
    let difference=0;for(let index=0;index<actual.length;index++)difference|=actual[index]^expected[index];
    return difference===0;
  }
  if(typeof account?.password!=='string'||password!==account.password)return false;
  account.passwordHash=await hashNumoraPassword(password);
  delete account.password;
  saveNumoraAccount(localStorage.getItem('numoraActiveEmail')||document.querySelector('#email-input').value,account);
  return true;
}
async function migrateStoredAccountPasswords(){
  if(!window.crypto?.subtle)return false;
  const accounts=readNumoraAccounts();
  let changed=false;
  const legacyEmail=String(localStorage.getItem('numoraEmail')||localStorage.getItem('numoraActiveEmail')||'').trim().toLowerCase();
  const hasLegacyAccount=legacyEmail&&Object.keys(accounts).some(email=>email.toLowerCase()===legacyEmail);
  if(legacyEmail&&localStorage.getItem('numoraUser')&&!hasLegacyAccount){
    accounts[legacyEmail]={username:localStorage.getItem('numoraUser'),password:localStorage.getItem('numoraPassword')||'',progress:Object.fromEntries(numoraProgressKeys().map(key=>[key,localStorage.getItem(key)]))};
    changed=true;
  }
  for(const account of Object.values(accounts)){
    if(!account)continue;
    if(account.passwordHash){if(Object.prototype.hasOwnProperty.call(account,'password')){delete account.password;changed=true;}continue;}
    if(typeof account.password!=='string')continue;
    account.passwordHash=await hashNumoraPassword(account.password);
    delete account.password;
    changed=true;
  }
  if(changed)localStorage.setItem('numoraAccounts',JSON.stringify(accounts));
  localStorage.removeItem('numoraPassword');
  return true;
}
const accountMigrationPromise=migrateStoredAccountPasswords().catch(()=>false);
document.addEventListener('click',event=>{
  if(!(event.target instanceof Element)||!event.target.closest('#forgot-password'))return;
  const input=document.querySelector('#password-input');
  input.value='';
  input.setAttribute('autocomplete','new-password');
},true);
