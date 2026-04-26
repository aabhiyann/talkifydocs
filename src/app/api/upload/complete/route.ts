import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { loggers } from "@/lib/logger";

export async function POST(req: NextRequest) {
  loggers.upload.info("complete: API called");
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      loggers.upload.warn("complete: unauthorized user");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { url, size, fileName } = body;
    loggers.upload.info("complete: payload received", { url, size, fileName });

    if (!url || !fileName) {
      loggers.upload.warn("complete: missing required fields");
      return new NextResponse("Missing fields", { status: 400 });
    }

    // Only return an existing record if it belongs to the current user.
    // Looking up by `key: url` alone would leak another user's file metadata
    // (id, name, userId, size, etc.) if they happened to share the same key.
    const existingFile = await db.file.findFirst({
      where: { key: url, userId: user.id },
    });

    if (existingFile) {
      loggers.upload.info(
        "complete: file already exists for user, returning existing record",
        { fileId: existingFile.id },
      );
      return NextResponse.json({
        ...existingFile,
        size: existingFile.size.toString(),
      });
    }

    loggers.upload.info("complete: creating new DB record");
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
    loggers.upload.info("complete: DB record created", { fileId: createdFile.id });

    try {
      loggers.upload.debug("complete: importing processPdfFile");
      const { processPdfFile } = await import("@/lib/upload/process-pdf");

      loggers.upload.debug("complete: invoking processPdfFile");
      processPdfFile({
        fileId: createdFile.id,
        fileUrl: createdFile.url,
        fileName: createdFile.name,
      }).catch((err) => {
        // Both calls go through the same logger; if the logger itself
        // fails we have nothing to fall back to and that's already an
        // exceptional state.
        loggers.upload.error("complete: background processing failed", err);
        loggers.upload.error("complete: manual complete processing failed", err);
      });
    } catch (importErr) {
      loggers.upload.error(
        "complete: failed to import/start processor",
        importErr,
      );
      // Don't fail the request if processing start fails, we still have the file record
    }

    loggers.upload.info("complete: sending success response");
    return NextResponse.json({
      ...createdFile,
      size: createdFile.size.toString(),
    });
  } catch (error) {
    loggers.upload.error("complete: fatal error", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
