import { db } from "@/db";
import { requireUser } from "@/lib/auth";

import { createUploadthing, type FileRouter } from "uploadthing/next";

import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";

import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { getPineconeClient } from "@/lib/pinecone";
import { checkRateLimit, getClientIP } from "@/lib/security";
import { validateFileUpload } from "@/lib/validation";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "200MB" } }) // Max size, will check plan limits in middleware
    .middleware(async ({ req, files }) => {
      const clientIP = getClientIP(req);

      // Check rate limit for uploads
      const rateLimit = checkRateLimit(clientIP, "UPLOAD");
      if (!rateLimit.allowed) {
        throw new Error("Upload rate limit exceeded. Please try again later.");
      }

      const user = await requireUser();

      if (!user.id) throw new Error("Unauthorized");

      // Check user plan limits (placeholder for now)
      // TODO: Get actual user plan from database
      const isProUser = false; // Will be replaced with actual plan check
      const maxFileSize = isProUser ? 200 * 1024 * 1024 : 50 * 1024 * 1024;
      
      // Validate file sizes
      for (const file of files) {
        if (file.size > maxFileSize) {
          throw new Error(
            `File ${file.name} exceeds the ${isProUser ? "200MB" : "50MB"} limit for your plan.`
          );
        }
      }

      return { userId: user.id, userPlan: isProUser ? "pro" : "free" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        console.log(
          `Upload completed for file: ${file.name}, key: ${file.key}`
        );
        console.log(`File URL: ${file.url}`);
        console.log(`User ID: ${metadata.userId}`);

        const createdFile = await db.file.create({
          data: {
            key: file.key,
            name: file.name,
            userId: metadata.userId,
            url: file.url,
            uploadStatus: "PROCESSING",
          },
        });

        console.log(`File created in database with ID: ${createdFile.id}`);
        
        // Return file info immediately for client status tracking
        // Processing will continue in background
        const fileInfo = {
          id: createdFile.id,
          name: file.name,
          status: "PROCESSING",
        };

        try {
          console.log(`Starting file processing for ${file.name}...`);

          // Add timeout to prevent long-running requests
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

          const response = await fetch(file.url, {
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(
              `Failed to fetch file from S3: ${response.status} ${response.statusText}`
            );
          }

          const blob = await response.blob();
          console.log(`File downloaded, size: ${blob.size} bytes`);

          // Validate PDF file
          if (blob.size === 0) {
            throw new Error("Downloaded file is empty");
          }

          if (blob.type !== "application/pdf") {
            console.warn(`File type is ${blob.type}, expected application/pdf`);
          }

          // Create a temporary file-like object for PDFLoader
          const tempFile = new File([blob], file.name, {
            type: "application/pdf",
          });

          const loader = new PDFLoader(tempFile);
          const pageLevelDocs = await loader.load();
          console.log(`PDF loaded, ${pageLevelDocs.length} pages`);

          if (pageLevelDocs.length === 0) {
            throw new Error("PDF file appears to be empty or corrupted");
          }

          // vectorize and index entire document
          console.log("Initializing Pinecone client...");
          const pinecone = await getPineconeClient();

          // Check if index exists, create if it doesn't
          const indexName = "talkifydocs";

          try {
            const existingIndexes = await pinecone.listIndexes();
            const indexExists = existingIndexes?.some(
              (index: any) => index.name === indexName
            );

            if (!indexExists) {
              console.log(`Creating Pinecone index: ${indexName}`);
              await pinecone.createIndex({
                name: indexName,
                dimension: 1536, // OpenAI embedding dimension
                metric: "cosine",
                spec: {
                  serverless: {
                    cloud: "aws",
                    region: "us-east-1",
                  },
                },
              } as any); // Type assertion to fix API compatibility
              console.log(`Pinecone index ${indexName} created`);
            }
          } catch (indexError) {
            console.log(
              `Index ${indexName} may already exist or there was an error checking:`,
              indexError
            );
            // Continue anyway - the index might already exist
          }

          const pineconeIndex = pinecone.Index(indexName);
          console.log("Pinecone client initialized");

          const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY,
          });
          console.log("OpenAI embeddings initialized");

          console.log("Storing documents in Pinecone...");
          await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
            pineconeIndex: pineconeIndex as any, // Type assertion to fix compatibility issue
          });
          console.log("Documents stored in Pinecone successfully");

          await db.file.update({
            data: {
              uploadStatus: "SUCCESS",
            },
            where: {
              id: createdFile.id,
            },
          });
          console.log(
            `File processing completed successfully for ${file.name}`
          );
        } catch (err) {
          console.error(`File processing failed for ${file.name}:`, err);
          console.error("Error details:", {
            message: err instanceof Error ? err.message : "Unknown error",
            stack: err instanceof Error ? err.stack : undefined,
            name: err instanceof Error ? err.name : undefined,
          });

          // Handle specific error types
          let errorStatus: "FAILED" = "FAILED";
          if (err instanceof Error) {
            if (err.name === "AbortError") {
              console.error("File processing timed out");
              errorStatus = "FAILED";
            } else if (err.message.includes("setup")) {
              console.error(
                "PDF parsing library error - this may be due to a corrupted file"
              );
              errorStatus = "FAILED";
            }
          }

          await db.file.update({
            data: {
              uploadStatus: errorStatus,
            },
            where: {
              id: createdFile.id,
            },
          });
        }
      } catch (outerError) {
        console.error(
          `Outer error in onUploadComplete for ${file.name}:`,
          outerError
        );
        console.error("Outer error details:", {
          message:
            outerError instanceof Error ? outerError.message : "Unknown error",
          stack: outerError instanceof Error ? outerError.stack : undefined,
          name: outerError instanceof Error ? outerError.name : undefined,
        });
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
