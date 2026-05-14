import { Client } from 'langsmith';
import { BENCHMARK_PROMPTS } from './prompts.js';
import 'dotenv/config';

export const DATASET_NAME = 'llm-perf-benchmark';

async function upsertDataset(client: Client) {
  const datasets = client.listDatasets({ datasetName: DATASET_NAME });

  for await (const ds of datasets) {
    console.log(`Dataset "${DATASET_NAME}" already exists — reusing.`);
    return ds;
  }

  const dataset = await client.createDataset(DATASET_NAME, {
    description:
      'LLM performance benchmark: tokens/sec, latency, TTFT, output ratio',
  });

  await client.createExamples(
    BENCHMARK_PROMPTS.map((p) => ({
      dataset_id: dataset.id,
      inputs: {
        question: p.question,
        category: p.category,
        difficulty: p.difficulty,
      },
    })),
  );
}

const client = new Client();
await upsertDataset(client);
