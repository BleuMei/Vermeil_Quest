function login() {
  const id = document.getElementById("studentId").value;
  const pass = document.getElementById("password").value;

  // fake database
  const users = [
    { id: "2301040030", password: "2301040030", name: "Kraeza Mae Tabinga", xp: 0, streak: 0 }
  ];

  const user = users.find(u => u.id === id && u.password === pass);

  if (!user) {
    alert("Invalid credentials");
    return;
  }

  localStorage.setItem("user", JSON.stringify(user));
  window.location.href = "dashboard.html";
}
