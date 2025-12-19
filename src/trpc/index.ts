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
import { citationSchema } from "@/lib/validation";
import { observable } from "@trpc/server/observable";
import EventEmitter from "eventemitter3";
import { openai } from "@/lib/openai";
import { ChatOpenAI } from "@langchain/openai";
import { getPineconeClient } from "@/lib/pinecone";
import { PINECONE_INDEX_NAME } from "@/config/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Document } from "@langchain/core/documents";
import { AI } from "@/config/ai";
import { Citation } from "@/types/chat";

const eventEmitter = new EventEmitter();

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
      include: {
        _count: {
          select: {
            messages: true,
          },
        },
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
        citations: z.array(citationSchema).optional(),
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
      ? (msg.citations as unknown as Citation[])
      : msg.citations
        ? [msg.citations as unknown as Citation]
        : [];

    let citationText = "";
    if (citations.length > 0) {
      const citationList = citations
        .map((c) => {
          const page = c.pageNumber;
          const filename = c.fileName || "Document";
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
        citations: z.array(citationSchema).optional(),
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

      if (!admin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

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
            storageUsed: (storageUsed._sum.size || BigInt(0)).toString(),
            avgMessagesPerUser: messagesPerUser,
            activeUsers24h,
            avgProcessingTime: undefined as number | undefined,
            errorRate: undefined as number | undefined,
        };
    }),

    onSendMessage: privateProcedure
        .input(z.object({ fileId: z.string(), message: z.string() }))
        .subscription(async ({ input, ctx }) => {
            const { fileId, message } = input;
            const { user } = ctx;

            if (!message.trim()) {
              return observable((emit) => {
                emit.complete();
              });
            }

            const ee = new EventEmitter();

            const file = await db.file.findFirst({
                where: {
                    id: fileId,
                    userId: user.id,
                },
            });

            if (!file) {
                throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });
            }

            let conversation = await db.conversation.findFirst({
                where: {
                    userId: user.id,
                    conversationFiles: {
                        some: {
                            fileId,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            if (!conversation) {
                conversation = await db.conversation.create({
                    data: {
                        title: file.name,
                        userId: user.id,
                        conversationFiles: {
                            create: {
                                fileId,
                            },
                        },
                    },
                });
            }

            await db.message.create({
                data: {
                    text: message,
                    isUserMessage: true,
                    userId: user.id,
                    fileId,
                    conversationId: conversation.id,
                },
            });

            const embeddings = new OpenAIEmbeddings({
                modelName: "text-embedding-3-small",
            });

            const pinecone = await getPineconeClient();
            const pineconeIndex = pinecone.Index(PINECONE_INDEX_NAME);

            const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
                pineconeIndex: pineconeIndex,
                namespace: file.id,
            });

            const results = (await vectorStore.similaritySearch(message, 4)) as Document[];

            const prevMessages = await db.message.findMany({
                where: {
                    conversationId: conversation.id,
                },
                orderBy: {
                    createdAt: "asc",
                },
                take: 6,
            });

            const formattedPrevMessages = prevMessages.map((msg) => ({
                role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
                content: msg.text,
            }));

            const openaiResponse = await openai.chat.completions.create({
                model: AI.OPENAI_MODEL,
                temperature: 0,
                stream: true,
                messages: [
                    {
                        role: "system",
                        content: "Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.",
                    },
                    {
                        role: "user",
                        content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
              
        \n----------------\n
        
        PREVIOUS CONVERSATION:
        ${formattedPrevMessages.map((message) => {
            if (message.role === "user") return `User: ${message.content}\n`;
            return `Assistant: ${message.content}\n`;
        })}
        
        \n----------------\n
        CONTEXT:
        ${results.map((r) => r.pageContent).join("\n\n")}
        
        USER INPUT: ${message}`,
                    },
                ],
            });

            let fullResponse = "";
            (async () => {
                for await (const chunk of openaiResponse) {
                    const token = chunk.choices[0]?.delta?.content || "";
                    fullResponse += token;
                    ee.emit("chunk", token);
                }
                ee.emit("end");

                await db.message.create({
                    data: {
                        text: fullResponse,
                        isUserMessage: false,
                        fileId,
                        userId: user.id,
                        conversationId: conversation.id,
                    },
                });
            })();


            return observable<{ chunk: string; isDone?: boolean }>((emit) => {
                const onChunk = (chunk: string) => emit.next({ chunk });
                const onEnd = () => {
                    emit.next({ chunk: "", isDone: true });
                    emit.complete();
                };

                ee.on("chunk", onChunk);
                ee.on("end", onEnd);

                return () => {
                    ee.off("chunk", onChunk);
                    ee.off("end", onEnd);
                };
            });
        }),

    healthCheck: publicProcedure.query(async () => {
        const startTime = Date.now();
        const checks: Record<string, { status: string; latency?: number; error?: string }> = {};

        // Check database
        const dbStart = Date.now();
        try {
            await db.$queryRaw`SELECT 1`;
            checks.database = {
                status: "up",
                latency: Date.now() - dbStart,
            };
        } catch (error) {
            checks.database = {
                status: "down",
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }

        // Check Pinecone
        const pineconeStart = Date.now();
        try {
            const pinecone = await getPineconeClient();
            await pinecone.listIndexes();
            checks.pinecone = {
                status: "up",
                latency: Date.now() - pineconeStart,
            };
        } catch (error) {
            checks.pinecone = {
                status: "down",
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }

        // Check Redis/Cache (optional)
        try {
            const { cacheService } = await import("@/lib/cache");
            const testKey = `health:check:${Date.now()}`;
            await cacheService.set(testKey, { test: true }, 10);
            const cached = await cacheService.get(testKey);
            await cacheService.del(testKey);
            checks.cache = {
                status: cached ? "up" : "down",
            };
        } catch (error) {
            checks.cache = {
                status: "down",
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }

        const allHealthy = Object.values(checks).every((check) => check.status === "up");
        const totalLatency = Date.now() - startTime;

        const health = {
            status: allHealthy ? "healthy" : "unhealthy",
            timestamp: new Date().toISOString(),
            services: checks,
            latency: totalLatency,
        };

        loggers.api.info(
            {
                health: health.status,
                checks: Object.keys(checks).length,
                latency: totalLatency,
            },
            "Health check requested",
        );

        return health;
    }),

    checkAdminStatus: privateProcedure.query(({ ctx }) => {
        return { isAdmin: ctx.user?.tier === "ADMIN" };
    }),

    getConversations: privateProcedure.query(async ({ ctx }) => {
        const { userId } = ctx;
        return db.conversation.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" },
            include: {
                conversationFiles: {
                    include: {
                        file: true,
                    },
                },
            },
        });
    }),

    demoChat: publicProcedure
        .input(z.object({ messages: z.array(z.object({ role: z.enum(["user", "assistant", "system"]), content: z.string() })) }))
        .subscription(async ({ input }) => {
            const { messages } = input;

            const ee = new EventEmitter();

            const model = new ChatOpenAI({
                modelName: "gpt-4o-mini",
                temperature: 0.4,
                streaming: true,
            });

            const systemPrompt =
                "You are the demo assistant for TalkifyDocs. Answer briefly and helpfully based only on the user's message. " +
                "Mention occasionally that this is a demo and that real accounts can upload and chat with their own PDFs.";

            (async () => {
                const streamResponse = await model.stream([
                    { role: "system", content: systemPrompt },
                    ...messages,
                ]);

                for await (const chunk of streamResponse) {
                    ee.emit("chunk", chunk.content);
                }
                ee.emit("end");
            })();

            return observable<{ chunk: string }>((emit) => {
                const onChunk = (chunk: string) => emit.next({ chunk });
                const onEnd = () => emit.complete();

                ee.on("chunk", onChunk);
                ee.on("end", onEnd);

                return () => {
                    ee.off("chunk", onChunk);
                    ee.off("end", onEnd);
                };
            });
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

    retryUploadProcessing: privateProcedure
        .input(z.object({ fileId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;
            const { fileId } = input;

            const file = await db.file.findFirst({
                where: {
                    id: fileId,
                    userId,
                },
                select: {
                    id: true,
                    url: true,
                    name: true,
                },
            });

            if (!file) {
                throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });
            }

            await db.file.update({
                where: { id: file.id },
                data: { uploadStatus: "PROCESSING" },
            });

            // Fire-and-forget re-processing
            void import("@/lib/upload/process-pdf").then(({ processPdfFile }) => {
                processPdfFile({
                    fileId: file.id,
                    fileUrl: file.url,
                    fileName: file.name,
                }).catch((error) => {
                    loggers.api.error("Retry processing error:", error);
                });
            });

            return { ok: true };
        }),
});

export type AppRouter = typeof appRouter;
