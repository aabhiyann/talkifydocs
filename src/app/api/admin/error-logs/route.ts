import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    // For now, return empty array since we don't have a dedicated error log table
    // In production, you'd query from a logging service or error tracking DB
    const logs: any[] = [];

    // Optionally, you could query failed file uploads as a proxy for errors
    const failedFiles = await db.file.findMany({
      where: {
        uploadStatus: "FAILED",
      },
      take: 10,
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        name: true,
        uploadStatus: true,
        updatedAt: true,
      },
    });

    const errorLogs = failedFiles.map((file) => ({
      id: file.id,
      message: `File upload failed: ${file.name}`,
      level: "error" as const,
      timestamp: file.updatedAt,
      context: {
        fileId: file.id,
        fileName: file.name,
      },
    }));

    return NextResponse.json({ logs: errorLogs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    );
  }
}

