export const LOGS_INDEX_PREFIX = "logs";
export const LOGS_TEMPLATE_NAME = "logs-template";
export const LOGS_ILM_POLICY = "logs-retention";

// Data stream a log is written to, e.g. logs-hrms-production
// ES index / data stream names must be lowercase
export function logIndexName(project: string, environment: string) {
  return `${LOGS_INDEX_PREFIX}-${project}-${environment}`.toLowerCase();
}

// Data streams to search, narrowed as far as the filters allow
// project+env → logs-<p>-<e> ; project only → logs-<p>-* ; otherwise → logs-*
export function logSearchPattern(project?: string, environment?: string) {
  if (project && environment) return logIndexName(project, environment);
  if (project) return `${LOGS_INDEX_PREFIX}-${project.toLowerCase()}-*`;
  return `${LOGS_INDEX_PREFIX}-*`;
}
