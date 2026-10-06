import { esClient } from "../config/elasticsearch";
import { env } from "../config/env";
import { LOGS_ILM_POLICY, LOGS_TEMPLATE_NAME } from "./indexNames";
import logsTemplate from "./templates/logs.template.json";

// Logs are stored in one data stream per project+environment (logs-<project>-<environment>),
// created automatically on first write. This sets up the rules those data streams follow.
async function createIndices() {
  // 1. Lifecycle policy: start a new backing index daily (or at 50gb), delete it after the retention period
  await esClient.ilm.putLifecycle({ //PUT http://localhost:9200/_ilm/policy/logs-retention
    name: LOGS_ILM_POLICY,
    policy: {
      phases: {
        hot: {
          actions: {
            rollover: { max_age: "1d", max_primary_shard_size: "50gb" },
          },
        },
        delete: {
          min_age: `${env.logRetentionDays}d`, // counted from rollover
          actions: { delete: {} },
        },
      },
    },
  });
  console.log(`✅ Lifecycle policy ready: ${LOGS_ILM_POLICY} (delete after ${env.logRetentionDays} days)`);

  // 2. Data stream template: our field types + the policy above.
  // Priority 200 so it wins over Elasticsearch's built-in "logs" template (logs-*-*, priority 100)
  await esClient.indices.putIndexTemplate({ //PUT http://localhost:9200/_index_template/logs-template
    name: LOGS_TEMPLATE_NAME,
    ...(logsTemplate as any),
    template: {
      ...logsTemplate.template,
      settings: {
        ...logsTemplate.template.settings,
        "index.lifecycle.name": LOGS_ILM_POLICY,
      },
    },
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
