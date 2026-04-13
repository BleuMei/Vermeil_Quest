function login() {
  const id = document.getElementById("studentId").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (!id || !pass) {
    alert("Please enter your Student ID and password");
    return;
  }

  // fake database
  const users = [
    { id: "2301040030", password: "2301040030", name: "Kraeza Mae Tabinga" }
  ];

  const foundUser = users.find(u => u.id === id && u.password === pass);

  if (!foundUser) {
    alert("Invalid credentials");
    return;
  }

  // CHECK IF USER ALREADY EXISTS (IMPORTANT FIX)
  let existingUser = JSON.parse(localStorage.getItem("user"));

  let user = existingUser && existingUser.id === foundUser.id
    ? existingUser
    : {
        id: foundUser.id,
        name: foundUser.name,
        xp: 0,
        level: 1,
        streak: 0,
        lastLogin: null,
        dailyClaimed: {}
      };

  // UPDATE LOGIN STREAK LOGIC
  const today = new Date().toDateString();

  if (user.lastLogin !== today) {
    user.streak += 1;
    user.lastLogin = today;
  }

  localStorage.setItem("user", JSON.stringify(user));

  window.location.href = "dashboard.html";
}
