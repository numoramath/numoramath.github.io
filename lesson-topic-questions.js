(function () {
  const previousLessonQuestionData = window.lessonQuestionData;
  window.lessonQuestionData = function () {
    const lesson = String(window.currentActiveLesson || activeLesson || '').toLowerCase();
    const q = Number(window.currentLessonQuestionCount || 0);
    if (lesson.includes('shape')) {
      const sides = [3, 4, 5, 6][q % 4];
      return { prompt: `How many sides does a shape with ${sides} sides have?`, answer: String(sides), explanation: `Count the sides: this shape has ${sides}.`, a: sides, b: 0 };
    }
    if (lesson.includes('big and small') || lesson.includes('compare')) {
      const small = 2 + (q % 4), big = small + 3;
      return { prompt: `Which number is bigger: ${small} or ${big}?`, answer: String(big), explanation: `${big} is farther along the number line, so it is bigger.`, a: small, b: big };
    }
    if (lesson.includes('sort') || lesson.includes('color')) {
      const count = 3 + (q % 5);
      return { prompt: `You have ${count} red blocks and ${2 + (q % 3)} blue blocks. How many blocks altogether?`, answer: String(count + 2 + (q % 3)), explanation: `Put the two groups together to find the total.`, a: count, b: 2 + (q % 3) };
    }
    if (lesson.includes('pattern')) {
      const start = 1 + (q % 3), step = 2 + (q % 2);
      return { prompt: `What comes next: ${start}, ${start + step}, ${start + step * 2}, ?`, answer: String(start + step * 3), explanation: `Add ${step} each time.`, a: start, b: step };
    }
    if (lesson.includes('position') || lesson.includes('location')) {
      return { prompt: 'If the star is above the circle, where is the star?', answer: 'above', explanation: 'Above means higher than the other object.', a: 1, b: 1 };
    }
    return previousLessonQuestionData();
  };
})();
