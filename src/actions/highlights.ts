"use server";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveAsHighlight(
  question: string,
  answer: string,
  fileId: string,
  citations?: unknown[],
) {
  const user = await requireUser();

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!file) {
    throw new Error("File not found or unauthorized");
  }

  const highlight = await db.highlight.create({
    data: {
      question,
      answer,
      citations: citations as any,
      userId: user.id,
      fileId: file.id,
    },
    include: {
      file: true,
    },
  });

  revalidatePath("/highlights");
  return highlight;
}

export async function getHighlights(fileId?: string) {
  const user = await requireUser();

  return db.highlight.findMany({
    where: {
      userId: user.id,
      ...(fileId ? { fileId } : {}),
    },
    include: {
      file: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function deleteHighlight(id: string) {
  const user = await requireUser();

  const highlight = await db.highlight.findUnique({
    where: { id },
  });

  if (!highlight) {
    throw new Error("Highlight not found");
  }

  if (highlight.userId !== user.id) {
    throw new Error("Unauthorized");
  }

  await db.highlight.delete({
    where: { id },
  });

  revalidatePath("/highlights");
  return { success: true };
}

// Legacy exports for backward compatibility
export async function createHighlight(params: {
  userId: string;
  fileId: string;
  question: string;
  answer: string;
  citations?: unknown;
}) {
  const user = await requireUser();
  if (user.id !== params.userId) {
    throw new Error("Unauthorized");
  }
  return saveAsHighlight(
    params.question,
    params.answer,
    params.fileId,
    Array.isArray(params.citations) ? params.citations : undefined,
  );
}

export async function listHighlights(params: { userId: string; fileId?: string }) {
  const user = await requireUser();
  if (user.id !== params.userId) {
    throw new Error("Unauthorized");
  }
  return getHighlights(params.fileId);
}
