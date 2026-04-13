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

function updateLevel() {
  let user = JSON.parse(localStorage.getItem("user"));

  let level = Math.floor(user.xp / 100) + 1;
  let progress = user.xp % 100;

  user.level = level;

  document.getElementById("level").innerText = level;
  document.getElementById("xp").innerText = `${progress} / 100`;

  // progress bar update
  document.getElementById("xpBar").style.width = `${progress}%`;

  localStorage.setItem("user", JSON.stringify(user));
}

function claimDay(day) {
  let user = JSON.parse(localStorage.getItem("user"));
  let today = new Date().toDateString();

  if (user.dailyClaimed[day] === today) {
    alert("Already claimed today.");
    return;
  }

  user.dailyClaimed[day] = today;

  user.xp += 20;

  showXP(20);

  localStorage.setItem("user", JSON.stringify(user));

  updateLevel();
  updateDays();
}
function updateDays() {
  let user = JSON.parse(localStorage.getItem("user"));

  for (let i = 1; i <= 7; i++) {
    let btn = document.getElementById("day" + i);

    if (user.dailyClaimed[i]) {
      btn.disabled = true;
      btn.innerText = "Completed";
      btn.style.opacity = 0.5;
    }
  }
}

function claimStreak() {
  let user = JSON.parse(localStorage.getItem("user"));
  let today = new Date().toDateString();

  // already claimed today
  if (user.lastLogin === today) {
    showPopup("⚠️ You already claimed today’s reward.");
    return;
  }

  // update streak
  if (user.lastLogin) {
    let last = new Date(user.lastLogin);
    let now = new Date(today);

    let diff = (now - last) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      user.streak += 1; // continue streak
    } else {
      user.streak = 1; // reset streak
    }
  } else {
    user.streak = 1;
  }

  user.lastLogin = today;
  user.xp += 20;

  localStorage.setItem("user", JSON.stringify(user));

  updateUI();
  showPopup(`🔥 Day ${user.streak} streak claimed! +20 XP awarded.`);
}

let popupActive = false;

function showPopup(message) {
  if (popupActive) return;

  popupActive = true;

  const popup = document.createElement("div");
  popup.className = "center-popup";
  popup.innerText = message;

  document.body.appendChild(popup);

  // disappears after 5 seconds IF not interacted
  let timeout = setTimeout(() => {
    popup.remove();
    popupActive = false;
  }, 5000);

  // disappears if user clicks anywhere
  document.addEventListener("click", function handler() {
    popup.remove();
    popupActive = false;
    clearTimeout(timeout);
    document.removeEventListener("click", handler);
  });
}

updateStreak();
loadUser();
