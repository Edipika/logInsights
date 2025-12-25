import {z} from "zod";

export const LogSchema = z.object({
    service:z.string().min(1,"service is required"),
    level:z.enum(["warn" ,"error" ,"info" ,"fatal"]),
    message:z.string().min(1,"message is required"),
});