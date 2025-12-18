import { handleUpload, type HandleUploadBody } from '@vercel/blob/next';
import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit, getClientIP } from "@/lib/security";
import { loggers } from "@/lib/logger";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (
        pathname,
        /* clientPayload */
      ) => {
        // 1. Authenticate user
        const user = await getCurrentUser();
        if (!user || !user.id) {
          throw new Error('Unauthorized');
        }

        // 2. Check rate limit
        const clientIP = getClientIP(request);
        const rateLimit = await checkRateLimit(clientIP, "UPLOAD");
        if (!rateLimit.allowed) {
          throw new Error("Upload rate limit exceeded");
        }

        // 3. Get user tier and limits
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { tier: true },
        });

        const isProUser = dbUser?.tier === "PRO" || dbUser?.tier === "ADMIN";

        return {
          allowedContentTypes: ['application/pdf'],
          tokenPayload: JSON.stringify({
            userId: user.id,
            userPlan: isProUser ? "pro" : "free",
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // 4. Save file to database
        const { userId } = JSON.parse(tokenPayload as string);

        try {
          const createdFile = await db.file.create({
            data: {
              key: blob.url,
              name: blob.pathname.split('/').pop() || 'Untitled',
              userId: userId,
              url: blob.url,
              size: BigInt(blob.size),
              pageCount: null,
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
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
