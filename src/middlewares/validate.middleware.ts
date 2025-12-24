import { Request, Response, NextFunction } from "express";
import { LOG_LEVELS } from "../constants/logLevels";

export function validateLog(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { service, level, message } = req.body;

  if (!service || !level || !message) {
    return res.status(400).json({
      error: "service, level and message are required"
    });
  }

  if (!LOG_LEVELS.includes(level)) {
    return res.status(400).json({
      error: `Invalid log level: ${level}`
    });
  }

  next();
}
