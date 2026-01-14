export type LogLevel = "warn" | "error" | "info" | "fatal";

export interface CreateLogDTO {
    service: string;
    level: LogLevel;
    message: string;
}

export interface SearchLogDTO {
    service?: string;
    level?: LogLevel;
    message?: string;
    page?: number; //for pagination 
    limit?: number;
    from?: string;
    to?: string;
}

/**
 * Canonical log shape used across:
 * - API ingestion
 * - Kafka messages
 * - Elasticsearch documents
 * - AI analysis
 */
export interface LogDocument {
  /** Service or application name */
  service: string;

  /** Log severity level */
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';

  /** Human-readable log message */
  message: string;

  /** ISO timestamp when log was created */
  timestamp: string;

  /** Environment (prod, staging, dev, local) */
  env?: 'prod' | 'staging' | 'dev' | 'local';

  /** Optional error stack trace */
  stack?: string;

  /** Optional request or trace identifier */
  trace_id?: string;

  /** Kafka metadata (added by consumer, not producer) */
  kafka?: {
    topic: string;
    partition: number;
    offset: string;
  };
}