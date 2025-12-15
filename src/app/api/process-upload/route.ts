import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("fileId");

  if (!fileId) {
    return new Response("Missing fileId", { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (data: any) => {
        const payload = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      try {
        let attempts = 0;
        const maxAttempts = 120; // ~2 minutes @ 1s interval

        while (attempts < maxAttempts) {
          const file = await db.file.findUnique({
            where: { id: fileId },
            select: {
              id: true,
              name: true,
              uploadStatus: true,
              thumbnailUrl: true,
              pageCount: true,
              metadata: true,
            },
          });

          if (!file) {
            sendEvent({ status: "NOT_FOUND" });
            break;
          }

          sendEvent({
            status: file.uploadStatus,
            file,
          });

          if (file.uploadStatus === "SUCCESS" || file.uploadStatus === "FAILED") {
            break;
          }

          attempts += 1;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error("[process-upload] SSE error:", error);
        const encoder = new TextEncoder();
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ status: "ERROR" })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}


