"use server";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createConversation(fileIds: string[]) {
  const user = await requireUser();

  if (!Array.isArray(fileIds) || fileIds.length === 0) {
    throw new Error("At least one file is required");
  }

  if (fileIds.length > 5) {
    throw new Error("Maximum 5 files allowed per conversation");
  }

  // Verify user owns all files
  const files = await db.file.findMany({
    where: {
      id: { in: fileIds },
      userId: user.id,
    },
  });

  if (files.length !== fileIds.length) {
    throw new Error("Invalid file access - some files not found or not owned by user");
  }

  // Generate title from file names
  const title =
    files.length === 1
      ? files[0].name
      : `${files.length} Documents`;

  // Create conversation
  const conversation = await db.conversation.create({
    data: {
      title,
      userId: user.id,
      conversationFiles: {
        create: fileIds.map((fileId) => ({ fileId })),
      },
    },
    include: {
      conversationFiles: {
        include: {
          file: true,
        },
      },
    },
  });

  revalidatePath("/dashboard");
  return conversation;
}

export async function addFileToConversation(
  conversationId: string,
  fileId: string
) {
  const user = await requireUser();

  // Verify ownership
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      conversationFiles: true,
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (conversation.userId !== user.id) {
    throw new Error("Unauthorized");
  }

  // Check file limit
  if (conversation.conversationFiles.length >= 5) {
    throw new Error("Maximum 5 files allowed per conversation");
  }

  // Check if file already in conversation
  const alreadyAdded = conversation.conversationFiles.some(
    (cf) => cf.fileId === fileId
  );

  if (alreadyAdded) {
    throw new Error("File already in conversation");
  }

  const file = await db.file.findUnique({
    where: { id: fileId },
  });

  if (!file || file.userId !== user.id) {
    throw new Error("File not found or unauthorized");
  }

  await db.conversationFile.create({
    data: {
      conversationId,
      fileId,
    },
  });

  revalidatePath(`/chat/${conversationId}`);
  return { success: true };
}

export async function removeFileFromConversation(
  conversationId: string,
  fileId: string
) {
  const user = await requireUser();

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      conversationFiles: true,
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (conversation.userId !== user.id) {
    throw new Error("Unauthorized");
  }

  // Don't allow removing the last file
  if (conversation.conversationFiles.length <= 1) {
    throw new Error("Cannot remove the last file from conversation");
  }

  await db.conversationFile.delete({
    where: {
      conversationId_fileId: {
        conversationId,
        fileId,
      },
    },
  });

  revalidatePath(`/chat/${conversationId}`);
  return { success: true };
}

