import { Pinecone } from "@pinecone-database/pinecone";

let pinecone: Pinecone | null = null;

export function getPineconeClient() {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONMENT!,
    });
  }
  return pinecone;
}

export function getPineconeIndex() {
  const client = getPineconeClient();
  const indexName = process.env.PINECONE_INDEX || "talkifydocs";
  return client.Index(indexName);
}
