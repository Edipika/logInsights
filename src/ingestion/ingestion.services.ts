export type LogLevel = "warn" | "error" | "info" | "fatal";

export interface CreateLogDTO {
    service: string;
    level: LogLevel;
    message: string;
}

export function createLog(data: CreateLogDTO) {
    const log = {
        ...data,
        timestamp: new Date().toISOString()
    };
    console.log(log);
    return log;
}