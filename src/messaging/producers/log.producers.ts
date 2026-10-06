import { kafka } from "../../config/kafka";
import { env } from "../../config/env";
import { LogEvent } from "../log.schema";

export const logProducer = kafka.producer({
  allowAutoTopicCreation: false,
  retry: {
    retries: 5,
  },
});

export async function publishLog(logs: LogEvent) {
  const batch = Array.isArray(logs) ? logs : [logs];
  try {
    await logProducer.send({
      topic: env.kafka.topic,
      messages: batch.map(log => ({
        key: log.project,
        value: JSON.stringify(log),
      })),
    });
  } catch (error) {
    console.error("Failed to publish log to Kafka", error);
    // Optional: push to DLQ later
    throw error;
  }
}

// broker=kafka instance