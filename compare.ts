import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOllama } from '@langchain/ollama';
import type { Example, Run } from 'langsmith';
import { evaluate } from 'langsmith/evaluation';
import { DATASET_NAME } from './dataset-upsert.js';

const promptTemplate = ChatPromptTemplate.fromMessages([
  ['system', 'You are a helpful assistant. Answer concisely.'],
  ['human', '{question}'],
]);

function makeTarget(modelName: string, temperature = 0.7) {
  const model = new ChatOllama({ model: modelName, temperature });

  return async (input: Record<string, unknown>) => {
    const messages = await promptTemplate.invoke({
      question: input['question'],
    });
    const response = await model.invoke(messages.messages);

    // Ollama response_metadata fields (all durations in nanoseconds):
    // eval_count          → output tokens generated
    // prompt_eval_count   → input tokens processed
    // eval_duration       → generation time (ns)
    // prompt_eval_duration→ prompt processing time (ns) — proxy for TTFT
    // total_duration      → wall-clock total (ns)
    // Docs: https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-completion
    const meta = response.response_metadata as Record<string, number>;
    const evalCount: number = meta['eval_count'] ?? 0;
    const promptEvalCount: number = meta['prompt_eval_count'] ?? 0;
    const evalDurationNs: number = meta['eval_duration'] ?? 0;
    const promptEvalDurationNs: number = meta['prompt_eval_duration'] ?? 0;
    const totalDurationNs: number = meta['total_duration'] ?? 0;

    return {
      answer: response.text,
      tokensPerSec:
        evalDurationNs > 0 ? Math.round(evalCount / (evalDurationNs / 1e9)) : 0,
      totalMs: Math.round(totalDurationNs / 1e6),
      ttftMs: Math.round(promptEvalDurationNs / 1e6),
      outputRatio:
        promptEvalCount > 0
          ? Math.round((evalCount / promptEvalCount) * 100) / 100
          : 0,
    };
  };
}

function evalTokensPerSec(run: Run, _example?: Example) {
  return {
    key: 'tokens_per_sec',
    score: (run.outputs?.['tokensPerSec'] as number) ?? 0,
  };
}

function evalTotalMs(run: Run, _example?: Example) {
  return { key: 'total_ms', score: (run.outputs?.['totalMs'] as number) ?? 0 };
}

function evalTtftMs(run: Run, _example?: Example) {
  return { key: 'ttft_ms', score: (run.outputs?.['ttftMs'] as number) ?? 0 };
}

const MODELS = [
  { name: 'gemma4', temperature: 0.7 },
  { name: 'qwen3', temperature: 0.7 },
];

for (const { name, temperature } of MODELS) {
  console.log(`\nRunning experiment for model: ${name}`);

  await evaluate(makeTarget(name, temperature), {
    data: DATASET_NAME,
    evaluators: [evalTokensPerSec, evalTotalMs, evalTtftMs],
    experimentPrefix: name,
    metadata: { model: name, temperature },
    maxConcurrency: 1,
  });
}
