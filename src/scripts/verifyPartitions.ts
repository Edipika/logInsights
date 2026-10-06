import { esClient } from "../config/elasticsearch";
import { parseArgs } from "./args";

// Checks a bulk test run: every project's logs should have come from exactly one Kafka
// partition and been processed by exactly one consumer.
//
// Usage: npm run logs:verify -- --run=run1696500000000

const BULK_TEST_SERVICE = "bulk-test";

async function main() {
  const { run } = parseArgs();
  if (!run) {
    console.error("Missing run id. Usage: npm run logs:verify -- --run=<run id printed by logs:bulk>");
    process.exit(1);
  }

  const result: any = await esClient.search({
    index: "logs-*",
    ignore_unavailable: true,
    allow_no_indices: true,
    size: 0, // only the aggregations, no documents
    query: {
      bool: {
        filter: [
          { term: { service: BULK_TEST_SERVICE } },
          { match_phrase: { message: run } },
        ],
      },
    },
    aggs: {
      projects: {
        terms: { field: "project", size: 100 },
        aggs: {
          partitions: { terms: { field: "kafka.partition", size: 100 } },
          consumers: { terms: { field: "kafka.consumer", size: 100 } },
        },
      },
    },
  });

  const buckets: any[] = result.aggregations.projects.buckets;
  if (!buckets.length) {
    console.log(`No logs found for ${run}. Is the consumer running, and has it caught up?`);
    process.exit(1);
  }

  let allOk = true;
  const rows = buckets.map(b => {
    const partitions = b.partitions.buckets.map((p: any) => `${p.key} (${p.doc_count})`);
    const consumers = b.consumers.buckets.map((c: any) => `${c.key} (${c.doc_count})`);
    const ok = partitions.length === 1 && consumers.length === 1;
    allOk &&= ok;
    return {
      project: b.key,
      logs: b.doc_count,
      partitions: partitions.join(", "),
      consumers: consumers.join(", "),
      result: ok ? "OK" : "SPLIT",
    };
  });

  console.log(`Run ${run}: ${result.hits.total.value} logs stored\n`);
  console.table(rows);

  console.log(
    allOk
      ? "\nPASS: each project used one partition and one consumer."
      : "\nFAIL: some projects were split. Partitions split → partition count changed mid-run. " +
        "Consumers split → a consumer joined or left mid-run (rebalance)."
  );
  process.exit(allOk ? 0 : 1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
