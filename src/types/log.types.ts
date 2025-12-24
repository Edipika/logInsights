export type LogLevel = "fatal" | "error" | "warn" | "info" | "debug";

export interface CreateLogDTO {
  service: string;
  level: LogLevel;
  message: string;
}
