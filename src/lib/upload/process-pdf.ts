import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { db } from "@/lib/db";
import { getPineconeClient } from "@/lib/pinecone";
import { extractMetadata } from "./extract-metadata";
import { generateThumbnail } from "./generate-thumbnail";
import { extractEntities } from "./extract-entities";
import { summarizeDocument } from "./summarize-document";

type ProcessPdfParams = {
  fileId: string;
  fileUrl: string;
  fileName: string;
};

/**
 * High-level API matching the spec: process a PDF by fileId.
 */
export async function processPDF(fileId: string): Promise<void> {
  const file = await db.file.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    throw new Error("File not found");
  }

  await processPdfFile({
    fileId: file.id,
    fileUrl: file.url,
    fileName: file.name,
  });
}

/**
 * Internal implementation of the PDF processing pipeline:
 * 1. Mark as PROCESSING
 * 2. Download PDF from storage
 * 3. Validate content & type
 * 4. Enforce plan-specific page limits
 * 5. Extract metadata and generate thumbnail
 * 6. Create embeddings in Pinecone
 * 7. Update File record with SUCCESS / FAILED status and metadata
 */
export async function processPdfFile({
  fileId,
  fileUrl,
  fileName,
}: ProcessPdfParams): Promise<void> {
  try {
    console.log(`[upload] Starting processing for file ${fileName} (${fileId})`);

    // Mark as processing
    await db.file.update({
      where: { id: fileId },
      data: { uploadStatus: "PROCESSING" },
    });

    // Download file (with timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes

    const response = await fetch(fileUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch file from storage: ${response.status} ${response.statusText}`
      );
    }

    const blob = await response.blob();
    console.log(
      `[upload] File downloaded (${fileName}), size=${blob.size} bytes, type=${blob.type}`
    );

    if (!blob || blob.size === 0) {
      throw new Error("Downloaded file is empty");
    }

    if (blob.type && blob.type !== "application/pdf") {
      console.warn(
        `[upload] Warning: file type is ${blob.type}, expected application/pdf`
      );
    }

    // Create a temporary File-like object for PDFLoader
    const tempFile = new File([blob], fileName, {
      type: "application/pdf",
    });

    // Extract pages & basic metadata
    const loader = new PDFLoader(tempFile);
    const pageLevelDocs = await loader.load();
    console.log(
      `[upload] PDF loaded for ${fileName}, pages=${pageLevelDocs.length}`
    );

    if (!pageLevelDocs.length) {
      throw new Error("PDF appears to be empty or could not be parsed");
    }

    // Enforce free-plan page limits (5 pages per PDF as per marketing site)
    const fileWithUser = await db.file.findUnique({
      where: { id: fileId },
      select: {
        user: {
          select: {
            tier: true,
          },
        },
      },
    });

    const tier = fileWithUser?.user?.tier;
    const isProOrAdmin = tier === "PRO" || tier === "ADMIN";

    if (!isProOrAdmin && pageLevelDocs.length > 5) {
      throw new Error(
        "Free plan supports up to 5 pages per PDF. Upgrade to Pro for larger documents."
      );
    }

    const [metadata, thumbnailUrl] = await Promise.all([
      extractMetadata(fileUrl),
      generateThumbnail(fileUrl),
    ]);

    const fullText = pageLevelDocs.map((d) => d.pageContent).join("\n");

    const [entities, summary] = await Promise.all([
      extractEntities(fullText),
      summarizeDocument(fullText),
    ]);

    // Initialize Pinecone + embeddings and index documents
    console.log("[upload] Initializing Pinecone client...");
    const pinecone = await getPineconeClient();

    const indexName = "talkifydocs";
    try {
      const existing = await pinecone.listIndexes();
      const exists = existing?.some((idx: any) => idx.name === indexName);
      if (!exists) {
        console.log(`[upload] Creating Pinecone index: ${indexName}`);
        await pinecone.createIndex({
          name: indexName,
          dimension: 1536,
          metric: "cosine",
          spec: {
            serverless: {
              cloud: "aws",
              region: "us-east-1",
            },
          },
        } as any);
      }
    } catch (e) {
      console.warn(
        `[upload] Failed to verify/create Pinecone index ${indexName}:`,
        e
      );
      // continue – index may already exist
    }

    const pineconeIndex = pinecone.Index(indexName);
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    console.log("[upload] Storing documents in Pinecone...");
    await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
      pineconeIndex: pineconeIndex as any,
    });
    console.log("[upload] Documents stored in Pinecone");

    // Mark file as successfully processed and attach metadata
    await db.file.update({
      where: { id: fileId },
      data: {
        uploadStatus: "SUCCESS",
        pageCount: metadata.pageCount ?? pageLevelDocs.length,
        summary,
        entities,
        metadata,
        thumbnailUrl,
      },
    });

    console.log(`[upload] Processing finished successfully for ${fileName}`);
  } catch (error) {
    console.error(
      `[upload] Error processing file ${fileName} (${fileId}):`,
      error
    );

    await db.file.update({
      where: { id: fileId },
      data: {
        uploadStatus: "FAILED",
      },
    });

    throw error;
  }
}

type PdfMetadata = {
  pageCount: number;
  summary?: string | null;
  metadata?: Record<string, any> | null;
};

