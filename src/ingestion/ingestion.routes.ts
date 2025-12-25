import {Router} from "express";
import { validateLog } from "../middlewares/validate.middleware";
import {LogSchema} from "./ingestion.schema";
import {ingestLog} from "./ingestion.controller";

const router= Router();
 
router.post("/ingest",validateLog(LogSchema),ingestLog )

export default router;