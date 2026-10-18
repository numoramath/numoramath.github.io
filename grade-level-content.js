function gradeContentItem(prompt,answer,explanation){return{prompt,answer:String(answer),explanation,a:0,b:0};}
function gradeHas(lesson,...words){return words.some(word=>lesson.includes(word));}
function gradeLevelContent(grade,lessonName,questionNumber){
  const lesson=lessonName.toLowerCase();
  const q=Number(questionNumber||0);
  const item=gradeContentItem;
  if(grade==='Pre-K'){
    const n=1+(q%7);
    if(gradeHas(lesson,'pattern'))return item(`What comes next: ${n}, ${n+1}, ${n+2}, ?`,n+3,'Count forward one each time.');
    if(gradeHas(lesson,'more','less','big','small'))return item(`Which number is greater: ${n} or ${n+2}?`,n+2,`${n+2} is farther along when we count.`);
    return item(`What number comes after ${n}?`,n+1,`Count one more: ${n}, then ${n+1}.`);
  }
  if(grade==='Kindergarten'){
    const a=2+(q%5),b=1+(q%4);
    if(gradeHas(lesson,'compare'))return item(`Which is greater: ${a+b} or ${a}?`,a+b,`${a+b} is the larger number.`);
    if(gradeHas(lesson,'pattern'))return item(`What comes next: 2, 4, 6, ?`,8,'Add 2 each time.');
    return item(`What is ${a} + ${b}?`,a+b,`Count on ${b} from ${a}.`);
  }
  if(grade==='Grade 1'){
    const a=9+(q%8),b=3+(q%5);
    if(gradeHas(lesson,'subtract'))return item(`What is ${a} − ${b}?`,a-b,`Take ${b} away from ${a}.`);
    if(gradeHas(lesson,'place','number line'))return item(`What is 10 more than ${20+q}?`,30+q,'Add one group of ten.');
    return item(`What is ${a} + ${b}?`,a+b,`Add ${a} and ${b}.`);
  }
  if(grade==='Grade 2'){
    const a=34+q*3,b=12+(q%6);
    if(gradeHas(lesson,'subtract'))return item(`What is ${a} − ${b}?`,a-b,'Subtract ones, then subtract tens.');
    if(gradeHas(lesson,'skip')){const step=2+(q%4),start=step*(1+(q%3));return item(`What comes next: ${start}, ${start+step}, ${start+step*2}, ?`,start+step*3,`Count by ${step}s each time.`);}
    if(gradeHas(lesson,'odd','even'))return item(`Is ${22+q} odd or even?`,(22+q)%2===0?'even':'odd','Numbers ending in 0, 2, 4, 6, or 8 are even.');
    return item(`What is ${a} + ${b}?`,a+b,'Add ones, then add tens.');
  }
  if(grade==='Grade 3'){
    const a=3+(q%5),b=4+(q%4);
    if(gradeHas(lesson,'division'))return item(`What is ${a*b} ÷ ${a}?`,b,`Divide ${a*b} into ${a} equal groups.`);
    if(gradeHas(lesson,'fraction'))return item(`What is 1/4 + 2/4?`,'3/4','The denominators are the same, so add the numerators.');
    if(gradeHas(lesson,'addition'))return item(`What is ${125+q} + ${48+q}?`,173+q*2,'Add ones, tens, then hundreds.');
    return item(`What is ${a} × ${b}?`,a*b,`Multiply ${a} groups of ${b}.`);
  }
  if(grade==='Grade 4'){
    const a=23+q*7,b=3+(q%4);
    if(gradeHas(lesson,'multi-digit multiplication'))return item(`What is ${a} × ${b}?`,a*b,'Multiply the ones, then the tens, and add the results.');
    if(gradeHas(lesson,'division'))return item(`What is ${84+q*6} ÷ 6?`,14+q,'Use multiplication to check the quotient.');
    if(gradeHas(lesson,'fraction','mixed'))return item(`What is 3/8 + 2/8?`,'5/8','Keep the denominator and add the numerators.');
    if(gradeHas(lesson,'decimal'))return item(`What is 2.${q} + 1.5?`,(3.5+q/10).toFixed(1),'Line up the decimal points before adding.');
    if(gradeHas(lesson,'factor','multiple'))return item(`Is ${24+q} a multiple of 3?`,(24+q)%3===0?'yes':'no','A multiple of 3 can be divided by 3 evenly.');
    return item(`What is ${a} + ${38+q}?`,a+38+q,'Add by place value.');
  }
  if(grade==='Grade 5'){
    const qn=2+(q%4);
    if(gradeHas(lesson,'fraction'))return item(`What is ${qn}/6 + 1/6?`,`${qn+1}/6`,'Add fractions with the same denominator.');
    if(gradeHas(lesson,'decimal'))return item(`What is 4.${q} + 2.7?`,(6.7+q/10).toFixed(1),'Line up the decimal points.');
    if(gradeHas(lesson,'order'))return item(`What is 6 + 3 × ${2+q%3}?`,6+3*(2+q%3),'Multiply before adding.');
    if(gradeHas(lesson,'expression'))return item(`Evaluate 4n + 3 when n = ${2+q}.`,4*(2+q)+3,'Replace n with the given value.');
    return item(`What is ${120+q*5} ÷ 5?`,24+q,'Divide the whole number by 5.');
  }
  if(grade==='Grade 6'){
    if(gradeHas(lesson,'ratio','rate'))return item(`A car travels 120 miles in 3 hours. What is the unit rate?`,'40','Divide miles by hours: 120 ÷ 3.');
    if(gradeHas(lesson,'integer'))return item(`What is −${5+q} + ${9+q}?`,4,'A positive number with the larger value wins.');
    if(gradeHas(lesson,'fraction'))return item(`What is 2/3 × 3/5?`,'2/5','Multiply numerators and denominators, then simplify.');
    if(gradeHas(lesson,'percent'))return item(`What is 15% of 80?`,'12','Change 15% to 0.15, then multiply by 80.');
    if(gradeHas(lesson,'expression'))return item(`Evaluate 3x − 4 when x = ${4+q}.`,3*(4+q)-4,'Substitute the value for x.');
    return item(`What is 4.${q} + 2.8?`,(7.2+q/10).toFixed(1),'Add the decimals by place value.');
  }
  if(grade==='Grade 7'){
    if(gradeHas(lesson,'proportional','percent'))return item(`A $50 item is discounted 20%. What is the discount?`,'10','Find 20% of 50: 0.20 × 50.');
    if(gradeHas(lesson,'rational'))return item(`What is −7 + 12?`,'5','Add integers with different signs.');
    if(gradeHas(lesson,'probability'))return item(`A bag has 3 red and 2 blue tiles. What is P(red)?`,'3/5','There are 3 favorable outcomes out of 5 total.');
    if(gradeHas(lesson,'inequal'))return item(`Solve: x − 4 > 9`,'x > 13','Add 4 to both sides.');
    return item(`Solve: 4x + 3 = ${19+q}.`,(16+q)/4,'Subtract 3, then divide by 4.');
  }
  if(grade==='Grade 8'){
    if(gradeHas(lesson,'linear','system'))return item(`Solve: 3x − 5 = ${16+q}.`,(21+q)/3,'Add 5, then divide by 3.');
    if(gradeHas(lesson,'function'))return item(`If f(x) = 2x − 1, what is f(${4+q})?`,2*(4+q)-1,'Substitute the input into the function.');
    if(gradeHas(lesson,'exponent'))return item(`What is 2³ × 2²?`,'32','Add exponents: 2^(3 + 2) = 32.');
    return item(`What is the slope between (1, 2) and (3, ${6+q})?`,(4+q)/2,'Use rise divided by run.');
  }
  if(grade==='Grade 9'){
    if(gradeHas(lesson,'quadratic'))return item(`Solve: x² − ${9+q} = 0`,Math.sqrt(9+q),'Take the square root of both sides.');
    if(gradeHas(lesson,'exponent'))return item(`Simplify: 3² × 3³`,'243','Add the exponents: 3⁵ = 243.');
    if(gradeHas(lesson,'polynomial'))return item(`Simplify: (2x + 3) + (4x − 1)`,'6x + 2','Combine like terms.');
    return item(`Solve: 5x + 2 = ${27+q}.`,(25+q)/5,'Subtract 2, then divide by 5.');
  }
  if(grade==='Grade 10'){
    if(gradeHas(lesson,'quadratic'))return item(`Solve: x² − 7x + 12 = 0`,'3 or 4','Factor: (x − 3)(x − 4) = 0.');
    if(gradeHas(lesson,'polynomial'))return item(`Multiply: (x + 2)(x + 5)`,'x² + 7x + 10','Use distribution to multiply each term.');
    if(gradeHas(lesson,'rational'))return item(`Simplify: 6x / 3`,'2x','Divide each factor by 3.');
    if(gradeHas(lesson,'sequence'))return item(`What is the next term: 4, 7, 10, ?`,'13','This arithmetic sequence adds 3.');
    return item(`Solve: 2x − 9 = ${11+q}.`,(20+q)/2,'Add 9, then divide by 2.');
  }
  if(grade==='Grade 11'){
    if(gradeHas(lesson,'logarithm'))return item(`What is log₁₀(${1000*Math.pow(10,q%2)})?`,3+(q%2),'Find the power of 10 that makes the number.');
    if(gradeHas(lesson,'complex'))return item(`What is (3 + 2i) + (4 − 5i)?`,'7 − 3i','Add real parts and imaginary parts separately.');
    if(gradeHas(lesson,'trigonometric'))return item(`If sin θ = 3/5 and θ is acute, what is cos θ?`,'4/5','Use the 3-4-5 relationship.');
    if(gradeHas(lesson,'limit'))return item(`What is lim x→2 of (x + 5)?`,'7','For a continuous expression, substitute x = 2.');
    if(gradeHas(lesson,'matrix'))return item(`Add the matching entries: 6 + 4`,'10','Matrix addition adds entries in the same position.');
    return item(`What is the 5th term of 2, 6, 18, 54, ?`,'162','Multiply by 3 each time.');
  }
  if(grade==='Grade 12'){
    if(gradeHas(lesson,'derivative'))return item(`If f(x) = x³, what is f′(2)?`,'12','The derivative is 3x². Then 3 × 2² = 12.');
    if(gradeHas(lesson,'integral'))return item(`What is ∫ 4x³ dx?`,'x⁴ + C','Increase the exponent and divide by the new exponent.');
    if(gradeHas(lesson,'limit'))return item(`What is lim x→3 of (2x + 1)?`,'7','Substitute x = 3 into the continuous function.');
    if(gradeHas(lesson,'probability','expected'))return item(`A fair coin is flipped once. What is P(heads)?`,'1/2','One of two equally likely outcomes is heads.');
    if(gradeHas(lesson,'financial'))return item(`What is 5% of $200?`,'10','Multiply 200 by 0.05.');
    return item(`Solve: 3x − 8 = ${13+q}.`,(21+q)/3,'Add 8, then divide by 3.');
  }
  if(grade==='College'){
    if(gradeHas(lesson,'calculus','integral'))return item(`If f(x) = x², what is f′(5)?`,'10','The derivative of x² is 2x, so f′(5) = 10.');
    if(gradeHas(lesson,'differential'))return item(`If dy/dx = 6x, what is dy/dx when x = 3?`,'18','Substitute x = 3 into 6x.');
    if(gradeHas(lesson,'linear algebra','matrix'))return item(`What is the dot product of (2, 3) and (4, 5)?`,'23','Multiply matching entries and add: 2×4 + 3×5.');
    if(gradeHas(lesson,'statistics','regression'))return item(`What is the mean of 12, 15, and 18?`,'15','Add the values and divide by 3.');
    if(gradeHas(lesson,'proof'))return item(`If n is even, is 2n even or odd?`,'even','Two times any whole number is even.');
    return item(`Evaluate ∫ 2x dx`,'x² + C','Increase the exponent and divide by the new exponent.');
  }
  return item('What is 8 + 7?','15','Add the two numbers.');
}

window.gradeLevelContent=gradeLevelContent;
window.lessonQuestionData=function(){return gradeLevelContent(localStorage.getItem('numoraGrade')||'Pre-K',window.currentActiveLesson||'',window.currentLessonQuestionCount||0);};
