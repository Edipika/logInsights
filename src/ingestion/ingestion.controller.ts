import { Request,Response } from "express";
import {createLog} from "../ingestion/ingestion.services";

export function ingestLog(req:Request,res:Response){
    const log = createLog (req.body);

    return res.status(201).json({
        message:"Log received",
        data:log
    });

}
