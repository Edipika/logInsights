import { esClient } from "../config/elasticsearch";

const indices = ["logs"];

async function deleteIndices() {
  for (const index of indices) {
    const exists = await esClient.indices.exists({ index });

    if (exists) {
      await esClient.indices.delete({ index }); //DELETE http://localhost:9200/logs
      console.log(`Deleted index: ${index}`);
    } else {
      console.log(`Index not found: ${index}`);
    }
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
