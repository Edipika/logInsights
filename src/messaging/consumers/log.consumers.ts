import { kafka } from "../../config/kafka";
import { esClient } from "../../config/elasticsearch";

// Error count per service per minute
// Example key: auth-service_2026-01-06T10:02
const errorMetrics = new Map<string, number>();

const ERROR_THRESHOLD = 10;

function getMinuteBucket(timestamp: string | number | Date) {
  const date = new Date(timestamp);
  date.setSeconds(0, 0); // round to minute
  return date.toISOString();
}


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
          index: "logs",
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

      }
    },
  });

}


process.on("SIGINT", async () => {
  console.log("SIGINT received. Disconnecting consumer...");
  await consumer.disconnect();
  process.exit(0);
});