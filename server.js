import { GoogleGenerativeAI } from '@google/generative-ai';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = 
  "You are a friendly and patient English conversation tutor. " +
  "Your job is to talk with the user in English to help them practice. " +
  "Keep your replies concise (2-3 sentences max) and engaging. " +
  "If the user makes a clear grammar error, provide a gentle correction at the end using: [Correction: ...]";

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction 
    });

    const result = await model.generateContent(message);
    const response = await result.response;
    const botReply = response.text();

    res.json({ reply: botReply });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "API call failed: " + (error.message || JSON.stringify(error)) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
