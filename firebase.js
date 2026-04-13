// Firebase core
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";

// Auth + Firestore (IMPORTANT — missing in your version)
import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* =========================
   CONFIG
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

/* =========================
   INIT APP
   ========================= */

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

/* =========================
   EXPORTS (THIS IS WHAT YOUR DASHBOARD NEEDS)
   ========================= */

export const auth = getAuth(app);
export const db = getFirestore(app);
