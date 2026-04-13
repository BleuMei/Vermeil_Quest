/* =========================
   FIREBASE IMPORT
========================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =========================
   FIREBASE CONFIG
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyBMc36-Vg_Ger814ZWz_JHs7KG-csgGggA",
  authDomain: "vermeil-quest.firebaseapp.com",
  projectId: "vermeil-quest",
  storageBucket: "vermeil-quest.firebasestorage.app",
  messagingSenderId: "943194791633",
  appId: "1:943194791633:web:a3ddd0f3914f518171aff0",
  measurementId: "G-02CJBN8HS9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =========================
   USER STATE
========================= */

let user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "index.html";
}

user.xp ||= 0;
user.level ||= 1;
user.streak ||= 0;
user.dailyClaimed ||= {};
user.lastLogin ||= null;

let userRef;

/* =========================
   INIT
========================= */

window.onload = async () => {
  await loadUserFromFirebase();

  updateStreak();
  updateLevelUI();
  highlightToday();
  showDailyPopup();
};

/* =========================
   FIREBASE LOAD
========================= */

async function loadUserFromFirebase() {
  try {
    userRef = doc(db, "students", user.id);

    const snap = await getDoc(userRef);

    if (snap.exists()) {
      user = { ...user, ...snap.data() };
    } else {
      await setDoc(userRef, user);
    }

    saveLocal();
    loadUserUI();

  } catch (err) {
    console.log("Firebase failed:", err);
    loadUserUI();
  }
}

/* =========================
   UI
========================= */

function loadUserUI() {
  document.getElementById("name").innerText = user.name;
  document.getElementById("id").innerText = user.id;
  document.getElementById("level").innerText = user.level;
  document.getElementById("xp").innerText = `${user.xp % 100} / 100`;
}

/* =========================
   SAVE SYSTEM
========================= */

async function saveUser() {
  saveLocal();

  if (!userRef) return;

  try {
    await updateDoc(userRef, {
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      dailyClaimed: user.dailyClaimed,
      lastLogin: user.lastLogin
    });
  } catch (err) {
    console.log("Save failed:", err);
  }
}

function saveLocal() {
  localStorage.setItem("user", JSON.stringify(user));
}

/* =========================
   CLASS NAVIGATION
========================= */

window.openLesson = function (url) {
  if (!url) return;
  window.location.href = url;
};

/* =========================
   XP SYSTEM (MANA BAR FIXED)
========================= */

function addXP(amount = 10) {
  user.xp += amount;

  saveUser();
  showXP(amount);
  updateLevelUI();
}

/* =========================
   LEVEL SYSTEM (MANA BAR)
========================= */

function updateLevelUI() {
  let newLevel = Math.floor(user.xp / 100) + 1;
  let progress = user.xp % 100;

  const leveledUp = newLevel > user.level;
  user.level = newLevel;

  const levelEl = document.getElementById("level");
  const xpEl = document.getElementById("xp");
  const bar = document.getElementById("xpBar");

  if (levelEl) levelEl.innerText = newLevel;
  if (xpEl) xpEl.innerText = `${progress} / 100`;

  if (bar) {
    bar.style.width = `${progress}%`;
    bar.style.transition = "width 0.6s ease";

    // MANA PULSE EFFECT
    bar.style.boxShadow = "0 0 22px rgba(96,165,250,0.8)";
    setTimeout(() => {
      bar.style.boxShadow = "0 0 8px rgba(96,165,250,0.2)";
    }, 600);
  }

  saveUser();

  if (leveledUp) showLevelUpScreen(newLevel);
}

/* =========================
   DAILY SYSTEM
========================= */

function getTodayIndex() {
  return (new Date().getDate() % 7) + 1;
}

/* VISUAL FIX: ACTIVE DAY POPS */
function highlightToday() {
  const today = getTodayIndex();

  for (let i = 1; i <= 7; i++) {
    const el = document.getElementById("day" + i);
    if (!el) continue;

    el.classList.remove("active", "locked", "glow");

    if (i === today) {
      el.classList.add("active", "glow");
    } else {
      el.classList.add("locked");
    }
  }
}

/* =========================
   DAILY POPUP (FIXED FEEDBACK)
========================= */

function showDailyPopup() {
  const popup = document.createElement("div");
  popup.className = "center-popup";

  const today = getTodayIndex();

  popup.innerHTML = `
    <h3>Daily Quest Available</h3>
    <p>Claim today’s quest for rewards</p>

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

  setTimeout(() => popup.remove(), 5000);
}

/* =========================
   CLAIM DAY (STREAK FIXED HERE)
========================= */

function claimDay(day) {
  const today = getTodayIndex();

  if (day !== today) return showPopup("That quest is locked.");
  if (user.dailyClaimed[day]) return showPopup("Already claimed today.");

  // reset + mark
  user.dailyClaimed = {};
  user.dailyClaimed[day] = new Date().toDateString();

  user.xp += 20;

  // IMPORTANT: streak now actually updates correctly
  const todayStr = new Date().toDateString();
  if (user.lastLogin !== todayStr) {
    user.streak = (user.streak || 0) + 1;
    user.lastLogin = todayStr;
  }

  saveUser();
  updateLevelUI();
  highlightToday();

  showXP(20);
  showPopup("+20 XP earned");
}

/* =========================
   STREAK (SAFETY SYNC)
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
   POPUPS
========================= */

function showXP(amount) {
  const p = document.createElement("div");
  p.className = "xp-popup";
  p.innerText = `+${amount} XP`;

  document.body.appendChild(p);
  setTimeout(() => p.remove(), 1200);
}

function showPopup(message) {
  const p = document.createElement("div");
  p.className = "center-popup";
  p.innerText = message;

  document.body.appendChild(p);
  setTimeout(() => p.remove(), 3500);
}

/* =========================
   LEVEL UP SCREEN
========================= */

function showLevelUpScreen(level) {
  const screen = document.getElementById("levelUpScreen");
  if (!screen) return;

  screen.classList.remove("hidden");

  screen.innerHTML = `
    <h1>LEVEL UP</h1>
    <p>You reached Level ${level}</p>
  `;

  setTimeout(() => screen.classList.add("hidden"), 2000);
}

/* =========================
   VISUAL GLOW CLASS (optional CSS hook)
========================= */
