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

      await esClient.index({
        index: "logs",
        document: log,
      });

      console.log("Stored log:", log.service);
    },
  });
}
