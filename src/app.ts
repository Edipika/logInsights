import express from "express";
import logs from "./ingestion/ingestion.routes";
import { logProducer } from "./messaging/producers/log.producers";
// log-consumer/src/index.ts
import { startLogConsumer } from "./messaging/consumers/log.consumers";

const app = express();

app.use(express.json());
// app.use("/api", logRoutes);
app.get("/", (req, res) => {
    res.status(200).json({
        message: "server is running.."
    });
})

export async function connectProducer() {
  await logProducer.connect();
} //Open network connection for producer


async function bootstrap() {
  try {
    await startLogConsumer();
    console.log("Kafka log consumer started");
  } catch (error) {
    console.error("Failed to start consumer", error);
    process.exit(1);
  }
}

bootstrap();


app.use("/log", logs);

export default app;
