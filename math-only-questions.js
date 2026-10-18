const mathOnlyBase=window.lessonQuestionData;
window.lessonQuestionData=function(){
  const lesson=(window.currentActiveLesson||'').toLowerCase();
  const q=Number(window.currentLessonQuestionCount||0);
  const geometryWords=['geometry','geometric','shape','angle','triangle','circle','area','perimeter','volume','coordinate','plane','pythagorean','transformation','congruence','similarity','symmetry','surface area','scale drawing','trigonometry','vector','vectors','conic'];
  if(geometryWords.some(word=>lesson.includes(word))){
    const a=6+q*2;
    const b=3+(q%5);
    return{
      prompt:`What is ${a} + ${b}?`,
      answer:String(a+b),
      explanation:`Add the two numbers: ${a} + ${b} = ${a+b}.`,
      a,
      b
    };
  }
  return mathOnlyBase();
};
