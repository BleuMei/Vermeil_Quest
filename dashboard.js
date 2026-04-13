let user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "index.html";
}

function loadUser() {
  document.getElementById("name").innerText = user.name;
  document.getElementById("id").innerText = user.id;
  document.getElementById("xp").innerText = user.xp;
  document.getElementById("streak").innerText = user.streak;
}

function addXP() {
  user.xp += 10;

  showXP(10);

  localStorage.setItem("user", JSON.stringify(user));
  loadUser();
}

// XP popup animation
function showXP(amount) {
  const popup = document.createElement("div");
  popup.className = "xp-popup";
  popup.innerText = `+${amount} XP`;

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 1200);
}

// streak system
function updateStreak() {
  let last = localStorage.getItem("lastVisit");
  let today = new Date().toDateString();

  if (last !== today) {
    user.streak += 1;
    localStorage.setItem("lastVisit", today);
    localStorage.setItem("user", JSON.stringify(user));
  }
}

function enterClass(className) {
  localStorage.setItem("currentClass", className);
  window.location.href = "class.html";
}

function openLesson(url) {
  localStorage.setItem("lessonLink", url);
  window.location.href = "lesson.html";
}

updateStreak();
loadUser();
