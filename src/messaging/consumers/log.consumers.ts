import { kafka } from "../../config/kafka";
import { esClient } from "../../config/elasticsearch";
import { fetchSimilarErrors, storeAiAnalysis } from '../../ingestion/ingestion.services';
import { analyzeErrorsWithAI } from '../../ai/ai.service';

// Error count per service per minute
// Example key: auth-service_2026-01-06T10:02
const errorMetrics = new Map<string, number>();

const ERROR_THRESHOLD = 10;

function getMinuteBucket(timestamp: string | number | Date) {
  const date = new Date(timestamp);
  date.setSeconds(0, 0); // round to minute
  return date.toISOString();
}
// When logs-group subscribes to logs-stream, it’s telling Kafka: "I am responsible for reading all the data in this topic." Kafka then looks at how many Partitions are in that topic and how many Consumers (instances of your app) are in that group. It performs an Assignment:

// If the topic has 3 partitions and you have 1 consumer, that 1 consumer is "assigned" to watch all 3 partitions. It will receive all messages from all partitions.

// If you scale up to 2 consumers in the same group, Kafka will reassign partitions so that each consumer gets a subset. For example, Consumer A might get Partitions 0 and 1, while Consumer B gets Partition 2. Now each consumer only processes a portion of the messages.

const consumer = kafka.consumer({
  groupId: "logs-group",
  sessionTimeout: 30000,
});

export async function startLogConsumer() {
  await consumer.connect();

  await consumer.subscribe({
    topic: "logs-stream",
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      let log;

      try {
        log = JSON.parse(message.value.toString());
      } catch (err) {
        console.error("Invalid log format", err);
        return;
      }
      try {
        await esClient.index({
          index: `logs-${log.project}-${log.environment}`,
          document: log,
        });

        console.log("Stored log:", log.service);
      } catch (err) {
        console.error("ElasticSearch indexing failed", err);
        // future: send to DLQ topic
      }
      if (log.level === "error") {
        const minuteBucket = getMinuteBucket(log.timestamp || Date.now());
        const key = `${log.service}_${minuteBucket}`;

        const currentCount = errorMetrics.get(key) || 0;
        const newCount = currentCount + 1;

        errorMetrics.set(key, newCount);

        console.log(
          `[ERROR_METRIC] ${log.service} → ${newCount} errors @ ${minuteBucket}`
        );
        if (newCount === ERROR_THRESHOLD + 1) {
          console.error(
            `🚨 ALERT: ${log.service} crossed ${ERROR_THRESHOLD} errors/min`
          );
        }

        try {
          await handleErrorLog(log);
        } catch (err) {
          console.error("AI error analysis failed", err);
        }

      }
    },
  });

}

export async function handleErrorLog(log: any) {
  const { service, message, level } = log;
  if (level !== 'error') return;

  // 1. Fetch similar errors
  const samples = await fetchSimilarErrors(service, message);

  // 2. Avoid AI if insufficient data
  if (samples.length < 5) return;

  // 3. Call AI
  const analysis = await analyzeErrorsWithAI(samples);

  // 4. Store result
  await storeAiAnalysis(service, message, analysis);
}


process.on("SIGINT", async () => {
  console.log("SIGINT received. Disconnecting consumer...");
  await consumer.disconnect();
  process.exit(0);
});