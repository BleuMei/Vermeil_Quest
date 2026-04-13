let user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "index.html";
}

/* =========================
   SAFE INIT
   ========================= */

user.dailyClaimed = user.dailyClaimed || {};
user.lastLogin = user.lastLogin || null;

/* =========================
   START
   ========================= */

window.onload = () => {
  updateStreak();
  saveUser();
  loadUser();
  updateDaysUI();
  showDailyPopup(); // IMPORTANT: first thing user sees
};

/* =========================
   LOAD UI
   ========================= */

function loadUser() {
  document.getElementById("name").innerText = user.name;
  document.getElementById("id").innerText = user.id;

  updateLevelUI();
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
   LEVEL SYSTEM
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
   DAILY POPUP (MAIN FEATURE)
   ========================= */

function getTodayDay() {
  let base = user.streak % 7;
  return base === 0 ? 7 : base;
}

function showDailyPopup() {
  const day = getTodayDay();

  const popup = document.createElement("div");
  popup.className = "center-popup";

  popup.innerHTML = `
    <h2>🔥 Day ${day} Quest</h2>
    <p>Claim your daily reward to continue your streak.</p>
    <button id="claimBtn">Claim Day ${day}</button>
  `;

  document.body.appendChild(popup);

  let claimed = false;

  document.getElementById("claimBtn").onclick = () => {
    if (claimed) return;
    claimed = true;

    claimDay(day);

    popup.innerHTML = `<h2>✔ Completed</h2><p>XP absorbed. You’re getting stronger.</p>`;

    setTimeout(() => popup.remove(), 2000);
  };

  setTimeout(() => {
    if (!claimed) popup.remove();
  }, 5000);
}

/* =========================
   DAILY QUEST SYSTEM (ONLY 1 ACTIVE DAY)
   ========================= */

function claimDay(day) {
  let today = new Date().toDateString();

  if (user.dailyClaimed[today]) {
    showPopup("You already completed today’s quest.");
    return;
  }

  user.dailyClaimed[today] = day;

  user.xp += 20;

  saveUser();

  showXP(20);
  updateLevelUI();
  updateDaysUI();

  showPopup(`Day ${day} completed. +20 XP earned.`);
}

/* =========================
   BUTTON STATES
   ========================= */

function updateDaysUI() {
  let today = new Date().toDateString();

  for (let i = 1; i <= 7; i++) {
    let btn = document.getElementById("day" + i);
    if (!btn) continue;

    if (user.dailyClaimed[today] === i) {
      btn.innerText = "Completed";
      btn.disabled = true;
      btn.style.opacity = 0.5;
    } else {
      btn.disabled = i !== getTodayDay();
      btn.style.opacity = i !== getTodayDay() ? 0.3 : 1;
    }
  }
}

/* =========================
   STREAK SYSTEM
   ========================= */

function updateStreak() {
  let today = new Date().toDateString();

  if (user.lastLogin !== today) {
    if (user.lastLogin) {
      let last = new Date(user.lastLogin);
      let now = new Date(today);

      let diff = (now - last) / (1000 * 60 * 60 * 24);

      if (diff === 1) user.streak += 1;
      else user.streak = 1;
    } else {
      user.streak = 1;
    }

    user.lastLogin = today;
  }
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
   SAVE
   ========================= */

function saveUser() {
  localStorage.setItem("user", JSON.stringify(user));
}

/* =========================
   NAV (optional safe)
   ========================= */

function enterClass(className) {
  localStorage.setItem("currentClass", className);
  window.location.href = "class.html";
}

function openLesson(url) {
  localStorage.setItem("lessonLink", url);
  window.location.href = "lesson.html";
}
