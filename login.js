import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBMc36-Vg_Ger814ZWz_JHs7KG-csgGggA",
  authDomain: "vermeil-quest.firebaseapp.com",
  projectId: "vermeil-quest",
  storageBucket: "vermeil-quest.firebasestorage.app",
  messagingSenderId: "943194791633",
  appId: "1:943194791633:web:a3ddd0f3914f518171aff0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.login = async function () {
  const id = document.getElementById("studentId").value;
  const password = document.getElementById("password").value;

  if (!id || !password) {
    alert("Enter ID and password");
    return;
  }

  try {
    const ref = doc(db, "students", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      alert("Student not found in database");
      return;
    }

    const data = snap.data();

    // SIMPLE PASSWORD SYSTEM (ID = password)
    if (password !== id) {
      alert("Wrong password");
      return;
    }

    // SAVE TO LOCAL (dashboard depends on this)
    localStorage.setItem("user", JSON.stringify({
      id: id,
      name: data.name,
      section: data.section,
      xp: data.xp || 0,
      level: data.level || 1,
      streak: data.streak || 0,
      dailyClaimed: data.dailyClaimed || {}
    }));

    window.location.href = "dashboard.html";

  } catch (err) {
    console.log(err);
    alert("Login failed. Check console.");
  }
};
