import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { db } from "@/lib/db";
import { getPineconeClient } from "@/lib/pinecone";
import { extractPdfMetadata } from "./extract-metadata";
import { generatePdfThumbnail } from "./generate-thumbnail";

type ProcessPdfParams = {
  fileId: string;
  fileUrl: string;
  fileName: string;
};

/**
 * End-to-end PDF processing pipeline:
 * 1. Download PDF from storage
 * 2. Validate content & type
 * 3. Extract metadata (page count, etc.)
 * 4. Generate thumbnail (best-effort, optional)
 * 5. Create embeddings in Pinecone
 * 6. Update File record with SUCCESS / FAILED status and metadata
 */
export async function processPdfFile({
  fileId,
  fileUrl,
  fileName,
}: ProcessPdfParams): Promise<void> {
  try {
    console.log(`[upload] Starting processing for file ${fileName} (${fileId})`);

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

    const metadata = await extractPdfDetails(pageLevelDocs);
    const thumbnailUrl = await safeGenerateThumbnail(fileId, fileUrl);

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
        pageCount: metadata.pageCount,
        summary: metadata.summary,
        metadata: metadata.metadata ?? undefined,
        thumbnailUrl: thumbnailUrl ?? undefined,
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

async function extractPdfDetails(
  pageLevelDocs: Awaited<ReturnType<PDFLoader["load"]>>
): Promise<PdfMetadata> {
  try {
    const base = await extractPdfMetadata(pageLevelDocs);
    return {
      pageCount: base.pageCount ?? pageLevelDocs.length,
      summary: base.summary ?? null,
      metadata: base.metadata ?? null,
    };
  } catch (e) {
    console.warn("[upload] Failed to extract PDF metadata:", e);
    return {
      pageCount: pageLevelDocs.length,
      summary: null,
      metadata: null,
    };
  }
}

async function safeGenerateThumbnail(
  fileId: string,
  fileUrl: string
): Promise<string | null> {
  try {
    const thumbnailUrl = await generatePdfThumbnail({ fileId, fileUrl });
    if (thumbnailUrl) {
      console.log(
        `[upload] Generated thumbnail for file ${fileId}: ${thumbnailUrl}`
      );
    }
    return thumbnailUrl;
  } catch (e) {
    console.warn(
      `[upload] Failed to generate thumbnail for file ${fileId}:`,
      e
    );
    return null;
  }
}


