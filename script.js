let questions = [];
let index = 0;

// 🚀 START INTERVIEW
async function startInterview() {
  const project = document.getElementById("project").value;

  if (!project) {
    alert("Enter project title");
    return;
  }

  try {
    const res = await fetch("/ai-questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ project })
    });

    const data = await res.json();

    questions = data.questions;
    index = 0;

    showQuestion();

  } catch (err) {
    alert("Error fetching questions");
  }
}

// 📌 SHOW QUESTION
function showQuestion() {
  if (index < questions.length) {
    document.getElementById("question").innerText = questions[index];
    document.getElementById("answer").value = "";
    document.getElementById("score").innerText = "";
  } else {
    document.getElementById("question").innerText = "🎉 Interview Completed!";
  }
}

// 📝 SUBMIT ANSWER
async function submitAnswer() {
  const answer = document.getElementById("answer").value;

  if (!answer) {
    alert("Enter answer");
    return;
  }

  try {
    const res = await fetch("/ai-evaluate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ answer })
    });

    const data = await res.json();

    document.getElementById("score").innerText = data.result;

    index++;
    setTimeout(showQuestion, 1500);

  } catch (err) {
    alert("Error submitting answer");
  }
}

// 🎤 SPEECH TO TEXT
function startSpeech() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Use Chrome browser for speech");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";

  recognition.onresult = function (event) {
    document.getElementById("answer").value =
      event.results[0][0].transcript;
  };

  recognition.start();
}