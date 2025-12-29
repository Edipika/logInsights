import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "log-insights",
  brokers: ["localhost:9092"],
});

