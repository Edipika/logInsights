export interface AiErrorAnalysis {
  summary: string;
  root_cause: string;
  suggested_fix: string;
}

export interface AiServiceResponse {
  analysis: AiErrorAnalysis;
  rawResponse?: unknown;
}
