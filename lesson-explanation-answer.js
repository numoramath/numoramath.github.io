const renderLessonQuestionWithoutAnswer = renderLessonQuestion;
renderLessonQuestion = function () {
  renderLessonQuestionWithoutAnswer();

  const explanation = document.querySelector('.question-card .explain');
  if (!explanation || typeof window.lessonQuestionData !== 'function') return;

  const answer = String(window.lessonQuestionData().answer)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  explanation.insertAdjacentHTML('beforeend', `<br><strong>Answer:</strong> ${answer}`);
};
