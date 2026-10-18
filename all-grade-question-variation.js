const gradeQuestionBase=window.gradeLevelContent;
const gradeNumber={'Pre-K':0,'Kindergarten':1,'Grade 1':2,'Grade 2':3,'Grade 3':4,'Grade 4':5,'Grade 5':6,'Grade 6':7,'Grade 7':8,'Grade 8':9,'Grade 9':10,'Grade 10':11,'Grade 11':12,'Grade 12':13,'College':14};
function gradeQuestionItem(prompt,answer,explanation){return{prompt,answer:String(answer),explanation,a:0,b:0};}
function gradeLessonQuestion(grade,lessonName,questionNumber){
  const q=Number(questionNumber||0);
  if(grade==='Grade 2')return gradeQuestionBase(grade,lessonName,q);
  const lesson=lessonName.toLowerCase();
  const level=gradeNumber[grade]??0;
  const item=gradeQuestionItem;
  if(lesson.includes('logarithm')){const power=2+q;return item(`What is log₁₀(${'1'+'0'.repeat(power)})?`,power,`10 raised to the power of ${power} makes this number.`);}
  if(lesson.includes('complex')){const a=2+q,b=3+q;return item(`What is the real part of (${a} + ${b}i) + (${b} − ${a}i)?`,a+b,'Add the real parts together.');}
  if(lesson.includes('limit')){const x=2+q;return item(`What is lim x→${x} of (3x + 1)?`,3*x+1,'Substitute the input into this continuous expression.');}
  if(lesson.includes('derivative')||lesson.includes('calculus')){const x=2+q;return item(`If f(x) = x², what is f′(${x})?`,2*x,'The derivative of x² is 2x.');}
  if(lesson.includes('integral')){const coefficient=2+q;return item(`What is ∫₀² ${coefficient}x dx?`,coefficient*2,'The antiderivative is '+coefficient+'/2 × x²; then evaluate from 0 to 2.');}
  if(lesson.includes('matrix')||lesson.includes('linear algebra')){const a=2+q,b=3+q;return item(`What is the dot product of (${a}, ${b}) and (2, 3)?`,a*2+b*3,'Multiply matching entries, then add the products.');}
  if(lesson.includes('quadratic')){const root=2+q;return item(`Solve: x² = ${root*root}`,root,'Take the positive square root of both sides.');}
  if(lesson.includes('polynomial')){const a=2+q,b=3+q;return item(`Evaluate (${a}x + 4) + (${b}x − 1) when x = 1`,a+b+3,'Substitute 1 for x, then add.');}
  if(lesson.includes('function')||lesson.includes('equation')||lesson.includes('inequal')||lesson.includes('expression')){const x=2+q,m=2+(level%4),c=3+q;return item(`If ${m}x + ${c} = ${m*x+c}, what is x?`,x,'Subtract the constant, then divide by the coefficient.');}
  if(lesson.includes('percent')||lesson.includes('proportional')||lesson.includes('ratio')){const total=40+q*10;return item(`What is 25% of ${total}?`,total/4,'Twenty-five percent is one fourth.');}
  if(lesson.includes('data')||lesson.includes('graph')||lesson.includes('statistics')||lesson.includes('sampling')){const middle=5+q+level;return item(`What is the mean of ${middle-2}, ${middle}, and ${middle+2}?`,middle,'Add the values and divide by 3.');}
  if(lesson.includes('pattern')||lesson.includes('sequence')){const start=2+q+level,step=2+(level%5);return item(`What comes next: ${start}, ${start+step}, ${start+step*2}, ?`,start+step*3,`Add ${step} each time.`);}
  if(lesson.includes('fraction')){const denominator=4+(q%5);return item(`What is 1/${denominator} + 2/${denominator}?`,3/denominator,'The denominators match, so add the numerators.');}
  if(lesson.includes('decimal')){const a=1+level/10+q/10,b=2+(q%5)/10;return item(`What is ${a.toFixed(1)} + ${b.toFixed(1)}?`,(a+b).toFixed(1),'Line up the decimal points before adding.');}
  if(lesson.includes('division')||lesson.includes('divide')){const divisor=2+(level%6),answer=3+q;return item(`What is ${divisor*answer} ÷ ${divisor}?`,answer,'Use equal groups to divide.');}
  if(lesson.includes('multiplication')||lesson.includes('multiply')){const a=2+level+q,b=2+(q%6);return item(`What is ${a} × ${b}?`,a*b,'Multiply the two factors.');}
  if(lesson.includes('subtract')||lesson.includes('difference')){const a=20+level*5+q,b=3+(q%7);return item(`What is ${a} − ${b}?`,a-b,'Subtract the smaller number from the larger number.');}
  if(lesson.includes('count')){const n=2+q+level;return item(`What number comes after ${n}?`,n+1,'Count forward one number.');}
  const a=4+level*3+q,b=2+(q%7);
  return item(`What is ${a} + ${b}?`,a+b,'Add the two numbers.');
}
window.gradeLessonQuestion=gradeLessonQuestion;
window.lessonQuestionData=function(){return gradeLessonQuestion(localStorage.getItem('numoraGrade')||'Pre-K',window.currentActiveLesson||'',window.currentLessonQuestionCount||0);};
