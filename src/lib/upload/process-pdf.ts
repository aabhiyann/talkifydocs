import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { db } from "@/lib/db";
import { getPineconeClient } from "@/lib/pinecone";
import { groq } from "@/lib/groq";
import { env } from "@/lib/env";
import { extractMetadata } from "./extract-metadata";
import { generateThumbnail } from "./generate-thumbnail";
import { extractEntities } from "./extract-entities";
import { summarizeDocument } from "./summarize-document";
import { PLANS } from "@/config/plans";
import { PINECONE_INDEX_NAME } from "@/config/pinecone";
import { Index as PineconeIndex } from "@pinecone-database/pinecone";
import { withTimeout } from "@/lib/utils";
import { Document } from "@langchain/core/documents";
import { JsonValue } from "@prisma/client/runtime/library";
import { loggers } from "../logger";

import { AI } from "@/config/ai";

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
  let uploadStatus: "SUCCESS" | "FAILED" = "FAILED";
  let processedData: Partial<{
    pageCount: number;
    summary: string | null;
    rawText: string | null;
    entities: JsonValue | null;
    metadata: JsonValue | null;
    thumbnailUrl: string | null;
  }> = {};

  try {
    loggers.upload.info(`Starting processing for file ${fileName} (${fileId})`);

    const file = await db.file.findUnique({
      where: { id: fileId },
      include: { user: true },
    });

    if (!file || !file.user) {
      throw new Error("File or user not found");
    }

    await db.file.update({
      where: { id: fileId },
      data: { uploadStatus: "PROCESSING" },
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes

    const response = await fetch(fileUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch file from storage: ${response.status} ${response.statusText}`,
      );
    }

    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      throw new Error("Downloaded file is empty");
    }

    if (blob.type && blob.type !== "application/pdf") {
      loggers.upload.warn(`Warning: file type is ${blob.type}, expected application/pdf`);
    }

    const tempFile = new File([blob], fileName, { type: "application/pdf" });
    const loader = new PDFLoader(tempFile);
    const pageLevelDocs: Document[] = await withTimeout(loader.load(), 30000);

    if (!pageLevelDocs.length) {
      throw new Error("PDF appears to be empty or could not be parsed");
    }

    const { tier } = file.user;
    const isProOrAdmin = tier === "PRO" || tier === "ADMIN";
    const pageLimit = isProOrAdmin ? PLANS.PRO.pageLimit : PLANS.FREE.pageLimit;

    if (pageLevelDocs.length > pageLimit) {
      throw new Error(
        `${tier} plan supports up to ${pageLimit} pages per PDF. Upgrade to Pro for larger documents.`,
      );
    }

    const [metadata, thumbnailUrl] = await Promise.all([
      withTimeout(extractMetadata(fileUrl), 30000),
      withTimeout(generateThumbnail(fileUrl), 30000).catch((err) => {
        loggers.upload.warn("Thumbnail generation failed, skipping:", err.message);
        return null;
      }),
    ]);

    loggers.upload.info(`Metadata extracted for ${fileName}. Page count: ${metadata.pageCount}`);

    const fullText = pageLevelDocs.map((d: Document) => d.pageContent).join("\n");

    loggers.upload.info(`Starting entities extraction and summarization for ${fileName}`);
    const [entities, summary] = await Promise.all([
      withTimeout(extractEntities(fullText), 30000).catch(err => {
        loggers.upload.warn("Entities extraction failed:", err.message);
        return { people: [], organizations: [], dates: [], locations: [], key_terms: [] };
      }),
      withTimeout(summarizeDocument(fullText), 30000).catch(err => {
        loggers.upload.warn("Summarization failed:", err.message);
        return "Summary generation failed.";
      }),
    ]);

    loggers.upload.info(`Creating embeddings in Pinecone for ${fileName}`);
    try {
      const { GoogleGenerativeAIEmbeddings } = await import("@langchain/google-genai");
      const pinecone = await getPineconeClient();
      const pineconeIndex: PineconeIndex = pinecone.Index(PINECONE_INDEX_NAME);
      
      const embeddings = new GoogleGenerativeAIEmbeddings({
        modelName: AI.GEMINI_EMBEDDING_MODEL,
        apiKey: env.GOOGLE_API_KEY,
      });

      await withTimeout(
        PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
          namespace: fileId,
        }),
        60000,
      );
      loggers.upload.info(`Gemini Embeddings created successfully for ${fileName}`);
    } catch (pineconeErr: any) {
      loggers.upload.error(`Pinecone embedding failed for ${fileName}:`, pineconeErr.message);
      // We still mark as SUCCESS so the user can view the file, but chat might not work well
    }

    uploadStatus = "SUCCESS";
    processedData = {
      pageCount: metadata.pageCount ?? pageLevelDocs.length,
      summary,
      entities: entities as any,
      metadata: metadata as any,
      thumbnailUrl,
      rawText: fullText,
    };

    processedData.metadata = metadata as any;
    processedData.thumbnailUrl = thumbnailUrl;

    loggers.upload.info(`Processing finished successfully for ${fileName}`);
  } catch (error) {
    loggers.upload.error(`Error processing file ${fileName} (${fileId}):`, error);
    throw error;
  } finally {
    await db.file.update({
      where: { id: fileId },
      data: {
        uploadStatus,
        pageCount: processedData.pageCount,
        summary: processedData.summary,
        rawText: processedData.rawText,
        entities: processedData.entities as any,
        metadata: processedData.metadata as any,
        thumbnailUrl: processedData.thumbnailUrl,
      },
    });
  }
}
