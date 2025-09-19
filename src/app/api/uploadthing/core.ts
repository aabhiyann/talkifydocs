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
        const response = await fetch(
          `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch file from S3: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();

        const loader = new PDFLoader(blob);
        const pageLevelDocs = await loader.load();

        // vectorize and index entire document
        const pinecone = await getPineconeClient();
        const pineconeIndex = pinecone.Index("talkifydocs");

        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        });

        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
        });

        await db.file.update({
          data: {
            uploadStatus: "SUCCESS",
          },
          where: {
            id: createdFile.id,
          },
        });
      } catch (err) {
        console.error(`File processing failed for ${file.name}:`, err);
        
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
