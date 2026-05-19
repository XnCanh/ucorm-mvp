import { GoogleGenerativeAI } from '@google/generative-ai';

// Read API Key securely from environment variables (never hardcode keys on Github)
const apiKey = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    const fetchResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await fetchResponse.json();
    console.log("AVAILABLE MODELS:");
    if (data.models) {
      data.models.forEach(m => console.log(m.name));
    } else {
      console.log("Failed to list models. Response:", data);
    }
  } catch (err) {
    console.error('Script Error:', err);
  }
}

listModels();
