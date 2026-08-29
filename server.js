import Express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import Groq from 'groq-sdk';

dotenv.config();

const app = Express();
app.use(cors());
app.use(Express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const systemInstruction = 
  "You are a friendly and patient English conversation tutor. " +
  "Your job is to talk with the user in English to help them practice. " +
  "Keep your replies concise (2-3 sentences max) and engaging. " +
  "If the user makes a clear grammar error, provide a gentle correction at the end using: [Correction: ...]";

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    const botReply = completion.choices[0]?.message?.content || "";
    res.json({ reply: botReply });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "API call failed: " + (error.message || JSON.stringify(error)) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
