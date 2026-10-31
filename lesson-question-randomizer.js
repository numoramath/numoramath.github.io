(function () {
  const originalQuestionData = window.lessonQuestionData;
  const questionOrders = new Map();
  let cachedKey = '';
  let cachedQuestion = null;
  let refreshNumber = 0;
  const lastPromptByLesson = new Map();

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffledQuestionNumber(grade, lesson, questionNumber) {
    const block = Math.floor(questionNumber / 10);
    const key = `${grade}|${lesson}|${block}`;
    if (!questionOrders.has(key)) {
      const order = Array.from({ length: 10 }, (_, index) => block * 10 + index);
      for (let index = order.length - 1; index > 0; index--) {
        const swap = randomInt(0, index);
        [order[index], order[swap]] = [order[swap], order[index]];
      }
      questionOrders.set(key, order);
    }
    return questionOrders.get(key)[questionNumber % 10];
  }

  window.makeThreeDigitDivisionQuestion = function () {
    const divisor = randomInt(2, 9);
    const smallestQuotient = Math.ceil(100 / divisor);
    const largestQuotient = Math.floor(999 / divisor);
    const answer = randomInt(smallestQuotient, largestQuotient);
    const dividend = divisor * answer;
    const digits = String(dividend).split('').map(Number);
    let start = 0;
    let firstPartial = digits[0];
    while (firstPartial < divisor && start < digits.length - 1) firstPartial = firstPartial * 10 + digits[++start];
    let remainder = firstPartial % divisor;
    let quotient = String(Math.floor(firstPartial / divisor));
    const firstDigit = Math.floor(firstPartial / divisor);
    const steps = [`${divisor} goes into ${firstPartial} ${firstDigit} time${firstDigit === 1 ? '' : 's'}: ${firstDigit} × ${divisor} = ${firstDigit * divisor}; subtract to get ${remainder}.`];
    for (let index = start + 1; index < digits.length; index++) {
      const partial = remainder * 10 + digits[index];
      const quotientDigit = Math.floor(partial / divisor);
      remainder = partial % divisor;
      quotient += String(quotientDigit);
      steps.push(`Bring down ${digits[index]} to make ${partial}. ${divisor} goes into ${partial} ${quotientDigit} time${quotientDigit === 1 ? '' : 's'}; subtract to get ${remainder}.`);
    }
    const cleanQuotient = String(Number(quotient));
    return {
      prompt: `Divide ${dividend} by ${divisor}.`,
      answer: cleanQuotient,
      explanation: `${steps.join('<br>')} The answer is ${dividend} ÷ ${divisor} = ${cleanQuotient}.`,
      dividend,
      divisor,
      a: dividend,
      b: divisor,
    };
  };

  window.refreshLessonQuestionVariant = function () {
    refreshNumber++;
    cachedKey = '';
    cachedQuestion = null;
  };

  window.lessonQuestionData = function () {
    const grade = localStorage.getItem('numoraGrade') || 'Pre-K';
    const lesson = String(window.currentActiveLesson || window.activeLesson || '').trim();
    const lessonKey = `${grade}|${lesson}`;
    const questionNumber = Math.max(0, Number(window.currentLessonQuestionCount) || 0) + refreshNumber;
    const key = `${grade}|${lesson}|${questionNumber}|${refreshNumber}`;
    if (key === cachedKey && cachedQuestion) return cachedQuestion;

    if (lesson.toLowerCase().includes('long division')) {
      do {
        cachedQuestion = window.makeThreeDigitDivisionQuestion();
      } while (cachedQuestion.prompt === lastPromptByLesson.get(lessonKey));
      lastPromptByLesson.set(lessonKey, cachedQuestion.prompt);
      cachedKey = key;
      return cachedQuestion;
    }

    const originalQuestionNumber = window.currentLessonQuestionCount;
    window.currentLessonQuestionCount = shuffledQuestionNumber(grade, lesson, questionNumber);
    try {
      cachedQuestion = originalQuestionData();
    } finally {
      window.currentLessonQuestionCount = originalQuestionNumber;
    }
    if (cachedQuestion.prompt === lastPromptByLesson.get(lessonKey)) {
      cachedQuestion = makeDifferentTopicVariant(lesson, questionNumber);
    }
    lastPromptByLesson.set(lessonKey, cachedQuestion.prompt);
    cachedKey = key;
    return cachedQuestion;
  };

  function makeDifferentTopicVariant(lessonName, index) {
    const lesson = lessonName.toLowerCase();
    const n = index + 2;
    if (lesson.includes('decimal') || lesson.includes('tenths') || lesson.includes('hundredths')) {
      const a = 1 + (index % 8), b = 1 + ((index * 3 + 1) % 8);
      const answer = ((a + b) / 10).toFixed(1);
      return { prompt: `What is 0.${a} + 0.${b}?`, answer, explanation: `Add the tenths: ${a} tenths + ${b} tenths = ${a + b} tenths, or ${answer}.`, a: a / 10, b: b / 10 };
    }
    if (lesson.includes('position') || lesson.includes('location')) {
      const directions = ['above', 'below', 'left of', 'right of'];
      const answer = directions[index % directions.length];
      return { prompt: `The star is ${answer} the circle. Where is the star?`, answer, explanation: `${answer[0].toUpperCase()}${answer.slice(1)} describes the star’s position compared with the circle.`, a: index, b: 1 };
    }
    if (lesson.includes('addition') || lesson.includes('add within')) {
      const a = 3 + (index % 8), b = 2 + ((index * 3) % 7);
      return { prompt: `What is ${a} + ${b}?`, answer: String(a + b), explanation: `Add ${b} to ${a} to get ${a + b}.`, a, b };
    }
    if (lesson.includes('multiplication')) {
      const a = 2 + (index % 8), b = 2 + ((index * 3) % 8);
      return { prompt: `What is ${a} × ${b}?`, answer: String(a * b), explanation: `${a} groups of ${b} make ${a * b}.`, a, b };
    }
    if (lesson.includes('fraction')) {
      const denominator = 4 + (index % 5), numerator = 1 + (index % (denominator - 1));
      return { prompt: `What fraction of ${denominator} equal parts is ${numerator} part${numerator === 1 ? '' : 's'}?`, answer: `${numerator}/${denominator}`, explanation: `${numerator} of the ${denominator} equal parts are selected, so the fraction is ${numerator}/${denominator}.`, a: numerator, b: denominator };
    }
    if (lesson.includes('count')) {
      return { prompt: `What number comes after ${n}?`, answer: String(n + 1), explanation: `Count forward one number: ${n}, then ${n + 1}.`, a: n, b: 1 };
    }
    if (lesson.includes('place value')) {
      const tens = 2 + (index % 7), ones = (index * 3) % 10, number = tens * 10 + ones;
      return { prompt: `In ${number}, what is the value of the ${tens} in the tens place?`, answer: String(tens * 10), explanation: `The ${tens} is in the tens place, so its value is ${tens} tens, or ${tens * 10}.`, a: number, b: tens * 10 };
    }
    if (lesson.includes('time') || lesson.includes('clock')) {
      const hour = 1 + (index % 10), elapsed = 1 + (index % 3), answerHour = ((hour - 1 + elapsed) % 12) + 1;
      return { prompt: `What time is ${elapsed} hour${elapsed === 1 ? '' : 's'} after ${hour}:00?`, answer: `${answerHour}:00`, explanation: `Move forward ${elapsed} hour${elapsed === 1 ? '' : 's'} from ${hour}:00 to ${answerHour}:00.`, a: hour, b: elapsed };
    }
    if (lesson.includes('shape')) {
      const sides = 3 + (index % 6);
      return { prompt: `How many sides does a shape with ${sides} sides have?`, answer: String(sides), explanation: `Count the sides: this shape has ${sides}.`, a: sides, b: 0 };
    }
    if (lesson.includes('measurement') || lesson.includes('length')) {
      const short = 2 + (index % 6), long = short + 2 + (index % 3);
      return { prompt: `A ribbon is ${short} cm long and a string is ${long} cm long. Which is longer?`, answer: 'string', explanation: `Compare ${short} cm and ${long} cm. The string is longer because ${long} is greater than ${short}.`, a: short, b: long };
    }
    if (lesson.includes('word problem')) {
      const start = 4 + (index % 8), more = 2 + ((index * 3) % 7), total = start + more;
      return { prompt: `Mia has ${start} stickers and gets ${more} more. How many stickers does she have now?`, answer: String(total), explanation: `Add the stickers: ${start} + ${more} = ${total}.`, a: start, b: more };
    }
    // Preserve the active lesson context even for lessons whose original
    // generator only supplied one hard-coded question.
    const a = 2 + (index % 8), b = 3 + ((index * 3) % 7);
    return { prompt: `${lessonName}: solve ${a} + ${b}.`, answer: String(a + b), explanation: `Use the ${lessonName} idea to work with ${a} and ${b}. Their sum is ${a + b}.`, a, b };
  }

  document.addEventListener('click', function (event) {
    const skip = event.target.closest('[data-action="skip-question"]');
    if (!skip) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.refreshLessonQuestionVariant();
    // Re-render through the lesson data path so this control always asks
    // about the active lesson instead of falling back to generic arithmetic.
    window.renderLessonQuestion();
    window.showToast('Here’s a fresh question.');
  }, true);
})();
