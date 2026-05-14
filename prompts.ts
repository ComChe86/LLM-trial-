export interface BenchmarkPrompt {
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
}

export const BENCHMARK_PROMPTS: BenchmarkPrompt[] = [
  {
    category: 'math',
    difficulty: 'easy',
    question: 'What is 17 multiplied by 13?',
  },
  {
    category: 'math',
    difficulty: 'medium',
    question:
      'A train travels at 80 km/h. How long does it take to cover 340 km? Give the answer in hours and minutes.',
  },
  {
    category: 'math',
    difficulty: 'hard',
    question:
      'If a rectangle has a perimeter of 54 cm and its length is twice its width, what are the dimensions and what is the area?',
  },

  // ── Literature ─────────────────────────────────────────────────────────────
  {
    category: 'literature',
    difficulty: 'easy',
    question: 'Who wrote "Romeo and Juliet"?',
  },
  {
    category: 'literature',
    difficulty: 'medium',
    question:
      'Compare the themes of isolation and society in "The Metamorphosis" by Kafka and "The Stranger" by Camus. Answer in 3–4 sentences.',
  },
  {
    category: 'literature',
    difficulty: 'hard',
    question:
      'Analyze how the unreliable narrator shapes the reader\'s perception of reality in "Lolita" by Nabokov. Discuss at least two specific techniques the author uses.',
  },

  // ── Programming ────────────────────────────────────────────────────────────
  {
    category: 'programming',
    difficulty: 'easy',
    question: 'What is the difference between `let` and `const` in JavaScript?',
  },
  {
    category: 'programming',
    difficulty: 'medium',
    question:
      'Explain the concept of closures in JavaScript with a short code example.',
  },
  {
    category: 'programming',
    difficulty: 'hard',
    question:
      'Design a TypeScript generic function `groupBy<T>(arr: T[], key: keyof T): Record<string, T[]>` and explain the type constraints you chose.',
  },
];
