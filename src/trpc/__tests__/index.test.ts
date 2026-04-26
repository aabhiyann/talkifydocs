/**
 * @jest-environment node
 */
import { TRPCError } from "@trpc/server";
import { appRouter } from "../index";
import { db } from "@/lib/db";
import type { AuthenticatedUser } from "@/lib/auth";

jest.mock("@/lib/db", () => ({
  db: {
    file: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

type TestContext = { user: AuthenticatedUser | null };

describe("tRPC User Procedures", () => {
  const mockUser: AuthenticatedUser = {
    id: "user_123",
    clerkId: "clerk_123",
    email: "test@example.com",
    name: "Test User",
    imageUrl: null,
    tier: "FREE",
  };
  const ctx: TestContext = { user: mockUser };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserFiles", () => {
    it("should return user files", async () => {
      const caller = appRouter.createCaller(ctx);

      const mockFiles = [
        { id: "file_1", name: "test.pdf", userId: "user_123", size: 1024 },
      ];

      (db.file.findMany as jest.Mock).mockResolvedValue(mockFiles);

      const result = await caller.getUserFiles();

      expect(result).toEqual([
        { id: "file_1", name: "test.pdf", userId: "user_123", size: "1024" },
      ]);
      expect(db.file.findMany).toHaveBeenCalledWith({
        where: { userId: "user_123" },
        select: expect.objectContaining({
          id: true,
          name: true,
          size: true,
        }),
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("deleteFile", () => {
    it("should delete a file if it belongs to the user", async () => {
      const caller = appRouter.createCaller(ctx);
      const fileId = "file_123";

      (db.file.findFirst as jest.Mock).mockResolvedValue({ id: fileId, userId: "user_123", size: 2048 });
      (db.file.delete as jest.Mock).mockResolvedValue({ id: fileId, userId: "user_123", size: 2048 });

      const result = await caller.deleteFile({ id: fileId });

      expect(result).toEqual({ id: fileId, userId: "user_123", size: "2048" });
      expect(db.file.delete).toHaveBeenCalledWith({
        where: { id: fileId },
      });
    });

    it("should throw a TRPCError with code NOT_FOUND if the file is missing or owned by someone else", async () => {
      const caller = appRouter.createCaller(ctx);
      (db.file.findFirst as jest.Mock).mockResolvedValue(null);

      // We assert structurally (TRPCError + code) AND prove no delete attempt
      // was made — both are critical for IDOR/authz invariants.
      await expect(caller.deleteFile({ id: "wrong_id" })).rejects.toBeInstanceOf(
        TRPCError,
      );
      await expect(caller.deleteFile({ id: "wrong_id" })).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
      expect(db.file.delete).not.toHaveBeenCalled();
    });
  });
});
