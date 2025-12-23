import { db } from "../src/lib/db";
import { getPineconeClient } from "../src/lib/pinecone";
import { PINECONE_INDEX_NAME } from "../src/config/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { withTimeout } from "../src/lib/utils";

async function debug() {
  console.log("🔍 Debugging PDF processing...");
  
  const fileId = "cm51iwvx8000180idvkid6it6"; // Using the ID of one of the failed files if known, or just find the last failed one
  
  const file = await db.file.findFirst({
    where: { uploadStatus: "FAILED" },
    orderBy: { createdAt: "desc" }
  });

  if (!file) {
    console.log("❌ No failed files found to debug.");
    return;
  }

  console.log(`📄 Debugging file: ${file.name} (${file.id})`);
  console.log(`🔗 URL: ${file.url}`);

  try {
    console.log("1️⃣ Testing fetch...");
    const response = await fetch(file.url);
    console.log(`   Fetch status: ${response.status} ${response.statusText}`);
    if (!response.ok) throw new Error("Fetch failed");
    const blob = await response.blob();
    console.log(`   Blob size: ${blob.size} bytes, type: ${blob.type}`);

    console.log("2️⃣ Testing PDFLoader...");
    const tempFile = new File([blob], file.name, { type: "application/pdf" });
    const loader = new PDFLoader(tempFile);
    const docs = await loader.load();
    console.log(`   Parsed ${docs.length} pages.`);

    console.log("3️⃣ Testing OpenAI Embeddings...");
    const embeddings = new OpenAIEmbeddings({ modelName: "text-embedding-3-small" });
    const testEmbed = await embeddings.embedQuery("test");
    console.log(`   Embedding successful (dim: ${testEmbed.length})`);

    console.log("4️⃣ Testing Pinecone Connection...");
    const pinecone = await getPineconeClient();
    const index = pinecone.Index(PINECONE_INDEX_NAME);
    const desc = await pinecone.describeIndex(PINECONE_INDEX_NAME);
    console.log(`   Pinecone index found: ${PINECONE_INDEX_NAME}`, desc);

  } catch (err: any) {
    console.error("❌ DEBUG FAILED:", err.message);
    if (err.stack) console.error(err.stack);
  }
}

debug();
