// ------------------------- includes -------------------------
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ------------------------- /chat route -------------------------
app.get("/chat", async (req, res) => {
  try {
    const userText = req.query.text;
    if (!userText) return res.status(400).json({ error: "No text provided" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not set" });

    const response = await fetch(
      "https://generativeai.googleapis.com/v1beta2/models/text-bison-001:generate",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userText,
          temperature: 0.7,
          maxOutputTokens: 200
        }),
      }
    );

    const data = await response.json();

    // Safe parsing of Gemini response
    if (!data?.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error("Gemini response invalid:", data);
      return res.status(500).json({
        error: "Invalid response from Gemini API",
        raw: data
      });
    }

    const reply = data.candidates[0].content;
    res.json({ reply });

  } catch (err) {
    console.error("Error in /chat:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

// ------------------------- optional test route -------------------------
app.get("/", (req, res) => {
  res.send("RoboCute Gemini backend is running!");
});

// ------------------------- start server -------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
