import { kafka } from "../../config/kafka";

export const logProducer = kafka.producer();  //Creates a producer instance



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
// broker=kafka instance