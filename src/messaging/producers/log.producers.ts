import { kafka } from "../../config/kafka";

export const logProducer = kafka.producer();

export async function connectProducer() {
  await logProducer.connect();
}

export async function publishLog(log: unknown) {
  await logProducer.send({
    topic: "logs-stream",
    messages: [
      {
        value: JSON.stringify(log),
      },
    ],
  });
}
