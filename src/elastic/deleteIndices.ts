import { esClient } from "../config/elasticsearch";
import { LOGS_INDEX_PREFIX, LOGS_TEMPLATE_NAME } from "./indexNames";

async function deleteIndices() {
  // ES 8 rejects wildcard deletes by default, so resolve concrete index names first
  const found = await esClient.indices.get({
    index: [`${LOGS_INDEX_PREFIX}-*`, LOGS_INDEX_PREFIX], // partitioned + legacy single index
    allow_no_indices: true,
    ignore_unavailable: true,
  });
  const indices = Object.keys(found);

  for (const index of indices) {
    await esClient.indices.delete({ index }); //DELETE http://localhost:9200/logs-hrms-production
    console.log(`Deleted index: ${index}`);
  }
  if (!indices.length) {
    console.log("No log indices found");
  }

  const templateExists = await esClient.indices.existsIndexTemplate({ name: LOGS_TEMPLATE_NAME });
  if (templateExists) {
    await esClient.indices.deleteIndexTemplate({ name: LOGS_TEMPLATE_NAME });
    console.log(`Deleted index template: ${LOGS_TEMPLATE_NAME}`);
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
