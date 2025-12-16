import { db } from "@/db";
import { loggers } from "./logger";

// Optimized file queries
export async function getFilesByUserId(userId: string) {
  const startTime = Date.now();

  try {
    const files = await db.file.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    loggers.db.info({
      operation: "getFilesByUserId",
      userId,
      count: files.length,
      duration: Date.now() - startTime,
    });

    return files;
  } catch (error) {
    loggers.db.error({
      operation: "getFilesByUserId",
      userId,
      error,
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function getFileById(fileId: string, userId: string) {
  const startTime = Date.now();

  try {
    const file = await db.file.findFirst({
      where: {
        id: fileId,
        userId,
      },
      select: {
        id: true,
        name: true,
        url: true,
        uploadStatus: true,
        createdAt: true,
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    loggers.db.info({
      operation: "getFileById",
      fileId,
      userId,
      found: !!file,
      duration: Date.now() - startTime,
    });

    return file;
  } catch (error) {
    loggers.db.error({
      operation: "getFileById",
      fileId,
      userId,
      error,
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function getMessagesByFileId(fileId: string, userId: string, limit = 10, offset = 0) {
  const startTime = Date.now();

  try {
    const messages = await db.message.findMany({
      where: {
        fileId,
        userId,
      },
      select: {
        id: true,
        text: true,
        isUserMessage: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: limit,
      skip: offset,
    });

    loggers.db.info({
      operation: "getMessagesByFileId",
      fileId,
      userId,
      limit,
      offset,
      count: messages.length,
      duration: Date.now() - startTime,
    });

    return messages;
  } catch (error) {
    loggers.db.error({
      operation: "getMessagesByFileId",
      fileId,
      userId,
      error,
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function createMessage(data: {
  text: string;
  isUserMessage: boolean;
  fileId: string;
  userId: string;
}) {
  const startTime = Date.now();

  try {
    const message = await db.message.create({
      data,
      select: {
        id: true,
        text: true,
        isUserMessage: true,
        createdAt: true,
      },
    });

    loggers.db.info({
      operation: "createMessage",
      fileId: data.fileId,
      userId: data.userId,
      isUserMessage: data.isUserMessage,
      duration: Date.now() - startTime,
    });

    return message;
  } catch (error) {
    loggers.db.error({
      operation: "createMessage",
      fileId: data.fileId,
      userId: data.userId,
      error,
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function updateFileStatus(
  fileId: string,
  status: "PENDING" | "PROCESSING" | "FAILED" | "SUCCESS",
) {
  const startTime = Date.now();

  try {
    const file = await db.file.update({
      where: { id: fileId },
      data: { uploadStatus: status },
      select: {
        id: true,
        uploadStatus: true,
      },
    });

    loggers.db.info({
      operation: "updateFileStatus",
      fileId,
      status,
      duration: Date.now() - startTime,
    });

    return file;
  } catch (error) {
    loggers.db.error({
      operation: "updateFileStatus",
      fileId,
      status,
      error,
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

// Batch operations for better performance
export async function createMessagesBatch(
  messages: Array<{
    text: string;
    isUserMessage: boolean;
    fileId: string;
    userId: string;
  }>,
) {
  const startTime = Date.now();

  try {
    const result = await db.message.createMany({
      data: messages,
    });

    loggers.db.info({
      operation: "createMessagesBatch",
      count: messages.length,
      created: result.count,
      duration: Date.now() - startTime,
    });

    return result;
  } catch (error) {
    loggers.db.error({
      operation: "createMessagesBatch",
      count: messages.length,
      error,
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
