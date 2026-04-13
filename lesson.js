function goToLesson() {
  const link = localStorage.getItem("lessonLink");
  window.open(link, "_blank");
}

function goToQuiz() {
  window.location.href = "class.html";
}
