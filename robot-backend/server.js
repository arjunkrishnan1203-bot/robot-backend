import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.get("/chat", async (req, res) => {
  try {
    const userText = req.query.text;

    if (!userText) {
      return res.status(400).json({ error: "No text provided" });
    }

    const reply = await getAIReply(userText);

    res.json({ reply });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function getAIReply(text) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: text }]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend running on port " + PORT));
