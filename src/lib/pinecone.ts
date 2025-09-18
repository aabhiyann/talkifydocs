import { PineconeClient } from "@pinecone-database/pinecone";
import { env } from "./env";

export const getPineconeClient = async () => {
  const client = new PineconeClient();

  await client.init({
    apiKey: env.PINECONE_API_KEY,
    environment: "gcp-starter",
  });

  return client;
};

// import { Pinecone } from "@pinecone-database/pinecone";

// const pinecone = new Pinecone();
// await pinecone.init({
//   environment: "gcp-starter",
//   apiKey: "fe6a0a25-018b-4a41-8b0d-b7e1dae66e6d",
// });
// const index = pinecone.Index("talkifydocs");

// import { PineconeClient } from "@pinecone-database/pinecone";
