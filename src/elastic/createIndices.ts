import { esClient } from "../config/elasticsearch";
import { LOGS_TEMPLATE_NAME } from "./indexNames";
import logsTemplate from "./templates/logs.template.json";

// Logs are partitioned into logs-<project>-<environment> indices that are created
// on first write, so we register a template instead of creating indices up front.
async function createIndices() {
  await esClient.indices.putIndexTemplate({ //PUT http://localhost:9200/_index_template/logs-template
    name: LOGS_TEMPLATE_NAME,
    ...(logsTemplate as any),
  });

  console.log(`✅ Index template ready: ${LOGS_TEMPLATE_NAME} → ${logsTemplate.index_patterns.join(", ")}`);
}

createIndices()
  .then(() => {
    console.log("Index setup complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error creating indices", err);
    process.exit(1);
  });
