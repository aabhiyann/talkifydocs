import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit, getClientIP } from "@/lib/security";
import { loggers } from "@/lib/logger";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (
        pathname,
        clientPayload
      ) => {
        console.log("Upload: onBeforeGenerateToken started");
        // 1. Authenticate user
        const user = await getCurrentUser();
        if (!user || !user.id) {
          console.error("Upload: User unauthorized");
          throw new Error('Unauthorized');
        }
        console.log("Upload: User authenticated", user.id);

        // 2. Check rate limit
        const clientIP = getClientIP(request);
        const rateLimit = await checkRateLimit(clientIP, "UPLOAD");
        if (!rateLimit.allowed) {
          console.error("Upload: Rate limit exceeded for IP", clientIP);
          throw new Error("Upload rate limit exceeded");
        }

        // 3. Get user tier and limits
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { tier: true },
        });

        const isProUser = dbUser?.tier === "PRO" || dbUser?.tier === "ADMIN";
        
        // Parse size from clientPayload
        const { size } = clientPayload ? JSON.parse(clientPayload) : { size: 0 };

        return {
          allowedContentTypes: ['application/pdf'],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            userId: user.id,
            userPlan: isProUser ? "pro" : "free",
            size,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // ... (existing code)
        // 4. Save file to database
        const { userId, size } = JSON.parse(tokenPayload as string);

        try {
          const createdFile = await db.file.create({
            data: {
              key: blob.url,
              name: blob.pathname.split('/').pop() || 'Untitled',
              userId: userId,
              url: blob.url,
              size: BigInt(size || 0),
              pageCount: 0,
              uploadStatus: "PROCESSING",
            },
          });

          loggers.upload.info({ fileId: createdFile.id, userId }, "File created in database via Vercel Blob");

          // 5. Kick off processing
          const { processPdfFile } = await import("@/lib/upload/process-pdf");
          await processPdfFile({
            fileId: createdFile.id,
            fileUrl: createdFile.url,
            fileName: createdFile.name,
          });
        } catch (error) {
          loggers.upload.error({ error, blob }, "Failed to handle upload completion for Vercel Blob");
          throw new Error('Could not handle upload completion');
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Upload: Error in POST handler", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
