"use server";

import { db } from "@/lib/db";

export async function createHighlight(params: {
  userId: string;
  fileId: string;
  question: string;
  answer: string;
  citations?: unknown;
}) {
  const { userId, fileId, question, answer, citations } = params;

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
    select: { id: true },
  });

  if (!file) {
    throw new Error("File not found");
  }

  return db.highlight.create({
    data: {
      question,
      answer,
      citations: citations as any,
      userId,
      fileId: file.id,
    },
  });
}

export async function listHighlights(params: {
  userId: string;
  fileId?: string;
}) {
  const { userId, fileId } = params;

  return db.highlight.findMany({
    where: {
      userId,
      ...(fileId ? { fileId } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      file: true,
    },
  });
}


