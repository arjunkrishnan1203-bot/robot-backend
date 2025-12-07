import express from "express";
import fetch from "node-fetch"; // make sure it's in package.json

const app = express();
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Robot backend running. Use /chat?text=Hello');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Chat route
app.get('/chat', async (req, res) => {
  try {
    const userText = req.query.text;
    if (!userText) {
      return res.status(400).json({ error: "No text provided. Use ?text=..." });
    }

    // Check if API key exists
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.length < 10) {
      return res.status(500).json({ error: "OPENAI_API_KEY not set or invalid" });
    }

    // Call OpenAI Chat API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a cute, friendly robot named RoboCute." },
          { role: "user", content: userText }
        ],
        max_tokens: 200
      })
    });

    // Get JSON
    const data = await response.json();

    // Safe parsing
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("OpenAI returned invalid response:", data);
      return res.status(500).json({ error: "Invalid response from OpenAI", raw: data });
    }

    const reply = data.choices[0].message.content || "Sorry, I couldn't generate a reply.";
    res.json({ reply });

  } catch (err) {
    console.error("Error in /chat:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Robot backend running on port ${PORT}`);
});
