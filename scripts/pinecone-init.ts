import "dotenv/config";
import { getPineconeClient } from "@/lib/pinecone";

const INDEX_NAME = "talkifydocs";

async function main() {
  const pinecone = await getPineconeClient();

  try {
    const existing = await pinecone.listIndexes();
    const existingIndex = existing?.indexes?.find((idx: any) => idx.name === INDEX_NAME);

    if (existingIndex) {
      console.log(`Index exists. Checking compatibility...`);
      // @ts-ignore
      if (existingIndex.dimension !== 768) {
        console.warn(`Dimension mismatch: Found ${existingIndex.dimension}, expected 768.`);
        console.warn(`Deleting incompatible index... (This may take a moment)`);
        await pinecone.deleteIndex(INDEX_NAME);

        // Wait for deletion to propagate
        await new Promise(resolve => setTimeout(resolve, 10000));
        console.log("Deletion complete. Recreating...");
      } else {
        console.log("Pinecone index is compatible (Dimension: 768).");
        return;
      }
    }

    console.log(`Creating Pinecone index: ${INDEX_NAME}`);
    await pinecone.createIndex({
      name: INDEX_NAME,
      dimension: 768, // Gemini embedding dimension
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    } as any);
    console.log("Pinecone index created successfully.");
  } catch (e) {
    console.error("Failed to initialize Pinecone index:", e);
    process.exit(1);
  }
}

main();
