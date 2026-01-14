import { esClient } from "../config/elasticsearch";
import { CreateLogDTO, SearchLogDTO } from "./ingestion.types";
import { publishLog } from "../messaging/producers/log.producers";
import { LogDocument } from '../ingestion/ingestion.types';
import { AiErrorAnalysis } from '../ai/ai.types';

export async function createLog(data: CreateLogDTO) {
    const log = {
        ...data,
        timestamp: new Date().toISOString()
    };
    console.log("Incoming Log", log);

    await publishLog(log);

    return { status: "queued" };
}

export async function searchLogs(data: SearchLogDTO) {

    const { service, level, message, page = 1, limit = 10, from, to } = data;

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

export async function fetchSimilarErrors(
    service: string,
    message: string,
    limit = 30
): Promise<LogDocument[]> {
    const { hits } = await esClient.search({
        index: 'logs-*',
        size: limit,
        query: {
            bool: {
                must: [
                    { match: { service } },
                    { match: { level: 'error' } },
                    { match: { message } },
                ],
            },
        },
        sort: [{ timestamp: 'desc' }],
    });

    return hits.hits.map((hit: any) => hit._source);
}


export async function storeAiAnalysis(
  service: string,
  signature: string,
  analysis: AiErrorAnalysis
) {
  await esClient.index({
    index: 'ai-error-summaries',
    document: {
      service,
      error_signature: signature,
      summary: analysis.summary,
      root_cause: analysis.root_cause,
      suggested_fix: analysis.suggested_fix,
      created_at: new Date().toISOString(),
    },
  });
}
