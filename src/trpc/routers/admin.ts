import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { loggers } from "@/lib/logger";

import { adminProcedure } from "../trpc";

/**
 * Admin-only tRPC procedures, extracted from the historical mega-router.
 *
 * Like the highlights module, this exports a plain object so the root
 * `appRouter` can spread it (`...adminProcedures`) and preserve the FLAT
 * public API (`trpc.updateUserTier`, not `trpc.admin.updateUserTier`).
 *
 * The adminProcedure middleware guarantees ctx.user.tier === "ADMIN" at
 * the gate, so each procedure can assume the caller is an admin and only
 * needs to enforce *additional* invariants (e.g. "cannot delete your own
 * account", "cannot delete other admins").
 */
export const adminProcedures = {
  updateUserTier: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        tier: z.enum(["FREE", "PRO", "ADMIN"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, tier } = input;
      const admin = ctx.user;

      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          tier: true,
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      await db.user.update({
        where: { id: userId },
        data: { tier },
      });

      loggers.api.info(
        {
          operation: "admin_update_user_tier",
          adminId: admin?.id || "unknown",
          targetUserId: userId,
          oldTier: user.tier,
          newTier: tier,
        },
        "Admin updated user tier",
      );

      revalidatePath("/admin/users");
      revalidatePath("/admin");
      return { success: true };
    }),

  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;
      const admin = ctx.user;

      // adminProcedure already guards `tier === "ADMIN"`, but we re-check
      // here so a future refactor that loosens the gate can't silently drop
      // this invariant.
      if (!admin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          tier: true,
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
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (user.id === admin.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete your own account",
        });
      }

      if (user.tier === "ADMIN" && user.id !== admin.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete other admin accounts",
        });
      }

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
        "Admin deleted user account",
      );

      revalidatePath("/admin/users");
      revalidatePath("/admin");
      return { success: true };
    }),

  getSystemMetrics: adminProcedure.query(async () => {
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
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      db.file.aggregate({
        _sum: { size: true },
      }),
      db.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const messagesPerUser = totalUsers > 0 ? totalMessages / totalUsers : 0;

    return {
      totalUsers,
      totalFiles,
      totalMessages,
      proUsers,
      failedUploads,
      storageUsed: (storageUsed._sum.size || BigInt(0)).toString(),
      avgMessagesPerUser: messagesPerUser,
      activeUsers24h,
      avgProcessingTime: undefined as number | undefined,
      errorRate: undefined as number | undefined,
    };
  }),

  getErrorLogs: adminProcedure.query(async () => {
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

    return { logs: errorLogs };
  }),
} as const;
