/**
 * @jest-environment node
 *
 * Unit tests for the conversation-sharing tRPC procedures. These cover the
 * critical authorization paths (a user must own the conversation) plus the
 * happy path for createShareableLink / revokeShareableLink / getShareableLink.
 */
import { appRouter } from "../index";
import { db } from "@/lib/db";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    conversation: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

type Ctx = { user: { id: string; email: string; tier: "FREE" | "PRO" | "ADMIN" } };

const ownerCtx: Ctx = {
  user: { id: "user_owner", email: "owner@example.com", tier: "FREE" },
};
const otherCtx: Ctx = {
  user: { id: "user_other", email: "other@example.com", tier: "FREE" },
};

describe("tRPC sharing procedures", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createShareableLink", () => {
    it("rejects with UNAUTHORIZED when the conversation does not exist", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caller = appRouter.createCaller(ownerCtx as any);
      (db.conversation.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        caller.createShareableLink({ conversationId: "nope" }),
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      expect(db.conversation.update).not.toHaveBeenCalled();
    });

    it("rejects with UNAUTHORIZED when the conversation belongs to someone else", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caller = appRouter.createCaller(otherCtx as any);
      (db.conversation.findUnique as jest.Mock).mockResolvedValue({
        userId: "user_owner",
      });

      await expect(
        caller.createShareableLink({ conversationId: "conv_1" }),
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      expect(db.conversation.update).not.toHaveBeenCalled();
    });

    it("creates a share token, marks the conversation public, and returns the share URL", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caller = appRouter.createCaller(ownerCtx as any);
      (db.conversation.findUnique as jest.Mock).mockResolvedValue({
        userId: "user_owner",
      });
      (db.conversation.update as jest.Mock).mockResolvedValue({});

      const url = await caller.createShareableLink({ conversationId: "conv_1" });

      expect(typeof url).toBe("string");
      expect(url).toMatch(/\/share\/[0-9a-fA-F-]{36}$/);

      const updateArgs = (db.conversation.update as jest.Mock).mock.calls[0][0];
      expect(updateArgs.where).toEqual({ id: "conv_1" });
      expect(updateArgs.data.isPublic).toBe(true);
      expect(typeof updateArgs.data.shareToken).toBe("string");
      expect(updateArgs.data.shareToken).toHaveLength(36);
    });
  });

  describe("revokeShareableLink", () => {
    it("rejects when the conversation does not belong to the caller", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caller = appRouter.createCaller(otherCtx as any);
      (db.conversation.findUnique as jest.Mock).mockResolvedValue({
        userId: "user_owner",
      });

      await expect(
        caller.revokeShareableLink({ conversationId: "conv_1" }),
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      expect(db.conversation.update).not.toHaveBeenCalled();
    });

    it("clears shareToken and isPublic for the owner", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caller = appRouter.createCaller(ownerCtx as any);
      (db.conversation.findUnique as jest.Mock).mockResolvedValue({
        userId: "user_owner",
      });
      (db.conversation.update as jest.Mock).mockResolvedValue({});

      const result = await caller.revokeShareableLink({ conversationId: "conv_1" });
      expect(result).toEqual({ success: true });
      expect(db.conversation.update).toHaveBeenCalledWith({
        where: { id: "conv_1" },
        data: { shareToken: null, isPublic: false },
      });
    });
  });

  describe("getShareableLink", () => {
    it("rejects when the conversation belongs to another user", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caller = appRouter.createCaller(otherCtx as any);
      (db.conversation.findUnique as jest.Mock).mockResolvedValue({
        userId: "user_owner",
        shareToken: "abc",
        isPublic: true,
      });

      await expect(
        caller.getShareableLink({ conversationId: "conv_1" }),
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    });

    it("returns null when the conversation is owned but not shared", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caller = appRouter.createCaller(ownerCtx as any);
      (db.conversation.findUnique as jest.Mock).mockResolvedValue({
        userId: "user_owner",
        shareToken: null,
        isPublic: false,
      });

      const result = await caller.getShareableLink({ conversationId: "conv_1" });
      expect(result).toBeNull();
    });

    it("returns the share URL for an owned, public conversation", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caller = appRouter.createCaller(ownerCtx as any);
      (db.conversation.findUnique as jest.Mock).mockResolvedValue({
        userId: "user_owner",
        shareToken: "abc-token",
        isPublic: true,
      });

      const url = await caller.getShareableLink({ conversationId: "conv_1" });
      expect(url).toMatch(/\/share\/abc-token$/);
    });
  });
});
