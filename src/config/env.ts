import "dotenv/config"; // load .env before any value below is read

// Empty values in .env (e.g. "PORT=") fall back to the local defaults
function str(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

function num(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export const env = {
  port: num("PORT", 3000),

  kafka: {
    brokers: str("KAFKA_BROKER", "localhost:9092").split(",").map(b => b.trim()).filter(Boolean), // comma-separated for multiple brokers
    clientId: str("KAFKA_CLIENT_ID", "log-insights"),
    topic: str("KAFKA_TOPIC", "logs-stream"),
    groupId: str("KAFKA_GROUP_ID", "logs-group"),
  },

  elasticsearch: {
    node: str("ELASTICSEARCH_NODE", "http://localhost:9200"),
  },

  logRetentionDays: num("LOG_RETENTION_DAYS", 30),

  useMockAi: process.env.USE_MOCK_AI === "true",
};
