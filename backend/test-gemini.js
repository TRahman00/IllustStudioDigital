import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log("Using Key Starting with:", apiKey ? apiKey.substring(0, 10) : "NO KEY");

async function checkModels() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    console.log("AVAILABLE MODELS FOR YOUR KEY:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("FETCH ERROR:", e);
  }
}
checkModels();