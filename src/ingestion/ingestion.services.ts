import { esClient } from "../config/elasticsearch";
export type LogLevel = "warn" | "error" | "info" | "fatal";

export interface CreateLogDTO {
    service: string;
    level: LogLevel;
    message: string;
}

export async function createLog(data: CreateLogDTO) {
    const log = {
        ...data,
        timestamp: new Date().toISOString()
    };
    console.log(log);

    await esClient.index({ // POST http://localhost:9200/logs/_doc
        index: "logs",
        document: log
    });
    
    return log;
}

export async function searchLog(data: CreateLogDTO) {
// 2.5.1 Create GET /api/logs
// app.get("/api/logs", async (req, res) => {
//   try {
//     const { service, level } = req.query;

//     const must: any[] = [];

//     if (service) {
//       must.push({ term: { service } });
//     }

//     if (level) {
//       must.push({ term: { level } });
//     }

//     const result = await esClient.search({
//       index: "logs",
//       query: {
//         bool: { must }
//       }
//     });

//     const logs = result.hits.hits.map((hit) => hit._source);

//     res.json(logs);
//   } catch (error) {
//     console.error("Search error:", error);
//     res.status(500).json({ error: "Failed to fetch logs" });
//   }
// });

}