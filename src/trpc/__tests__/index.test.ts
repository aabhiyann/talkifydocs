/**
 * @jest-environment node
 */
import { appRouter } from "../index";
import { db } from "@/lib/db";

jest.mock("@/lib/db", () => ({
  db: {
    file: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("tRPC User Procedures", () => {
  const mockUser = { id: "user_123", email: "test@example.com", tier: "FREE" };
  const ctx = { user: mockUser };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserFiles", () => {
    it("should return user files", async () => {
      const caller = appRouter.createCaller(ctx as any);

      const mockFiles = [
        { id: "file_1", name: "test.pdf", userId: "user_123", size: 1024 },
      ];

      (db.file.findMany as jest.Mock).mockResolvedValue(mockFiles);

      const result = await caller.getUserFiles();

      expect(result).toEqual(mockFiles);
      expect(db.file.findMany).toHaveBeenCalledWith({
        where: { userId: "user_123" },
        include: { _count: { select: { messages: true } } },
      });
    });
  });

  describe("deleteFile", () => {
    it("should delete a file if it belongs to the user", async () => {
      const caller = appRouter.createCaller(ctx as any);
      const fileId = "file_123";

      (db.file.findFirst as jest.Mock).mockResolvedValue({ id: fileId, userId: "user_123", size: 2048 });
      (db.file.delete as jest.Mock).mockResolvedValue({ id: fileId, userId: "user_123", size: 2048 });

      const result = await caller.deleteFile({ id: fileId });

      expect(result).toEqual({ id: fileId, userId: "user_123" });
      expect(db.file.delete).toHaveBeenCalledWith({
        where: { id: fileId },
      });
    });

    it("should throw NOT_FOUND if file doesn't exist or belongs to another user", async () => {
      const caller = appRouter.createCaller(ctx as any);
      (db.file.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(caller.deleteFile({ id: "wrong_id" })).rejects.toThrow();
    });
  });
});
