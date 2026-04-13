let user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "index.html";
}

/* =========================
   INIT DEFAULT STRUCTURE
   ========================= */

user.dailyClaimed = user.dailyClaimed || {};
user.lastLogin = user.lastLogin || null;

/* =========================
   LOAD UI
   ========================= */

function loadUser() {
  document.getElementById("name").innerText = user.name;
  document.getElementById("id").innerText = user.id;

  updateLevelUI();
  updateDaysUI();
}

/* =========================
   XP SYSTEM
   ========================= */

function addXP(amount = 10) {
  user.xp += amount;

  saveUser();
  showXP(amount);
  updateLevelUI();
}

/* =========================
   LEVEL SYSTEM (0–100)
   ========================= */

function updateLevelUI() {
  let level = Math.floor(user.xp / 100) + 1;
  let progress = user.xp % 100;

  user.level = level;

  document.getElementById("level").innerText = level;
  document.getElementById("xp").innerText = `${progress} / 100`;

  let bar = document.getElementById("xpBar");
  if (bar) bar.style.width = `${progress}%`;

  saveUser();
}

/* =========================
   DAILY QUEST SYSTEM (1–7 ONLY)
   ========================= */

function claimDay(day) {
  let today = new Date().toDateString();

  if (user.dailyClaimed[day] === today) {
    showPopup("You already claimed today’s reward.");
    return;
  }

  user.dailyClaimed = {}; // only ONE active day at a time
  user.dailyClaimed[day] = today;

  user.xp += 20;

  saveUser();

  showXP(20);
  updateLevelUI();
  updateDaysUI();

  showPopup(`Day ${day} completed. +20 XP earned.`);
}

function updateDaysUI() {
  for (let i = 1; i <= 7; i++) {
    let btn = document.getElementById("day" + i);
    if (!btn) continue;

    if (user.dailyClaimed[i]) {
      btn.innerText = "Completed";
      btn.disabled = true;
      btn.style.opacity = 0.5;
    }
  }
}

/* =========================
   STREAK SYSTEM (FIXED)
   ========================= */

function updateStreak() {
  let today = new Date().toDateString();

  if (user.lastLogin !== today) {
    user.streak = (user.lastLogin) ? user.streak + 1 : 1;
    user.lastLogin = today;
  }

  saveUser();
}

/* =========================
   CLASS NAVIGATION
   ========================= */

function enterClass(className) {
  localStorage.setItem("currentClass", className);
  window.location.href = "class.html";
}

function openLesson(url) {
  localStorage.setItem("lessonLink", url);
  window.location.href = "lesson.html";
}

/* =========================
   POPUPS
   ========================= */

function showXP(amount) {
  const popup = document.createElement("div");
  popup.className = "xp-popup";
  popup.innerText = `+${amount} XP`;

  document.body.appendChild(popup);

  setTimeout(() => popup.remove(), 1200);
}

let popupActive = false;

function showPopup(message) {
  if (popupActive) return;

  popupActive = true;

  const popup = document.createElement("div");
  popup.className = "center-popup";
  popup.innerText = message;

  document.body.appendChild(popup);

  let timeout = setTimeout(() => {
    popup.remove();
    popupActive = false;
  }, 5000);

  document.addEventListener("click", function handler() {
    popup.remove();
    popupActive = false;
    clearTimeout(timeout);
    document.removeEventListener("click", handler);
  });
}

/* =========================
   SAVE HELPERS
   ========================= */

function saveUser() {
  localStorage.setItem("user", JSON.stringify(user));
}

/* =========================
   INIT
   ========================= */

updateStreak();
loadUser();
