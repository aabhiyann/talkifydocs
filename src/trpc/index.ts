import { privateProcedure, publicProcedure, router, adminProcedure } from "./trpc";
import { z } from "zod";
import { randomUUID } from "crypto";
import { format } from "date-fns";

import { TRPCError } from "@trpc/server";
import { db } from "@/lib/db";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { absoluteUrl } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { loggers } from "@/lib/logger";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();

    if (!user || !user.id || !user.email) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return { success: true };
  }),

  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    return await db.file.findMany({
      where: {
        userId,
      },
    });
  }),

  createStripeSession: privateProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx;

    const billingUrl = absoluteUrl("/dashboard/billing");

    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const dbUser = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });

    // Dynamic import to avoid webpack bundling issues
    const { getUserSubscriptionPlan, stripe } = await import("@/lib/stripe");
    const { PLANS } = await import("@/config/stripe");

    const subscriptionPlan = await getUserSubscriptionPlan();

    if (!stripe) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Stripe not configured",
      });
    }

    if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: billingUrl,
      });

      return { url: stripeSession.url };
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [
        {
          price: PLANS.find((plan) => plan.name === "Pro")?.price.priceIds.test,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
      },
    });

    return { url: stripeSession.url };
  }),

  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { fileId, cursor } = input;
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;

      const file = await db.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      const messages = await db.message.findMany({
        take: limit + 1,
        where: {
          fileId,
        },
        orderBy: {
          createdAt: "desc",
        },
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          isUserMessage: true,
          createdAt: true,
          text: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }

      return {
        messages,
        nextCursor,
      };
    }),

  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      });

      if (!file) return { status: "PENDING" as const };

      return { status: file.uploadStatus };
    }),

  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      return file;
    }),

  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      await db.file.delete({
        where: {
          id: input.id,
        },
      });

      return file;
    }),

  createConversation: privateProcedure
    .input(
      z.object({
        fileIds: z.array(z.string()).min(1, "At least one file is required").max(5, "Maximum 5 files allowed"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { fileIds } = input;

      const files = await db.file.findMany({
        where: {
          id: { in: fileIds },
          userId,
        },
      });

      if (files.length !== fileIds.length) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Invalid file access" });
      }

      const title = files.length === 1 ? files[0].name : `${files.length} Documents`;

      const conversation = await db.conversation.create({
        data: {
          title,
          userId,
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
    }),

  getConversationMessages: privateProcedure
    .input(
      z.object({
        conversationId: z.string(),
        limit: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { conversationId, limit = 100 } = input;

      const conversation = await db.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
        select: { id: true },
      });

      if (!conversation) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found" });
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
    }),

  createMessage: privateProcedure
    .input(
      z.object({
        conversationId: z.string(),
        fileId: z.string().optional(),
        text: z.string(),
        isUserMessage: z.boolean(),
        citations: z.any().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { conversationId, fileId, text, isUserMessage, citations } = input;

      const conversation = await db.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
        select: { id: true },
      });

      if (!conversation) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found" });
      }

      return db.message.create({
        data: {
          text,
          isUserMessage,
          userId,
          conversationId,
          fileId,
          citations,
        },
      });
    }),

  addFileToConversation: privateProcedure
    .input(z.object({ conversationId: z.string(), fileId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { conversationId, fileId } = input;

      const conversation = await db.conversation.findUnique({
        where: { id: conversationId },
        include: {
          conversationFiles: true,
        },
      });

      if (!conversation) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found" });
      }

      if (conversation.userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
      }

      if (conversation.conversationFiles.length >= 5) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Maximum 5 files allowed" });
      }

      const alreadyAdded = conversation.conversationFiles.some((cf) => cf.fileId === fileId);

      if (alreadyAdded) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "File already in conversation" });
      }

      const file = await db.file.findUnique({
        where: { id: fileId },
      });

      if (!file || file.userId !== userId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "File not found or unauthorized" });
      }

      await db.conversationFile.create({
        data: {
          conversationId,
          fileId,
        },
      });

      revalidatePath(`/chat/${conversationId}`);
      return { success: true };
    }),

  removeFileFromConversation: privateProcedure
    .input(z.object({ conversationId: z.string(), fileId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { conversationId, fileId } = input;

      const conversation = await db.conversation.findUnique({
        where: { id: conversationId },
        include: {
          conversationFiles: true,
        },
      });

      if (!conversation) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found" });
      }

      if (conversation.userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
      }

      if (conversation.conversationFiles.length <= 1) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot remove the last file" });
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
    }),

  exportChatAsMarkdown: privateProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { conversationId } = input;

      const conversation = await db.conversation.findUnique({
        where: { id: conversationId },
        include: {
          conversationFiles: {
            include: {
              file: true,
            },
          },
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!conversation || conversation.userId !== userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const fileNames = conversation.conversationFiles.map((cf) => cf.file.name).join(", ");

      const markdown = `# Chat Export - ${conversation.title}

**Exported:** ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}  
**Documents:** ${fileNames}  
**Total Messages:** ${conversation.messages.length}

---

${conversation.messages
  .map((msg) => {
    const role = msg.isUserMessage ? "👤 You" : "🤖 Assistant";
    const timestamp = format(new Date(msg.createdAt), "h:mm a");
    const citations = Array.isArray(msg.citations)
      ? msg.citations
      : msg.citations
        ? [msg.citations]
        : [];

    let citationText = "";
    if (citations.length > 0) {
      const citationList = citations
        .map((c: any) => {
          const page =
            c.pageNumber ??
            c.page ??
            (typeof c.pageIndex === "number" ? c.pageIndex + 1 : undefined);
          const filename = c.filename || c.fileName || c.title || "Document";
          return page ? `${filename} (p.${page})` : filename;
        })
        .join(", ");
      citationText = `\n\n**Sources:** ${citationList}`;
    }

    return `### ${role}
*${timestamp}*

${msg.text}${citationText}`;
  })
  .join("\n\n---\n\n")}

---

*Exported from TalkifyDocs - AI-powered document conversations*
`;

      return markdown;
    }),

  createShareableLink: privateProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { conversationId } = input;

      const conversation = await db.conversation.findUnique({
        where: { id: conversationId },
      });

      if (!conversation || conversation.userId !== userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const shareToken = randomUUID();

      await db.conversation.update({
        where: { id: conversationId },
        data: { shareToken, isPublic: true },
      });

      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000";

      const shareUrl = `${baseUrl}/share/${shareToken}`;
      revalidatePath(`/chat/${conversationId}`);
      return shareUrl;
    }),

  revokeShareableLink: privateProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { conversationId } = input;

      const conversation = await db.conversation.findUnique({
        where: { id: conversationId },
      });

      if (!conversation || conversation.userId !== userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      await db.conversation.update({
        where: { id: conversationId },
        data: { shareToken: null, isPublic: false },
      });

      revalidatePath(`/chat/${conversationId}`);
      return { success: true };
    }),

  getShareableLink: privateProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { conversationId } = input;

      const conversation = await db.conversation.findUnique({
        where: { id: conversationId },
      });

      if (!conversation || conversation.userId !== userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      if (!conversation.shareToken || !conversation.isPublic) {
        return null;
      }

      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000";

      return `${baseUrl}/share/${conversation.shareToken}`;
    }),

  saveAsHighlight: privateProcedure
    .input(
      z.object({
        question: z.string(),
        answer: z.string(),
        fileId: z.string(),
        citations: z.array(z.any()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { question, answer, fileId, citations } = input;

      const file = await db.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
        select: { id: true },
      });

      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND", message: "File not found or unauthorized" });
      }

      const highlight = await db.highlight.create({
        data: {
          question,
          answer,
          citations,
          userId,
          fileId: file.id,
        },
        include: {
          file: true,
        },
      });

      revalidatePath("/highlights");
      return highlight;
    }),

  getHighlights: privateProcedure
    .input(
      z.object({
        fileId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { fileId } = input;

      return db.highlight.findMany({
        where: {
          userId,
          ...(fileId ? { fileId } : {}),
        },
        include: {
          file: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  deleteHighlight: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { id } = input;

      const highlight = await db.highlight.findUnique({
        where: { id },
      });

      if (!highlight) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Highlight not found" });
      }

      if (highlight.userId !== userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      await db.highlight.delete({
        where: { id },
      });

      revalidatePath("/highlights");
      return { success: true };
    }),

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
          adminId: admin.id,
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
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (user.id === admin.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete your own account" });
      }

      if (user.tier === "ADMIN" && user.id !== admin.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete other admin accounts" });
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
            storageUsed: storageUsed._sum.size || BigInt(0),
            avgMessagesPerUser: messagesPerUser,
            activeUsers24h,
        };
    }),
});

export type AppRouter = typeof appRouter;
