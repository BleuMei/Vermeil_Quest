import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =========================
   FIREBASE
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyBMc36-Vg_Ger814ZWz_JHs7KG-csgGggA",
  authDomain: "vermeil-quest.firebaseapp.com",
  projectId: "vermeil-quest",
  storageBucket: "vermeil-quest.firebasestorage.app",
  messagingSenderId: "943194791633",
  appId: "1:943194791633:web:a3ddd0f3914f518171aff0",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =========================
   USER SAFE LOAD
========================= */

let user = null;
let userRef = null;

try {
  user = JSON.parse(localStorage.getItem("user"));
} catch (e) {
  user = null;
}

if (!user || !user.id) {
  window.location.href = "index.html";
}

/* fallback safety */
user = user || {};
user.xp ??= 0;
user.level ??= 1;
user.streak ??= 0;
user.lastLogin ??= null;
user.lastClaimDate ??= null;
user.dailyClaimed ??= {};

/* =========================
   INIT SAFE BOOTSTRAP
========================= */

document.addEventListener("DOMContentLoaded", () => {
  init().catch(err => {
    console.error("Dashboard init failed:", err);

    // IMPORTANT: still make UI usable even if Firebase dies
    attachDayListeners();
    highlightToday();
  });
});

async function init() {
  await loadUser();

  renderUI();
  updateLevelUI();
  highlightToday();
  syncStreakUI();
  attachDayListeners();
}

/* =========================
   FIREBASE (NON-FATAL)
========================= */

async function loadUser() {
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
    console.warn("Firebase offline mode:", err);
  }
}

/* =========================
   SAVE
========================= */

async function saveUser() {
  saveLocal();

  try {
    if (userRef) {
      await updateDoc(userRef, user);
    }
  } catch (e) {
    console.warn("Save failed:", e);
  }
}

function saveLocal() {
  localStorage.setItem("user", JSON.stringify(user));
}

/* =========================
   UI
========================= */

function renderUI() {
  const name = document.getElementById("name");
  const id = document.getElementById("id");

  if (name) name.innerText = user.name || "Unknown";
  if (id) id.innerText = user.id;
}

/* =========================
   LESSONS
========================= */

window.openLesson = (url) => {
  if (url) window.location.href = url;
};

/* =========================
   XP + LEVEL
========================= */

function updateLevelUI() {
  const newLevel = Math.floor(user.xp / 100) + 1;
  const progress = user.xp % 100;

  user.level = newLevel;

  const levelEl = document.getElementById("level");
  const xpEl = document.getElementById("xp");
  const bar = document.getElementById("xpBar");

  if (levelEl) levelEl.innerText = newLevel;
  if (xpEl) xpEl.innerText = `${progress}/100`;

  if (bar) {
    bar.style.width = `${progress}%`;
  }

  saveUser();
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

function highlightToday() {
  const today = todayIndex();

  for (let i = 1; i <= 7; i++) {
    const el = document.getElementById("day" + i);
    if (!el) continue;

    el.classList.remove("glow");

    if (i === today) {
      el.classList.add("glow");
    }
  }
}

/* =========================
   CRITICAL FIX: CLICK ALWAYS WORKS
========================= */

function attachDayListeners() {
  for (let i = 1; i <= 7; i++) {
    const el = document.getElementById("day" + i);
    if (!el) continue;

    el.style.pointerEvents = "auto";
    el.style.cursor = "pointer";

    el.onclick = () => claimDay(i);
  }
}

window.claimDay = function (day) {
  const today = todayIndex();

  if (day !== today) return popup("Locked today.");
  if (user.lastClaimDate === todayStr()) return popup("Already claimed.");

  user.lastClaimDate = todayStr();
  user.xp += 20;

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

  popup("Quest cleared +20 XP 🔥");
};

function syncStreakUI() {
  const el = document.getElementById("streak");
  if (el) el.innerText = user.streak;
}

/* =========================
   POPUPS
========================= */

function popup(text) {
  const p = document.createElement("div");
  p.className = "center-popup";
  p.innerText = text;

  document.body.appendChild(p);
  setTimeout(() => p.remove(), 2000);
}
