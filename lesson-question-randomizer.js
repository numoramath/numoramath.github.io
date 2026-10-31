(function () {
  const originalQuestionData = window.lessonQuestionData;
  const questionOrders = new Map();
  let cachedKey = '';
  let cachedQuestion = null;
  let refreshNumber = 0;

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
    const questionNumber = Math.max(0, Number(window.currentLessonQuestionCount) || 0);
    const key = `${grade}|${lesson}|${questionNumber}|${refreshNumber}`;
    if (key === cachedKey && cachedQuestion) return cachedQuestion;

    if (lesson.toLowerCase().includes('long division')) {
      cachedQuestion = window.makeThreeDigitDivisionQuestion();
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
    cachedKey = key;
    return cachedQuestion;
  };

  document.addEventListener('click', function (event) {
    const skip = event.target.closest('[data-action="skip-question"]');
    if (!skip) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.refreshLessonQuestionVariant();
    window.newQuestion();
    window.showToast('Here’s a fresh question.');
  }, true);
})();
