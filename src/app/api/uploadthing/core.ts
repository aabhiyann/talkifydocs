// import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/dist/types/server";
import { db } from "@/db";
import { useUploadThing } from "@/lib/uploadthing";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import { createUploadthing, type FileRouter } from "uploadthing/next";

import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";

import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { getPineconeClient } from "@/lib/pinecone";
import { checkRateLimit, getClientIP } from "@/lib/security";
import { validateFileUpload } from "@/lib/validation";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const clientIP = getClientIP(req);
      
      // Check rate limit for uploads
      const rateLimit = checkRateLimit(clientIP, 'UPLOAD');
      if (!rateLimit.allowed) {
        throw new Error("Upload rate limit exceeded. Please try again later.");
      }
      
      const { getUser } = getKindeServerSession();
      const user = await getUser();

      if (!user || !user.id) throw new Error("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
          uploadStatus: "PROCESSING",
        },
      });

      try {
        console.log(`Starting PDF processing for file: ${file.name} (${file.key})`);
        
        const response = await fetch(
          `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch file from S3: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        console.log(`File fetched successfully, size: ${blob.size} bytes`);

        const loader = new PDFLoader(blob);
        const pageLevelDocs = await loader.load();
        console.log(`PDF loaded successfully, pages: ${pageLevelDocs.length}`);

        const pagesAmt = pageLevelDocs.length;

        // vectorize and index entire document
        console.log('Starting Pinecone indexing...');
        const pinecone = await getPineconeClient();
        const pineconeIndex = pinecone.Index("talkifydocs");

        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        });

        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
          // namespace: createdFile.id,
        });
        
        console.log('Pinecone indexing completed successfully');

        await db.file.update({
          data: {
            uploadStatus: "SUCCESS",
          },
          where: {
            id: createdFile.id,
          },
        });
        
        console.log(`File processing completed successfully for: ${file.name}`);
      } catch (err) {
        console.error(`File processing failed for ${file.name}:`, err);
        
        // Log specific error details
        if (err instanceof Error) {
          console.error(`Error message: ${err.message}`);
          console.error(`Error stack: ${err.stack}`);
        }
        
        // Check for specific error types
        if (err instanceof Error) {
          if (err.message.includes('OpenAI')) {
            console.error('OpenAI API error - check OPENAI_API_KEY');
          } else if (err.message.includes('Pinecone')) {
            console.error('Pinecone error - check PINECONE_API_KEY and PINECONE_ENVIRONMENT');
          } else if (err.message.includes('fetch')) {
            console.error('Network error - check file URL and network connection');
          }
        }
        
        await db.file.update({
          data: {
            uploadStatus: "FAILED",
          },
          where: {
            id: createdFile.id,
          },
        });
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
