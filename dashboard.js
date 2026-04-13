let user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "index.html";
}

/* SAFE DEFAULTS */
user.xp = user.xp || 0;
user.level = user.level || 1;
user.streak = user.streak || 0;
user.dailyClaimed = user.dailyClaimed || {};
user.lastLogin = user.lastLogin || null;

/* =========================
   INIT
   ========================= */

window.onload = () => {
  loadUser();
  updateStreak();
  updateLevelUI();
  highlightToday();
  showDailyPopup();
};

/* =========================
   LOAD USER
   ========================= */

function loadUser() {
  document.getElementById("name").innerText = user.name;
  document.getElementById("id").innerText = user.id;
}

/* =========================
   CLASS NAVIGATION (FIXED SAFE)
   ========================= */

function openLesson(url) {
  if (!url) return;

  localStorage.setItem("lessonLink", url);

  // force navigation (extra safety)
  window.location.href = url;
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

  const levelEl = document.getElementById("level");
  const xpEl = document.getElementById("xp");
  const bar = document.getElementById("xpBar");

  if (levelEl) levelEl.innerText = level;
  if (xpEl) xpEl.innerText = `${progress} / 100`;
  if (bar) bar.style.width = `${progress}%`;

  saveUser();
}

/* =========================
   DAILY SYSTEM
   ========================= */

function getTodayIndex() {
  return (new Date().getDate() % 7) + 1;
}

function highlightToday() {
  const today = getTodayIndex();

  for (let i = 1; i <= 7; i++) {
    const el = document.getElementById("day" + i);
    if (!el) continue;

    el.classList.remove("active", "locked");

    if (i === today) {
      el.classList.add("active");
    } else {
      el.classList.add("locked");
    }
  }
}

/* =========================
   DAILY POPUP (LOGIN EVENT)
   ========================= */

let popupOpen = false;
let popupElement = null;

function showDailyPopup() {
  if (popupOpen) return;
  popupOpen = true;

  // remove old popup if stuck
  if (popupElement) popupElement.remove();

  const popup = document.createElement("div");
  popup.className = "center-popup";
  popupElement = popup;

  const today = getTodayIndex();

  popup.innerHTML = `
    <h3>Daily Quest Available</h3>
    <p>Only today’s quest can be claimed</p>

    <div class="day-grid">
      ${Array.from({ length: 7 }, (_, i) => i + 1)
        .map(day => `
          <div class="day-box ${day === today ? "active" : "locked"}"
               onclick="claimDay(${day})">
            Day ${day}
          </div>
        `).join("")}
    </div>
  `;

  document.body.appendChild(popup);

  const timeout = setTimeout(() => {
    closePopup();
  }, 5000);

  function closePopup() {
    if (!popupOpen) return;

    popupOpen = false;
    popup.remove();
    popupElement = null;
    clearTimeout(timeout);
    document.removeEventListener("click", outsideClick);
  }

  function outsideClick() {
    closePopup();
  }

  document.addEventListener("click", outsideClick);
}

/* =========================
   CLAIM DAY
   ========================= */

function claimDay(day) {
  const today = getTodayIndex();

  if (day !== today) {
    showPopup("That quest is locked for today.");
    return;
  }

  if (user.dailyClaimed[day]) {
    showPopup("Already completed today.");
    return;
  }

  user.dailyClaimed = {};
  user.dailyClaimed[day] = new Date().toDateString();

  user.xp += 20;

  saveUser();
  updateLevelUI();
  highlightToday();

  showPopup(`Quest Complete: Day ${day} +20 XP`);
}

/* =========================
   STREAK SYSTEM
   ========================= */

function updateStreak() {
  const today = new Date().toDateString();

  if (user.lastLogin !== today) {
    user.streak = user.lastLogin ? user.streak + 1 : 1;
    user.lastLogin = today;
  }

  saveUser();
}

/* =========================
   XP POPUP
   ========================= */

function showXP(amount) {
  const popup = document.createElement("div");
  popup.className = "xp-popup";
  popup.innerText = `+${amount} XP`;

  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 1200);
}

/* =========================
   CENTER POPUP
   ========================= */

let messageLock = false;

function showPopup(message) {
  if (messageLock) return;
  messageLock = true;

  const popup = document.createElement("div");
  popup.className = "center-popup";
  popup.innerText = message;

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
    messageLock = false;
  }, 5000);
}

/* =========================
   SAVE
   ========================= */

function saveUser() {
  localStorage.setItem("user", JSON.stringify(user));
}

/* =========================
   BURGER MENU LOGIC
   ========================= */

function toggleMenu() {
  const menu = document.getElementById("sideMenu");
  menu.classList.toggle("open");
}

function closeMenu() {
  const menu = document.getElementById("sideMenu");
  if (menu) menu.classList.remove("open");
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

/* =========================
   CHEST REWARD SYSTEM
   ========================= */

function showChest() {
  const chest = document.getElementById("rewardChest");

  if (!chest) return;

  chest.classList.remove("hidden");
  chest.classList.add("shake");

  setTimeout(() => {
    chest.classList.remove("shake");
  }, 1200);
}

function openChest() {
  const chest = document.getElementById("rewardChest");

  chest.innerText = "✨";
  chest.classList.remove("shake");

  // reward logic
  let reward = 20;

  user.xp += reward;
  saveUser();
  updateLevelUI();

  showFloatingReward(`+${reward} XP`);

  setTimeout(() => {
    chest.classList.add("hidden");
  }, 800);
}

function showFloatingReward(text) {
  const popup = document.createElement("div");
  popup.className = "xp-popup";
  popup.innerText = text;

  document.body.appendChild(popup);

  setTimeout(() => popup.remove(), 1200);
}
