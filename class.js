let user = JSON.parse(localStorage.getItem("user"));
let currentClass = localStorage.getItem("currentClass");

document.getElementById("classTitle").innerText = currentClass;

function completeLesson() {
  user.xp += 20;

  localStorage.setItem("user", JSON.stringify(user));

  alert("Quest Completed! +20 XP");

  window.location.href = "dashboard.html";
}
