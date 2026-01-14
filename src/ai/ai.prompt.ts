import { LogDocument } from '../ingestion/ingestion.types';

export function buildErrorPrompt(logs: LogDocument[]): string {
  return `
You are a senior backend engineer.

Analyze the following application error logs.

Your task:
1. Identify the root cause
2. Explain the issue in simple terms
3. Suggest a practical and production-safe fix

Rules:
- Be concise
- Do NOT hallucinate
- Base your answer strictly on the logs

Logs:
${logs.map(l => `• ${l.timestamp} | ${l.service} | ${l.message}`).join('\n')}

Return ONLY valid JSON in this exact format:
{
  "summary": "...",
  "root_cause": "...",
  "suggested_fix": "..."
}
`;
}
