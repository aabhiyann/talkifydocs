import { getPineconeClient } from "@/lib/pinecone";
import { Index, CreateIndexRequest } from "@pinecone-database/pinecone";

const INDEX_NAME = "talkifydocs";

async function main() {
  const pinecone = await getPineconeClient();

  try {
    const existing = await pinecone.listIndexes();
    const exists = existing?.some((idx: Index) => idx.name === INDEX_NAME);

    if (!exists) {
      console.log(`Creating Pinecone index: ${INDEX_NAME}`);
      await pinecone.createIndex({
        name: INDEX_NAME,
        dimension: 1536,
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
      } as CreateIndexRequest);
      console.log("Pinecone index created successfully.");
    } else {
      console.log("Pinecone index already exists.");
    }
  } catch (e) {
    console.error("Failed to initialize Pinecone index:", e);
    process.exit(1);
  }
}

main();
