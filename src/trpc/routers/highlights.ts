import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { citationSchema } from "@/lib/validation";

import { privateProcedure } from "../trpc";

/**
 * Highlight-related tRPC procedures, extracted from the historical
 * mega-router in `src/trpc/index.ts`. The shape MUST stay flat (e.g.
 * `trpc.saveAsHighlight`) — every UI callsite uses the unscoped name.
 *
 * That's why this module exports a plain object of procedures rather than
 * its own router; the root `appRouter` spreads this object into its single
 * flat router.
 */
export const highlightProcedures = {
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

      // Critical authz: scope the lookup to userId so a malicious caller
      // cannot tag a highlight onto someone else's file.
      const file = await db.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
        select: { id: true },
      });

      if (!file) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found or unauthorized",
        });
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
          file: {
            select: {
              name: true,
            },
          },
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
        select: {
          userId: true,
        },
      });

      if (!highlight) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Highlight not found",
        });
      }

      // Two-step authz: first NOT_FOUND if missing, then UNAUTHORIZED if owned
      // by someone else. We deliberately keep the original codes so existing
      // clients (and tests) continue to map them the same way.
      if (highlight.userId !== userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      await db.highlight.delete({
        where: { id },
      });

      revalidatePath("/highlights");
      return { success: true };
    }),
} as const;
