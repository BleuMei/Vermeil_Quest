let user = JSON.parse(localStorage.getItem("user"));
let currentClass = localStorage.getItem("currentClass");

// DISPLAY CLASS NAME
document.getElementById("classTitle").innerText = currentClass;

// LESSON DATA (simple for now)
const lessons = {
  "CPE 101": {
    text: "Computer Engineering combines electrical engineering and computer science to develop hardware and software systems.",
    question: "What does Computer Engineering combine?",
    choices: ["Biology & Chemistry", "Electrical Engineering & Computer Science", "Math & Physics"],
    answer: 1
  },
  "CPE 102": {
    text: "Data Structures organize data for efficient access and modification.",
    question: "What is the purpose of data structures?",
    choices: ["To decorate programs", "To organize data efficiently", "To slow down systems"],
    answer: 1
  },
  "Math for Engineers": {
    text: "Engineering math includes algebra, calculus, and problem-solving techniques.",
    question: "Which is part of engineering math?",
    choices: ["Cooking", "Dancing", "Calculus"],
    answer: 2
  }
};

// LOAD LESSON
const lesson = lessons[currentClass];

document.getElementById("lessonText").innerText = lesson.text;
document.getElementById("question").innerText = lesson.question;

// RENDER CHOICES
let selected = null;

lesson.choices.forEach((choice, index) => {
  const btn = document.createElement("button");
  btn.innerText = choice;

  btn.onclick = () => {
    selected = index;

    // highlight selection
    document.querySelectorAll("#choices button").forEach(b => {
      b.style.background = "";
    });

    btn.style.background = "#1d4ed8";
  };

  document.getElementById("choices").appendChild(btn);
});

// SUBMIT ANSWER
function submitAnswer() {
  if (selected === null) {
    alert("Pick an answer first.");
    return;
  }

  if (selected === lesson.answer) {
    user.xp += 20;

    localStorage.setItem("user", JSON.stringify(user));

    alert("Correct! +20 XP 🎉");
  } else {
    alert("Wrong answer. Try again.");
    return;
  }

  window.location.href = "dashboard.html";
}
