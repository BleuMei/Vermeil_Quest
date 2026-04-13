/* =========================
   FIREBASE IMPORT
========================= */

import { db } from "./firebase.js";
import { doc, getDoc, setDoc, updateDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
    console.log("Firebase failed, using local", err);
    loadUserUI();
  }
}

/* =========================
   UI LOAD
========================= */

function loadUserUI() {
  document.getElementById("name").innerText = user.name;
  document.getElementById("id").innerText = user.id;
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
      dailyClaimed: user.dailyClaimed
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

function openLesson(url) {
  if (!url) return;
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

  const leveledUp = level > user.level;
  user.level = level;

  const levelEl = document.getElementById("level");
  const xpEl = document.getElementById("xp");
  const bar = document.getElementById("xpBar");

  if (levelEl) levelEl.innerText = level;
  if (xpEl) xpEl.innerText = `${progress} / 100`;

  if (bar) {
    bar.style.width = `${progress}%`;
    bar.style.transition = "width 0.6s ease";

    bar.style.boxShadow = "0 0 20px rgba(96,165,250,0.7)";
    setTimeout(() => {
      bar.style.boxShadow = "0 0 6px rgba(96,165,250,0.2)";
    }, 600);
  }

  saveUser();

  if (leveledUp) showLevelUpScreen(level);
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

    if (i === today) el.classList.add("active");
    else el.classList.add("locked");
  }
}

/* =========================
   DAILY POPUP
========================= */

function showDailyPopup() {
  const popup = document.createElement("div");
  popup.className = "center-popup";

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

  setTimeout(() => popup.remove(), 5000);
}

/* =========================
   CLAIM DAY
========================= */

function claimDay(day) {
  const today = getTodayIndex();

  if (day !== today) return showPopup("Locked quest.");
  if (user.dailyClaimed[day]) return showPopup("Already claimed.");

  user.dailyClaimed = {};
  user.dailyClaimed[day] = new Date().toDateString();

  user.xp += 20;

  saveUser();
  updateLevelUI();
  highlightToday();

  showPopup("+20 XP earned");
}

/* =========================
   STREAK
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
  setTimeout(() => p.remove(), 4000);
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
