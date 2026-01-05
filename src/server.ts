import app from "./app";
import { logProducer } from "./messaging/producers/log.producers";
import { startLogConsumer } from "./messaging/consumers/log.consumers";

const PORT = 3000;

async function bootstrap() {
  try {
    // 1️⃣ Connect Kafka Producer FIRST
    await logProducer.connect();
    console.log("Kafka producer connected");

    // 2️⃣ Start Kafka Consumer
    await startLogConsumer();
    console.log("Kafka log consumer started");

    // 3️⃣ Start Express Server LAST
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Application startup failed", error);
    process.exit(1);
  }
}

bootstrap();

process.on("SIGINT", async () => {
  console.log("Shutting down Kafka...");
  await logProducer.disconnect();
  process.exit(0);
});
