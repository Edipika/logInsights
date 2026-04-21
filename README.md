# LogInsight 🔍

**Real-Time Log Monitoring & AI-Powered Analysis System**

LogInsight is a scalable, event-driven log ingestion and analysis platform built with **Kafka**, **Elasticsearch**, and **Node.js (TypeScript)**. It enables high-throughput log processing, real-time alerting, and AI-driven root cause analysis — designed for teams that need observability at scale.

---

## Features

-  **Async Log Ingestion** — Kafka-based pipeline for non-blocking, high-throughput log processing
-  **Powerful Search** — Full-text and filtered log search via Elasticsearch
-  **Real-Time Alerting** — Auto-triggers alerts when error rates exceed thresholds (e.g. >10 errors/min per service)
- **AI Error Analysis** — Automatically summarizes errors, identifies root causes, and suggests fixes
- **Decoupled Architecture** — Producer/consumer separation ensures fault tolerance and independent scaling

---

## Architecture

```
Client / API
    │
    ▼
Kafka Producer
    │
    ▼
Kafka Topic (logs-stream)
    │
    ▼
Consumer Worker
    ├──► Elasticsearch (logs index)
    ├──► Alert System  (in-memory error rate tracking)
    └──► AI Analysis   (ai-error-summaries index)
```

---

## Tech Stack

| Layer         | Technology                  |
|---------------|-----------------------------|
| Runtime       | Node.js, TypeScript         |
| Messaging     | Apache Kafka                |
| Search & Storage | Elasticsearch            |
| AI Integration | Custom AI Service          |
| Containerization | Docker / Docker Compose  |

---

## Getting Started

### Prerequisites

Make sure you have the following running locally or via Docker:
- Node.js (v18+)
- Apache Kafka
- Apache ZooKeeper (required for Kafka)
- Elasticsearch 
- Kibana (Optional)

### 1. Clone the repository

```bash
git clone https://github.com/Edipika/logInsights.git
cd logInsights
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
KAFKA_BROKER=localhost:9092
ELASTICSEARCH_URL=http://localhost:9200
```

### 4. Start infrastructure (optional — Docker)

```bash
docker-compose up -d
```

### 5. Run the development server

```bash
npm run dev
```

---

## Environment Variables

| Variable            | Description                        | Default                     |
|---------------------|------------------------------------|-----------------------------|
| `KAFKA_BROKER`      | Kafka broker address               | `localhost:9092`            |
| `ELASTICSEARCH_NODE` | Elasticsearch connection URL       | `http://localhost:9200`     |

---

## API Reference

### POST `/logs` — Ingest a log

**Request Body:**

```json
{
  "service": "auth-service",
  "level": "error",
  "message": "Database connection failed"
}
```

**Response:**

```json
{ "status": "queued" }
```

> Logs are processed asynchronously via Kafka. The API responds immediately after queuing.

---

### GET `/logs/search` — Search logs

Supports filtering by `service`, `level`, full-text `message` search, time range, pagination, and sorting (latest first).

**Example query params:**

```
GET /logs/search?service=auth-service&level=error&page=1&limit=20
```

---

## System Flow

### 1. Log Ingestion
The API receives a log request, publishes it to the `logs-stream` Kafka topic, and immediately returns `{ "status": "queued" }`. Processing is fully async.

### 2. Log Processing (Consumer)
The Kafka consumer listens continuously. Each message is parsed and stored in the `logs` Elasticsearch index.

### 3. Error Monitoring & Alerting
When a log with `level: "error"` is received, errors are grouped by **service + minute bucket** and tracked in memory. If the error count exceeds the threshold (default: 10/min), an alert is triggered.

### 4. AI-Based Error Analysis
For error logs, the system:
1. Fetches similar past errors from Elasticsearch
2. Skips AI if fewer than 5 samples are available
3. Runs AI analysis to produce a **summary**, **root cause**, and **suggested fix**
4. Stores results in the `ai-error-summaries` index

---

## Project Structure

```
logInsights/
├── src/
│   └── ...              # TypeScript source files
├── docker-compose.yml   # Docker services config
├── tsconfig.json        # TypeScript config
├── package.json
└── .env                 # Environment variables (not committed)
```

---

## License

This project is open source. Feel free to fork, contribute, or raise issues.