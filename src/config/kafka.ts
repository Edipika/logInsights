import { Kafka } from "kafkajs";
import { env } from "./env";

export const kafka = new Kafka({
  clientId: env.kafka.clientId,
  brokers: env.kafka.brokers,
});

