import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "./env";

export const getPineconeClient = async () => {
  const client = new Pinecone({
    apiKey: env.PINECONE_API_KEY,
  });

  return client;
};
