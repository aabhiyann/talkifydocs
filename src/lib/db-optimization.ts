import { db } from "@/db";

// Optimized queries with proper includes and selects
export const optimizedQueries = {
  // Get user files with minimal data
  getUserFiles: (userId: string) => {
    return db.file.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        uploadStatus: true,
        createdAt: true,
        updatedAt: true,
        // Don't select url and key unless needed
      },
      orderBy: { createdAt: "desc" },
    });
  },

  // Get file with messages count
  getFileWithMessageCount: (fileId: string, userId: string) => {
    return db.file.findFirst({
      where: { id: fileId, userId },
      select: {
        id: true,
        name: true,
        uploadStatus: true,
        url: true,
        key: true,
        createdAt: true,
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });
  },

  // Get messages with pagination
  getMessagesPaginated: (fileId: string, limit: number = 10, cursor?: string) => {
    return db.message.findMany({
      where: { fileId },
      select: {
        id: true,
        text: true,
        isUserMessage: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });
  },

  // Get user subscription with minimal data
  getUserSubscription: (userId: string) => {
    return db.user.findFirst({
      where: { id: userId },
      select: {
        id: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
      },
    });
  },
};

// Batch operations for better performance
export const batchOperations = {
  // Create multiple messages in one transaction
  createMessages: async (messages: Array<{
    text: string;
    isUserMessage: boolean;
    userId: string;
    fileId: string;
  }>) => {
    return db.$transaction(
      messages.map(message => 
        db.message.create({ data: message })
      )
    );
  },

  // Update multiple files in one transaction
  updateFiles: async (updates: Array<{
    id: string;
    data: any;
  }>) => {
    return db.$transaction(
      updates.map(({ id, data }) =>
        db.file.update({ where: { id }, data })
      )
    );
  },
};

// Cache configuration for frequently accessed data
export const cacheConfig = {
  // Cache user files for 5 minutes
  userFiles: {
    ttl: 5 * 60 * 1000, // 5 minutes
    key: (userId: string) => `user-files:${userId}`,
  },
  
  // Cache file details for 10 minutes
  fileDetails: {
    ttl: 10 * 60 * 1000, // 10 minutes
    key: (fileId: string) => `file-details:${fileId}`,
  },
  
  // Cache user subscription for 1 hour
  userSubscription: {
    ttl: 60 * 60 * 1000, // 1 hour
    key: (userId: string) => `user-subscription:${userId}`,
  },
};
