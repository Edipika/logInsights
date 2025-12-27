import { esClient } from "../config/elasticsearch";
import { CreateLogDTO, SearchLogDTO } from "./ingestion.types";

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

export async function searchLogs(data: SearchLogDTO) {

    const { service, level, message, page = 1, limit = 10,from,to} = data;

    const must: any[] = [];

    if (service) {
        must.push({ term: { service } });
    }

    if (level) {
        must.push({ term: { level } });
    }
    if (message) {
        must.push({
            multi_match: {
                query: message,
                fields: ["message^3", "service"],//3× importance rank higher if matched
                operator: "and"
            }
        });
    }

    if (from || to) {
        must.push({
            range: {
                timestamp: {
                    gte: from,
                    lte: to
                }
            }
        });
    }

    const result = await esClient.search({
        index: "logs",
        from: (page - 1) * limit, //for pagination
        size: limit,
        query: {
            bool: { must } //bool is a Boolean query container means:all conditions must match
        },
        sort: [
            { timestamp: "desc" }
        ]
    });

    return result.hits.hits.map(hit => hit._source);
}

