import { esClient } from "../config/elasticsearch";
import { LOGS_ILM_POLICY, LOGS_INDEX_PREFIX, LOGS_TEMPLATE_NAME } from "./indexNames";

async function deleteIndices() {
  // 1. Data streams (deletes all their backing .ds-* indices)
  const { data_streams } = await esClient.indices.getDataStream({ name: `${LOGS_INDEX_PREFIX}-*` });
  for (const { name } of data_streams) {
    await esClient.indices.deleteDataStream({ name }); //DELETE http://localhost:9200/_data_stream/logs-hrms-production
    console.log(`Deleted data stream: ${name}`);
  }

  // 2. Plain indices left from before data streams (legacy "logs" + logs-*).
  // ES 8 rejects wildcard deletes by default, so resolve concrete names first
  const found = await esClient.indices.get({
    index: [`${LOGS_INDEX_PREFIX}-*`, LOGS_INDEX_PREFIX],
    allow_no_indices: true,
    ignore_unavailable: true,
  });
  for (const index of Object.keys(found)) {
    await esClient.indices.delete({ index });
    console.log(`Deleted index: ${index}`);
  }

  if (!data_streams.length && !Object.keys(found).length) {
    console.log("No log data streams or indices found");
  }

  // 3. Template and lifecycle policy
  if (await esClient.indices.existsIndexTemplate({ name: LOGS_TEMPLATE_NAME })) {
    await esClient.indices.deleteIndexTemplate({ name: LOGS_TEMPLATE_NAME });
    console.log(`Deleted index template: ${LOGS_TEMPLATE_NAME}`);
  }

  try {
    await esClient.ilm.deleteLifecycle({ name: LOGS_ILM_POLICY });
    console.log(`Deleted lifecycle policy: ${LOGS_ILM_POLICY}`);
  } catch (err: any) {
    if (err?.meta?.statusCode !== 404) throw err;
  }
}

deleteIndices()
  .then(() => {
    console.log("Indices deleted");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error deleting indices", err);
    process.exit(1);
  });
