import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

// List highlights for the current user, optionally filtered by fileId
export async function GET(req: NextRequest) {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("fileId");

  const highlights = await db.highlight.findMany({
    where: {
      userId: user.id,
      ...(fileId ? { fileId } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      file: true,
    },
  });

  return NextResponse.json({ highlights });
}

// Create a new highlight
export async function POST(req: NextRequest) {
  const user = await requireUser();
  const body = await req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { question, answer, citations, fileId } = body as {
    question?: string;
    answer?: string;
    citations?: unknown;
    fileId?: string;
  };

  if (!question || !answer || !fileId) {
    return NextResponse.json(
      { error: "question, answer and fileId are required" },
      { status: 400 }
    );
  }

  // Ensure file belongs to user
  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const highlight = await db.highlight.create({
    data: {
      question,
      answer,
      citations: citations as any,
      userId: user.id,
      fileId: file.id,
    },
  });

  return NextResponse.json({ highlight }, { status: 201 });
}


