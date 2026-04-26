import { randomUUID } from "crypto";

import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";

import { privateProcedure } from "../trpc";

/**
 * Conversation share-link procedures, extracted from the historical
 * mega-router. Behavior preserved exactly:
 *
 *   - createShareableLink:  ownership-checked, generates token, marks public
 *   - revokeShareableLink:  ownership-checked, clears token, marks private
 *   - getShareableLink:     ownership-checked, returns the URL or null
 *
 * Each procedure does its own ownership check (`conversation.userId === userId`)
 * because conversation records are addressed by an opaque ID — without this
 * check a malicious caller could share or unshare someone else's chat.
 */

/**
 * Build the canonical absolute base URL for share links.
 *
 * Mirrors the original inline logic so we don't change any link shapes.
 * Note: the precedence intentionally checks NEXT_PUBLIC_APP_URL OR
 * VERCEL_URL to decide whether we're in a "deployed" environment, then
 * always uses VERCEL_URL for the host (which is what Vercel sets at
 * runtime). The local fallback is plain http://localhost:3000.
 */
function buildShareBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export const sharingProcedures = {
  createShareableLink: privateProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { conversationId } = input;

      const conversation = await db.conversation.findUnique({
        where: { id: conversationId },
        select: {
          userId: true,
        },
      });

      if (!conversation || conversation.userId !== userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const shareToken = randomUUID();

      await db.conversation.update({
        where: { id: conversationId },
        data: { shareToken, isPublic: true },
      });

      const shareUrl = `${buildShareBaseUrl()}/share/${shareToken}`;
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
        select: {
          userId: true,
        },
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
        select: {
          userId: true,
          shareToken: true,
          isPublic: true,
        },
      });

      if (!conversation || conversation.userId !== userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      if (!conversation.shareToken || !conversation.isPublic) {
        return null;
      }

      return `${buildShareBaseUrl()}/share/${conversation.shareToken}`;
    }),
} as const;
