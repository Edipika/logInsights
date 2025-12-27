import {Router} from "express";
import { validateLog } from "../middlewares/validate.middleware";
import {LogSchema,SearchSchema} from "./ingestion.schema";
import {ingestLog,searchLog} from "./ingestion.controller";

const router= Router();
 
router.post("/ingest",validateLog(LogSchema),ingestLog )
router.get("/search",validateLog(SearchSchema),searchLog )

export default router;