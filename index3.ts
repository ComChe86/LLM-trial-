import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// Налаштовуємо локальний Ollama через OpenAI-сумісний API
const ollama = createOpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama', // Ollama ігнорує ключ, але SDK вимагає будь-який непустий рядок
});

async function runLocalLLM() {
  console.log('🤖 Надсилаю запит до твого Mac... Зачекай кілька секунд...');
  
  try {
    const { text, usage } = await generateText({
      model: ollama('llama3.2:latest'), 
      prompt: 'Write a vegetarian lasagna recipe for 4 people.',

    }); // <-- Тут закривається об'єкт

    console.log('\n--- Відповідь від Локальної LLM (Ollama) ---');
    console.log(text);
    
    console.log('\n--- Метрики локального заліза ---');
    console.log(usage);

  } catch (error) {
    console.error('❌ Помилка підключення до Ollama. Переконайся, що додаток Ollama запущено!');
    console.error(error);
  }
}

runLocalLLM();