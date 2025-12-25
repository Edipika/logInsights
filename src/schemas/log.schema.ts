import { z } from "zod";

export const LogLevelEnum = z.enum([
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
]);

export const CreateLogSchema = z.object({
  service: z
    .string()
    .min(1, "service is required")
    .max(100, "service name is too long"),

  level: LogLevelEnum,

  message: z
    .string()
    .min(1, "message is required")
    .max(10_000, "message is too long"),
});
