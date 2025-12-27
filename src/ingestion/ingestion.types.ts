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
