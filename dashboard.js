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

if (!user) window.location.href = "index.html";

user.xp ??= 0;
user.level ??= 1;
user.streak ??= 0;
user.lastLogin ??= null;
user.lastClaimDate ??= null;
user.dailyClaimed ??= {};

let userRef;

/* =========================
   SAFE INIT (IMPORTANT FIX)
========================= */

document.addEventListener("DOMContentLoaded", init);

async function init() {
  await loadUserFromFirebase();

  renderUI();
  updateLevelUI();
  highlightToday();
  syncStreakUI();

  // IMPORTANT: make sure clicks work even if HTML was dynamic
  attachDayListeners();
}

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
  } catch (err) {
    console.log("Firebase error:", err);
  }
}

/* =========================
   UI
========================= */

function renderUI() {
  const name = document.getElementById("name");
  const id = document.getElementById("id");
  const section = document.querySelector(".profile-card");

  if (name) name.innerText = user.name || "Unknown";
  if (id) id.innerText = user.id;

  if (user.section && section) {
    const p = document.createElement("p");
    p.innerText = `Section: ${user.section}`;
    section.appendChild(p);
  }
}

/* =========================
   SAVE
========================= */

async function saveUser() {
  saveLocal();

  if (!userRef) return;

  try {
    await updateDoc(userRef, user);
  } catch (err) {
    console.log("Save failed:", err);
  }
}

function saveLocal() {
  localStorage.setItem("user", JSON.stringify(user));
}

/* =========================
   LESSON REDIRECT (GLOBAL FIX)
========================= */

window.openLesson = function (url) {
  if (!url) return;
  window.location.href = url;
};

/* =========================
   XP SYSTEM
========================= */

function addXP(amount = 10) {
  user.xp += amount;

  saveUser();
  updateLevelUI();
  showXP(amount);
}

/* =========================
   LEVEL / MANA BAR
========================= */

function updateLevelUI() {
  const newLevel = Math.floor(user.xp / 100) + 1;
  const progress = user.xp % 100;

  const leveledUp = newLevel > user.level;
  user.level = newLevel;

  const levelEl = document.getElementById("level");
  const xpEl = document.getElementById("xp");
  const bar = document.getElementById("xpBar");

  if (levelEl) levelEl.innerText = newLevel;
  if (xpEl) xpEl.innerText = `${progress} / 100`;

  if (bar) {
    bar.style.width = `${progress}%`;
    bar.classList.add("mana-pulse");

    setTimeout(() => bar.classList.remove("mana-pulse"), 500);
  }

  saveUser();

  if (leveledUp) showLevelUpScreen(newLevel);
}

/* =========================
   DAILY SYSTEM
========================= */

function todayIndex() {
  return (new Date().getDate() % 7) + 1;
}

function todayStr() {
  return new Date().toDateString();
}

/* VISUAL HIGHLIGHT */
function highlightToday() {
  const today = todayIndex();

  for (let i = 1; i <= 7; i++) {
    const el = document.getElementById("day" + i);
    if (!el) continue;

    el.classList.remove("active", "glow");

    if (i === today) {
      el.classList.add("glow");
    }
  }
}

/* =========================
   FIX: ENSURE CLICK WORKS
========================= */

function attachDayListeners() {
  for (let i = 1; i <= 7; i++) {
    const el = document.getElementById("day" + i);

    if (!el) continue;

    el.style.cursor = "pointer";

    el.onclick = () => claimDay(i);
  }
}

/* =========================
   CLAIM DAY (FIXED STREAK + POPUP)
========================= */

window.claimDay = function (day) {
  const today = todayIndex();

  if (day !== today) {
    return popup("That quest is locked today.");
  }

  if (user.lastClaimDate === todayStr()) {
    return popup("Already claimed today.");
  }

  user.lastClaimDate = todayStr();
  user.dailyClaimed = {};
  user.dailyClaimed[day] = true;

  user.xp += 20;

  // streak logic (simple but stable)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (user.lastLogin === yesterday.toDateString()) {
    user.streak += 1;
  } else {
    user.streak = 1;
  }

  user.lastLogin = todayStr();

  saveUser();
  updateLevelUI();
  syncStreakUI();

  showXP(20);
  popup("Quest cleared +20 XP 🔥 Streak: " + user.streak);
};

/* =========================
   STREAK UI
========================= */

function syncStreakUI() {
  const el = document.getElementById("streak");
  if (el) el.innerText = user.streak;
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

function popup(text) {
  const p = document.createElement("div");
  p.className = "center-popup";
  p.innerText = text;

  document.body.appendChild(p);
  setTimeout(() => p.remove(), 2500);
}

/* =========================
   LEVEL UP
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
