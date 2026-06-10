import { generateText } from 'ai';
import { google } from '@ai-sdk/google'; // <--- Повертаємо простий і 100% стабільний імпорт
import { createOpenAI } from '@ai-sdk/openai';

// Більше жодних назв функцій! Просто прописуємо ключ у пам'ять процесу:
process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'AQ.';

// Налаштовуємо локальний Ollama
const ollama = createOpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama',
});

async function runGoogle() {
  const { text, usage, totalUsage } = await generateText({
    model: google('gemini-2.5-flash'), // Тепер він автоматично підхопить ключ з process.env
    prompt: 'Write a vegetarian lasagna recipe for 4 people.',
  });

  console.log('--- Google ---');
  console.log(text);
  console.log(usage);
  console.log(totalUsage);
}

async function runOllama() {
  const { text, usage, totalUsage } = await generateText({
    model: ollama('qwen3'),
    prompt: 'Write a vegetarian lasagna recipe for 4 people.',
  });

  console.log('--- Ollama ---');
  console.log(text);
  console.log(usage);
  console.log(totalUsage);
}

runGoogle();
runOllama();