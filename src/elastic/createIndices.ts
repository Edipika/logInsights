import { esClient } from "../config/elasticsearch";
import logsIndex from "./indices/logs.index.json";

type IndexConfig = {
  name: string;
  body: any;
};

const indices: IndexConfig[] = [
  { name: "logs", body: logsIndex },
];

async function createIndices() {
  for (const index of indices) {
    const exists = await esClient.indices.exists({
      index: index.name,
    });

    if (!exists) {
      await esClient.indices.create({ //PUT http://localhost:9200/logs
        index: index.name,
        body: index.body,
      });

      console.log(`✅ Created index: ${index.name}`);
    } else {
      console.log(`⚠️ Index already exists: ${index.name}`);
    }
  }
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
