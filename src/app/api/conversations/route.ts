import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

// List conversations for the current user
export async function GET() {
  const user = await requireUser();

  const conversations = await db.conversation.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      conversationFiles: {
        include: {
          file: true,
        },
      },
    },
  });

  return NextResponse.json({ conversations });
}

// Create a new conversation with optional attached files
export async function POST(req: NextRequest) {
  const user = await requireUser();
  const body = await req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { title, fileIds } = body as {
    title?: string;
    fileIds?: string[];
  };

  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const safeFileIds = Array.isArray(fileIds) ? fileIds : [];

  // Ensure files belong to user before linking
  const userFiles =
    safeFileIds.length > 0
      ? await db.file.findMany({
          where: {
            id: { in: safeFileIds },
            userId: user.id,
          },
          select: { id: true },
        })
      : [];

  const conversation = await db.conversation.create({
    data: {
      title,
      userId: user.id,
      conversationFiles:
        userFiles.length > 0
          ? {
              create: userFiles.map((f) => ({ fileId: f.id })),
            }
          : undefined,
    },
    include: {
      conversationFiles: {
        include: { file: true },
      },
    },
  });

  return NextResponse.json({ conversation }, { status: 201 });
}


