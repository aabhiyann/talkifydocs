"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { loggers } from "@/lib/logger";

export async function updateUserTier(
  userId: string,
  tier: "FREE" | "PRO" | "ADMIN"
) {
  const admin = await requireAdmin();

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await db.user.update({
    where: { id: userId },
    data: { tier },
  });

  loggers.api.info(
    {
      operation: "admin_update_user_tier",
      adminId: admin.id,
      targetUserId: userId,
      oldTier: user.tier,
      newTier: tier,
    },
    "Admin updated user tier"
  );

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const admin = await requireAdmin();

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          files: true,
          messages: true,
          conversations: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Prevent deleting yourself
  if (user.id === admin.id) {
    throw new Error("Cannot delete your own account");
  }

  // Prevent deleting other admins (optional safety check)
  if (user.tier === "ADMIN" && user.id !== admin.id) {
    throw new Error("Cannot delete other admin accounts");
  }

  // Delete user (cascade will handle related data)
  await db.user.delete({
    where: { id: userId },
  });

  loggers.api.warn(
    {
      operation: "admin_delete_user",
      adminId: admin.id,
      deletedUserId: userId,
      deletedUserEmail: user.email,
      deletedFiles: user._count.files,
      deletedMessages: user._count.messages,
      deletedConversations: user._count.conversations,
    },
    "Admin deleted user account"
  );

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { success: true };
}

export async function getSystemMetrics() {
  await requireAdmin();

  const [
    totalUsers,
    totalFiles,
    totalMessages,
    proUsers,
    failedUploads,
    storageUsed,
    activeUsers24h,
  ] = await Promise.all([
    db.user.count(),
    db.file.count(),
    db.message.count(),
    db.user.count({ where: { tier: "PRO" } }),
    db.file.count({
      where: {
        uploadStatus: "FAILED",
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    }),
    db.file.aggregate({
      _sum: { size: true },
    }),
    db.user.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Active in last 24h
        },
      },
    }),
  ]);

  // Calculate average messages per user
  const messagesPerUser = totalUsers > 0 ? totalMessages / totalUsers : 0;

  return {
    totalUsers,
    totalFiles,
    totalMessages,
    proUsers,
    failedUploads,
    storageUsed: storageUsed._sum.size || BigInt(0),
    avgMessagesPerUser: messagesPerUser,
    activeUsers24h,
  };
}

