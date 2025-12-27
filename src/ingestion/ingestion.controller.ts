import { Request, Response } from "express";
import { createLog, searchLogs } from "../ingestion/ingestion.services";

export async function ingestLog(req: Request, res: Response) {
    const log = await createLog(req.body);

    return res.status(201).json({
        message: "Log received",
        data: log
    });

}

export async function searchLog(req: Request, res: Response) {
    try {
        const data = req.query as any;

        const logs = await searchLogs({
            service: data.service as string,
            level: data.level as any,
            message: data.message as string,
            page: data.page ? Number(data.page) : 1,
            limit: data.limit ? Number(data.limit) : 10,
            from: data.from as string,
            to: data.to as string
        });

        return res.status(200).json({
            message: "Logs fetched successfully",
            data: logs
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Search failed" });
    }

}
