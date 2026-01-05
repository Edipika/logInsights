import { kafka } from "../../config/kafka";
import { esClient } from "../../config/elasticsearch";

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
    },
  });

}


process.on("SIGINT", async () => {
  console.log("SIGINT received. Disconnecting consumer...");
  await consumer.disconnect();
  process.exit(0);
});