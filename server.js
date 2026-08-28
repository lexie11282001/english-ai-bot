import { GoogleGenAI } from '@google/genai';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
let chatHistory = [];

const systemInstruction = 
  "You are a friendly and patient English conversation tutor. " +
  "Your job is to talk with the user in English to help them practice. " +
  "Keep your replies concise (2-3 sentences max) and engaging. " +
  "If the user makes a clear grammar error, provide a gentle correction at the end using: [Correction: ...]";

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    chatHistory.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: chatHistory,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const botReply = response.text;
    chatHistory.push({ role: 'model', parts: [{ text: botReply }] });

    res.json({ reply: botReply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "API call failed" });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));