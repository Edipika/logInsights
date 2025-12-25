import { Router } from "express";
import { ingestLog } from "../controllers/log.controller";
import { validateLog } from "../middlewares/validate.middleware";
import { CreateLogSchema } from "../schemas/log.schema";


const router = Router();

router.post("/logs",validateLog(CreateLogSchema),  ingestLog);

export default router;
