function login() {
  const id = document.getElementById("studentId").value;
  const pass = document.getElementById("password").value;

  // fake database
  const users = [
    { id: "2301040030", password: "2301040030", name: "Kraeza Mae Tabinga" }
  ];

  const foundUser = users.find(u => u.id === id && u.password === pass);

  if (!foundUser) {
    alert("Invalid credentials");
    return;
  }

  let user = {
    id: foundUser.id,
    name: foundUser.name,
    xp: 0,
    level: 1,
    streak: 0,
    lastLogin: null,
    dailyClaimed: {}
  };

  localStorage.setItem("user", JSON.stringify(user));

  window.location.href = "dashboard.html";
}
