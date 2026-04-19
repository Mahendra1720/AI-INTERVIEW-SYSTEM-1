const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.static("public"));

console.log("🔥 FINAL SERVER RUNNING");

// 🔥 QUESTIONS (WITH HARD FALLBACK)
app.post("/ai-questions", async (req, res) => {
  const { project } = req.body;

  console.log("➡️ Request received:", project);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `Generate 5 interview questions for project: ${project}`
      })
    });

    const data = await response.json();
    console.log("✅ OpenAI response:", data);

    const text =
      data.output?.[0]?.content?.[0]?.text ||
      data.output_text ||
      "";

    if (!text) throw new Error("Empty AI response");

    const questions = text
      .split("\n")
      .map(q => q.replace(/^\d+[\).\s-]*/, "").trim())
      .filter(q => q.length > 0);

    return res.json({ questions });

  } catch (err) {
    console.log("❌ AI FAILED → USING FALLBACK");

    return res.json({
      questions: [
        `Explain your project "${project}"`,
        "What technologies did you use?",
        "What challenges did you face?",
        "How did you test your system?",
        "What improvements will you make?"
      ]
    });
  }
});

// 🔥 EVALUATION (WITH HARD FALLBACK)
app.post("/ai-evaluate", async (req, res) => {
  const { answer } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `Give score out of 10 and feedback:\n${answer}`
      })
    });

    const data = await response.json();

    const result =
      data.output?.[0]?.content?.[0]?.text ||
      data.output_text ||
      "";

    if (!result) throw new Error("Empty result");

    return res.json({ result });

  } catch (err) {
    console.log("❌ AI FAILED → LOCAL SCORE");

    const words = answer.trim().split(/\s+/).length;

    let score = 0;
    let feedback = "";

    if (words < 10) {
      score = 2;
      feedback = "Too short";
    } else if (words >= 20 && words <= 30) {
      score = 6;
      feedback = "Good";
    } else if (words >= 50) {
      score = 10;
      feedback = "Excellent";
    } else {
      score = 5;
      feedback = "Average";
    }

    return res.json({
      result: `Score: ${score}/10 - ${feedback}`
    });
  }
});

app.listen(3000, () => {
  console.log("🚀 http://localhost:3000");
});