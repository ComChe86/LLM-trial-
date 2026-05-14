import { ChatOllama } from '@langchain/ollama';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// ── Pricing ────────────────────────────────────────────────────────────────

interface ModelPricing {
  model: string;
  provider: string;
  inputPer1M: number;
  outputPer1M: number;
}

function loadPricing(): ModelPricing[] {
  const raw = readFileSync('llm_pricing_may2026.csv', 'utf-8');
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  return rows.map((row) => ({
    model: row['Model'] ?? '',
    provider: row['Provider'] ?? '',
    inputPer1M: parsePrice(row['Input ($/1M tokens)']),
    outputPer1M: parsePrice(row['Output ($/1M tokens)']),
  }));
}

function parsePrice(value?: string): number {
  return Number.parseFloat(value?.replace(/[$,]/g, '') ?? '0');
}

function calcCost(
  inputTokens: number,
  outputTokens: number,
  inputTokenPrice: number,
  outputTokenPrice: number,
): number {
  return (
    (inputTokens * inputTokenPrice + outputTokens * outputTokenPrice) /
    1_000_000
  );
}

function printCostPerModel(inputTokens: number, outputTokens: number) {
  const pricing = loadPricing();
  console.log('\n--- cost per model (from CSV) ---');
  for (const p of pricing) {
    const cost = calcCost(
      inputTokens,
      outputTokens,
      p.inputPer1M,
      p.outputPer1M,
    );
    console.log(
      `${p.provider.padEnd(12)} ${p.model.padEnd(20)} $${cost.toFixed(6)}`,
    );
  }
}

const gemma = new ChatOllama({
  model: 'gemma4',
  think: true,
  temperature: 0.7,
  numCtx: 4096,
});

const qwen = new ChatOllama({
  model: 'qwen3',
  think: true,
  temperature: 0.7,
  numCtx: 4096,
});

async function target(model: ChatOllama) {
  const prompt = [['human', 'What is the meaning of life?']];
  const response = await model.invoke(prompt);

  return response;
}

for (const model of [gemma]) {
  const сoldResponse = await target(model);
  const response = await target(model);

  const meta = response.response_metadata as unknown as OllamaMeta;

  const tokensPerSec = meta.eval_count / (meta.eval_duration / 1e9);
  const ttftMs = meta.prompt_eval_duration / 1e6;
  const totalMs = meta.total_duration / 1e6;

  const logMetric = (name: string, value: string | number) => {
    console.log(`${name.padEnd(18)} ${value}`);
  };

  console.log(`\n=== ${model.model} ===`);
  logMetric('Tokens/sec:', tokensPerSec.toFixed(1));
  logMetric('Input tokens:', meta.prompt_eval_count);
  logMetric('Output tokens:', meta.eval_count);
  logMetric('TTFT:', `${ttftMs.toFixed(0)} ms`);
  logMetric('Total (Ollama):', `${totalMs.toFixed(0)} ms`);

  printCostPerModel(meta.prompt_eval_count, meta.eval_count);
}

export interface OllamaMeta {
  eval_count: number;
  eval_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  total_duration: number;
  load_duration: number;
}
