import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { loggers } from "@/lib/logger";

export async function POST(req: NextRequest) {
  console.log("[Upload Complete] API called");
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      console.error("[Upload Complete] Unauthorized user");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { url, size, fileName } = body;
    console.log("[Upload Complete] Payload received:", { url, size, fileName });

    if (!url || !fileName) {
      console.error("[Upload Complete] Missing required fields");
      return new NextResponse("Missing fields", { status: 400 });
    }

    // Check if file already exists
    const existingFile = await db.file.findUnique({
      where: { key: url },
    });

    if (existingFile) {
      console.log("[Upload Complete] File already exists, returning existing record:", existingFile.id);
      return NextResponse.json({
        ...existingFile,
        size: existingFile.size.toString(),
      });
    }

    console.log("[Upload Complete] Creating new DB record");
    const createdFile = await db.file.create({
      data: {
        key: url,
        name: fileName,
        userId: user.id,
        url: url,
        size: BigInt(size || 0),
        pageCount: 0,
        uploadStatus: "PROCESSING",
      },
    });
    console.log("[Upload Complete] DB record created:", createdFile.id);

    // Kick off processing in background
    try {
        console.log("[Upload Complete] Importing processPdfFile");
        const { processPdfFile } = await import("@/lib/upload/process-pdf");
        
        console.log("[Upload Complete] Invoking processPdfFile");
        processPdfFile({
            fileId: createdFile.id,
            fileUrl: createdFile.url,
            fileName: createdFile.name,
        }).catch(err => {
            console.error("[Upload Complete] Background processing failed:", err);
            try {
                loggers.upload.error("Manual complete processing failed", err);
            } catch (logErr) {
                console.error("Logger failed:", logErr);
            }
        });
    } catch (importErr) {
        console.error("[Upload Complete] Failed to import/start processor:", importErr);
        // Don't fail the request if processing start fails, we still have the file record
    }

    console.log("[Upload Complete] Sending success response");
    return NextResponse.json({
        ...createdFile,
        size: createdFile.size.toString(),
    });

  } catch (error) {
    console.error("[Upload Complete] Fatal error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(
        JSON.stringify({ error: errorMessage }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}