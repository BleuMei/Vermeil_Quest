import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  enableIndexedDbPersistence
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

/* =========================
   INIT APP (ONLY ONCE)
========================= */

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* OPTIONAL: offline support (won’t crash app if it fails) */
enableIndexedDbPersistence(db).catch(() => {
  console.log("Offline persistence not enabled (ignored)");
});

/* =========================
   SAFE WRAPPERS
========================= */

export async function getUserDoc(collection, id) {
  try {
    const ref = doc(db, collection, id);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.error("getUserDoc failed:", err);
    return null;
  }
}

export async function createUserDoc(collection, id, data) {
  try {
    const ref = doc(db, collection, id);
    await setDoc(ref, data);
  } catch (err) {
    console.error("createUserDoc failed:", err);
  }
}

export async function updateUserDoc(collection, id, data) {
  try {
    const ref = doc(db, collection, id);
    await updateDoc(ref, data);
  } catch (err) {
    console.error("updateUserDoc failed:", err);
  }
}

/* =========================
   SAFE DOC REFERENCE EXPORT
========================= */

export function getDocRef(collection, id) {
  return doc(db, collection, id);
}
