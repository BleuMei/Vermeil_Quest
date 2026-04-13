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
   INIT
========================= */

window.onload = async () => {
  await loadUserFromFirebase();

  renderUI();
  updateLevelUI();
  highlightToday();
  syncStreakUI();
};

/* =========================
   FIREBASE LOAD
========================= */

async function loadUserFromFirebase() {
  userRef = doc(db, "students", user.id);

  const snap = await getDoc(userRef);

  if (snap.exists()) {
    user = { ...user, ...snap.data() };
  } else {
    await setDoc(userRef, user);
  }

  saveLocal();
}

/* =========================
   UI RENDER
========================= */

function renderUI() {
  document.getElementById("name").innerText = user.name || "Unknown";
  document.getElementById("id").innerText = user.id;

  if (user.section) {
    const p = document.createElement("p");
    p.innerText = `Section: ${user.section}`;
    document.querySelector(".profile-card").appendChild(p);
  }
}

/* =========================
   SAVE
========================= */

async function saveUser() {
  saveLocal();
  if (userRef) await updateDoc(userRef, user);
}

function saveLocal() {
  localStorage.setItem("user", JSON.stringify(user));
}

/* =========================
   LESSON REDIRECT FIXED
========================= */

window.openLesson = function (url) {
  if (!url) return;
  window.location.href = url;
};

/* =========================
   XP + MANA BAR
========================= */

function addXP(amount = 10) {
  user.xp += amount;

  saveUser();
  updateLevelUI();
  showXP(amount);
}

function updateLevelUI() {
  const newLevel = Math.floor(user.xp / 100) + 1;
  const progress = user.xp % 100;

  const leveledUp = newLevel > user.level;
  user.level = newLevel;

  document.getElementById("level").innerText = newLevel;
  document.getElementById("xp").innerText = `${progress} / 100`;

  const bar = document.getElementById("xpBar");

  if (bar) {
    bar.style.width = `${progress}%`;
    bar.classList.add("mana-pulse");

    setTimeout(() => bar.classList.remove("mana-pulse"), 500);
  }

  saveUser();

  if (leveledUp) showLevelUpScreen(newLevel);
}

/* =========================
   DAILY QUEST SYSTEM
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
   CLAIM DAY (FIXED + FEEDBACK)
========================= */

window.claimDay = function (day) {
  const today = todayIndex();

  if (day !== today) {
    return popup("That quest is locked today.");
  }

  if (user.lastClaimDate === todayStr()) {
    return popup("Already claimed today.");
  }

  // MARK CLAIM
  user.lastClaimDate = todayStr();

  user.dailyClaimed = {};
  user.dailyClaimed[day] = true;

  // XP reward
  user.xp += 20;

  // STREAK LOGIC (Duolingo-style simplified)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (user.lastLogin === yesterday.toDateString()) {
    user.streak += 1;
  } else if (!user.lastLogin || user.lastLogin !== todayStr()) {
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
