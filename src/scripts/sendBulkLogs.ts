import { env } from "../config/env";
import { parseArgs } from "./args";

// Sends many logs through the real API (POST /log/ingest), spread across several projects,
// so you can check that each project always lands on the same Kafka partition and consumer.
//
// Usage: npm run logs:bulk -- --count=300 --projects=hrms,crm,billing --env=dev --url=http://localhost:3000

const BULK_TEST_SERVICE = "bulk-test"; // verifyPartitions.ts filters on this

const args = parseArgs();
const count = Number(args.count ?? 300);
const projects = (args.projects ?? "hrms,crm,billing,payroll,inventory").split(",").map(p => p.trim()).filter(Boolean);
const environment = args.env ?? "dev";
const url = args.url ?? `http://localhost:${env.port}/log/ingest`;
const concurrency = Number(args.concurrency ?? 20);

// Unique id for this run, put in every message so the verify script only looks at this run
const runId = `run${Date.now()}`;

const levels = ["info", "warn"] as const; // no "error": avoids Slack alerts and OpenAI calls during the test

async function sendOne(i: number) {
  const project = projects[i % projects.length]!; // round-robin so projects interleave
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project,
      environment,
      service: BULK_TEST_SERVICE,
      level: levels[i % levels.length],
      message: `bulk test ${runId} message ${i}`,
      timestamp: new Date().toISOString(),
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return project;
}

async function main() {
  console.log(`Sending ${count} logs for projects [${projects.join(", ")}] to ${url} (run id: ${runId})`);

  const sent: Record<string, number> = {};
  let failed = 0;
  let next = 0;
  const started = Date.now();

  // Simple worker pool: `concurrency` requests in flight at a time
  async function worker() {
    while (next < count) {
      const i = next++;
      try {
        const project = await sendOne(i);
        sent[project] = (sent[project] ?? 0) + 1;
      } catch (err) {
        failed++;
        if (failed <= 5) console.error(`Log ${i} failed:`, (err as Error).message);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));

  console.log(`\nDone in ${Date.now() - started} ms. Failed: ${failed}`);
  console.table(sent);
  console.log(`\nWait a few seconds for the consumer(s) to catch up, then verify with:\n  npm run logs:verify -- --run=${runId}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
