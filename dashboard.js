/* =========================
   FIREBASE INIT
   ========================= */

// Firebase v9 modular import style (CDN / Vite compatible)
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your config
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

/* fallback defaults */
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
    userRef = doc(db, "users", user.id);

    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      user = { ...user, ...data };
    } else {
      await setDoc(userRef, user);
    }

    saveLocal();
    loadUserUI();

  } catch (err) {
    console.log("Firebase error, using local data", err);
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
   SAVE SYSTEM (FIREBASE + LOCAL)
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
   LEVEL SYSTEM (MANA STYLE BAR)
   ========================= */

function updateLevelUI() {
  let level = Math.floor(user.xp / 100) + 1;
  let progress = user.xp % 100;

  const leveledUp = user.level && level > user.level;
  user.level = level;

  const levelEl = document.getElementById("level");
  const xpEl = document.getElementById("xp");
  const bar = document.getElementById("xpBar");

  if (levelEl) levelEl.innerText = level;
  if (xpEl) xpEl.innerText = `${progress} / 100`;

  if (bar) {
    bar.style.width = `${progress}%`;
    bar.style.transition = "width 0.6s ease";

    // mana pulse
    bar.style.boxShadow = "0 0 20px rgba(96,165,250,0.7)";
    setTimeout(() => {
      bar.style.boxShadow = "0 0 6px rgba(96,165,250,0.2)";
    }, 600);
  }

  saveUser();

  if (leveledUp) {
    showLevelUpScreen(level);
  }
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

let popupOpen = false;

function showDailyPopup() {
  if (popupOpen) return;
  popupOpen = true;

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

  setTimeout(() => {
    popup.remove();
    popupOpen = false;
  }, 5000);
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

  showPopup(`+20 XP earned`);
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

let messageLock = false;

function showPopup(message) {
  if (messageLock) return;
  messageLock = true;

  const p = document.createElement("div");
  p.className = "center-popup";
  p.innerText = message;

  document.body.appendChild(p);

  setTimeout(() => {
    p.remove();
    messageLock = false;
  }, 4000);
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

async function addStudent(db, studentId, name, section) {
  await setDoc(doc(db, "users", studentId), {
    id: studentId,
    name: name,
    section: section,
    xp: 0,
    level: 1,
    streak: 0,
    dailyClaimed: {}
  });
}
