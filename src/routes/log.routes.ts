import { Router } from "express";
import { ingestLog } from "../controllers/log.controller";
// import { validateLog } from "../middlewares/validate.middleware";

const router = Router();

router.post("/logs",  ingestLog);

export default router;
