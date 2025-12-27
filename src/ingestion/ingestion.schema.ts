import { z } from "zod";

export const LogSchema = z.object({
    service: z.string().min(1, "service is required"),
    level: z.enum(["warn", "error", "info", "fatal"]),
    message: z.string().min(1, "message is required"),
});

export const SearchSchema = z.object({
    service: z.string().min(1, "service has nothing to search").optional(),
    level: z.enum(["warn", "error", "info", "fatal"]).optional(),
    message: z.string().min(1, "message has nothing to search").optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    from: z.string().datetime().optional(),   // ISO format
    to: z.string().datetime().optional(),
});