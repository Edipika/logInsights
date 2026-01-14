import OpenAI from 'openai';
import { AiErrorAnalysis } from './ai.types';
import { buildErrorPrompt } from './ai.prompt';
import { LogDocument } from '../ingestion/ingestion.types';

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});


const USE_MOCK_AI = process.env.USE_MOCK_AI === 'true';

export async function analyzeErrorsWithAI(
    logs: LogDocument[]
): Promise<AiErrorAnalysis> {
    if (!logs.length) {
        throw new Error('No logs provided for AI analysis');
    }

    if (USE_MOCK_AI) {
        return {
            summary: `Mock summary for ${logs.length} errors`,
            root_cause: 'Mock root cause: simulated failure',
            suggested_fix: 'Mock fix: restart service or refresh tokens',
        };
    }

    const prompt = buildErrorPrompt(logs);

    const response = await client.chat.completions.create({
        model: 'gpt-4o-mini', // cost-effective + reliable
        temperature: 0.2,     // deterministic answers
        messages: [{ role: 'user', content: prompt }],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
        throw new Error('Empty AI response');
    }

    try {
        return JSON.parse(content);
    } catch {
        throw new Error('AI returned invalid JSON');
    }
}
