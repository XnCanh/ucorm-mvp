import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyCg1frAi7Bf-Ng2YaO3F5wBcRDHBCYJHQw';
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    const fetchResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await fetchResponse.json();
    console.log("AVAILABLE MODELS:");
    data.models.forEach(m => console.log(m.name));
  } catch (err) {
    console.error('Error:', err);
  }
}

listModels();
