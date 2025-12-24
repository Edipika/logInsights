import { CreateLogDTO } from "../types/log.types";

export function createLog(data: CreateLogDTO) {
  const log = {
    ...data,
    timestamp: new Date().toISOString()
  };

  // Step 1.3 – Console store (temporary)
  console.log(log);

  return log;
}
