import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { checkRateLimit, getClientIP } from "@/lib/security";
import { validateFileUpload } from "@/lib/validation";
import { processPdfFile } from "@/lib/upload/process-pdf";
import { loggers } from "@/lib/logger";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "16MB" } }) // Max size, will check plan limits in middleware
    .middleware(async ({ req, files }) => {
      const clientIP = getClientIP(req);

      // Check rate limit for uploads
      const rateLimit = await checkRateLimit(clientIP, "UPLOAD");
      if (!rateLimit.allowed) {
        throw new Error("Upload rate limit exceeded. Please try again later.");
      }

      const user = await requireUser();

      if (!user.id) throw new Error("Unauthorized");

      // Check user plan limits based on User tier
      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: { tier: true },
      });

      const isProUser = dbUser?.tier === "PRO" || dbUser?.tier === "ADMIN";
      const maxFileSize = isProUser ? 200 * 1024 * 1024 : 50 * 1024 * 1024;

      // Validate file sizes
      for (const file of files) {
        if (file.size > maxFileSize) {
          throw new Error(
            `File ${file.name} exceeds the ${isProUser ? "200MB" : "50MB"} limit for your plan.`,
          );
        }
      }

      return { userId: user.id, userPlan: isProUser ? "pro" : "free" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        loggers.upload.info(`Upload completed for file: ${file.name}, key=${file.key}`);
        loggers.upload.debug(`File URL: ${file.url}`);
        loggers.upload.debug(`User ID: ${metadata.userId}`);

        const createdFile = await db.file.create({
          data: {
            key: file.key,
            name: file.name,
            userId: metadata.userId,
            url: file.url,
            size: BigInt(file.size),
            pageCount: null,
            uploadStatus: "PROCESSING",
          },
        });

        loggers.upload.info(`File created in database with ID: ${createdFile.id}`);

        // Kick off processing (awaited so failures surface in logs, but the client
        // already has a response and will track status separately).
        await processPdfFile({
          fileId: createdFile.id,
          fileUrl: file.url,
          fileName: file.name,
        });

        // Return file info for client-side status tracking (via serverData)
        return {
          id: createdFile.id,
          name: createdFile.name,
          status: createdFile.uploadStatus,
        };
      } catch (outerError) {
        loggers.upload.error(`Outer error in onUploadComplete for ${file.name}:`, outerError);
        return {
          id: null,
          name: file.name,
          status: "FAILED" as const,
        };
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
