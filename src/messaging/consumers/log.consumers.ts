import { kafka } from "../../config/kafka";
import { esClient } from "../../config/elasticsearch";

const consumer = kafka.consumer({
  groupId: "logs-group",
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

      const log = JSON.parse(message.value.toString());

      try {
        await esClient.index({
          index: "logs",
          document: log,
        });
      } catch (err) {
        console.error("Failed to index log", err);
      }
      console.log("Stored log:", log.service);
    },
  });
}


process.on("SIGINT", async () => {
  console.log("SIGINT received. Disconnecting consumer...");
  await consumer.disconnect();
  process.exit(0);
});