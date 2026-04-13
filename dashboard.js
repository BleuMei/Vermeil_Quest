let user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "index.html";
}

/* SAFE DEFAULTS */
user.dailyClaimed = user.dailyClaimed || {};
user.lastLogin = user.lastLogin || null;

/* =========================
   INIT
   ========================= */

window.onload = () => {
  loadUser();
  updateStreak();
  showDailyPopup(); // THIS is your login popup
};

/* =========================
   UI LOAD
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
   DAILY POPUP (7 DAYS BOX)
   ========================= */

function showDailyPopup() {
  const popup = document.getElementById("dailyPopup");

  const days = Array.from({ length: 7 }, (_, i) => i + 1);

  let todayIndex = getTodayIndex(); // only ONE active day

  popup.innerHTML = `
    <h3>Daily Quest</h3>
    <p>Claim your reward for today</p>
    <div class="day-grid">
      ${days.map(day => `
        <div class="day-box ${day === todayIndex ? "active" : "locked"}"
             onclick="claimDay(${day})">
          Day ${day}
        </div>
      `).join("")}
    </div>
  `;

  popup.classList.remove("hidden");

  let timeout = setTimeout(() => {
    popup.remove();
  }, 5000);

  document.addEventListener("click", function handler() {
    popup.remove();
    clearTimeout(timeout);
    document.removeEventListener("click", handler);
  });
}

/* ONLY ONE DAY PER DAY */
function getTodayIndex() {
  let today = new Date().getDate();
  return (today % 7) + 1;
}

/* =========================
   CLAIM DAY
   ========================= */

function claimDay(day) {
  let todayIndex = getTodayIndex();

  if (day !== todayIndex) {
    showXPMessage("Only today’s quest is available.");
    return;
  }

  if (user.dailyClaimed[day]) {
    showXPMessage("Already claimed today.");
    return;
  }

  user.dailyClaimed = {};
  user.dailyClaimed[day] = new Date().toDateString();

  user.xp += 20;

  saveUser();
  updateLevelUI();

  showXPMessage(`Quest Complete: Day ${day} +20 XP`);
}

/* =========================
   STREAK SYSTEM
   ========================= */

function updateStreak() {
  let today = new Date().toDateString();

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
   CENTER MESSAGE POPUP
   ========================= */

function showXPMessage(message) {
  const popup = document.createElement("div");
  popup.className = "center-popup";
  popup.innerText = message;

  document.body.appendChild(popup);

  setTimeout(() => popup.remove(), 5000);

  document.addEventListener("click", function handler() {
    popup.remove();
    document.removeEventListener("click", handler);
  });
}

/* =========================
   SAVE
   ========================= */

function saveUser() {
  localStorage.setItem("user", JSON.stringify(user));
}
