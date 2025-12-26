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