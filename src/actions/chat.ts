"use server";

import { db } from "@/lib/db";

export async function createConversation(params: {
  userId: string;
  title: string;
  fileIds?: string[];
}) {
  const { userId, title, fileIds } = params;

  const safeFileIds = Array.isArray(fileIds) ? fileIds : [];

  const userFiles =
    safeFileIds.length > 0
      ? await db.file.findMany({
          where: {
            id: { in: safeFileIds },
            userId,
          },
          select: { id: true },
        })
      : [];

  return db.conversation.create({
    data: {
      title,
      userId,
      conversationFiles:
        userFiles.length > 0
          ? {
              create: userFiles.map((f) => ({ fileId: f.id })),
            }
          : undefined,
    },
  });
}

export async function getConversationMessages(params: {
  userId: string;
  conversationId: string;
  limit?: number;
}) {
  const { userId, conversationId, limit = 100 } = params;

  const conversation = await db.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
    select: { id: true },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const messages = await db.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: limit,
    include: {
      file: true,
    },
  });

  return messages;
}

export async function createMessage(params: {
  userId: string;
  conversationId: string;
  fileId?: string;
  text: string;
  isUserMessage: boolean;
  citations?: unknown;
}) {
  const { userId, conversationId, fileId, text, isUserMessage, citations } = params;

  // Ensure conversation belongs to user
  const conversation = await db.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
    select: { id: true },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  return db.message.create({
    data: {
      text,
      isUserMessage,
      userId,
      conversationId,
      fileId,
      citations: citations as any,
    },
  });
}
