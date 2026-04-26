/**
 * @jest-environment node
 *
 * Ownership-focused tRPC tests. Every procedure here must scope its DB query
 * by userId, and reject when the row does not belong to the caller. This file
 * locks in that invariant so a future refactor that drops the userId filter
 * (an IDOR regression) fails CI loudly.
 */
import { appRouter } from "../index";
import { db } from "@/lib/db";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    file: {
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    message: {
      findMany: jest.fn(),
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

describe("tRPC ownership invariants", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getFile (by storage key)", () => {
    it("scopes the lookup by userId in the where clause", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caller = appRouter.createCaller(ownerCtx as any);
      (db.file.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(caller.getFile({ key: "k1" })).rejects.toMatchObject({
        code: "NOT_FOUND",
      });

      expect(db.file.findFirst).toHaveBeenCalledWith({
        where: { key: "k1", userId: "user_owner" },
      });
    });

    it("returns the file with size stringified for the owner", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caller = appRouter.createCaller(ownerCtx as any);
      (db.file.findFirst as jest.Mock).mockResolvedValue({
        id: "f1",
        userId: "user_owner",
        key: "k1",
        size: 4096,
      });

      const result = await caller.getFile({ key: "k1" });
      expect(result).toMatchObject({ id: "f1", key: "k1", size: "4096" });
    });
  });

  describe("getFileUploadStatus", () => {
    it("returns PENDING when the file does not belong to the caller", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caller = appRouter.createCaller(otherCtx as any);
      (db.file.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await caller.getFileUploadStatus({ fileId: "f1" });
      expect(result).toEqual({ status: "PENDING" });
      expect(db.file.findFirst).toHaveBeenCalledWith({
        where: { id: "f1", userId: "user_other" },
        select: { uploadStatus: true },
      });
    });
  });

  describe("getFileMessages", () => {
    it("rejects with NOT_FOUND when the file is not owned by the caller", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caller = appRouter.createCaller(otherCtx as any);
      (db.file.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        caller.getFileMessages({ fileId: "f1" }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
      expect(db.message.findMany).not.toHaveBeenCalled();
    });

    it("returns messages and a nextCursor when there are more than `limit` rows", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caller = appRouter.createCaller(ownerCtx as any);
      (db.file.findFirst as jest.Mock).mockResolvedValue({ id: "f1" });
      const rows = Array.from({ length: 6 }, (_, i) => ({
        id: `m${i}`,
        isUserMessage: i % 2 === 0,
        createdAt: new Date(0),
        text: `t${i}`,
      }));
      (db.message.findMany as jest.Mock).mockResolvedValue(rows);

      const result = await caller.getFileMessages({ fileId: "f1", limit: 5 });
      expect(result.messages).toHaveLength(5);
      expect(result.nextCursor).toBe("m5");
    });
  });

  describe("deleteFile", () => {
    it("does NOT call db.file.delete when the file is not owned by the caller", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caller = appRouter.createCaller(otherCtx as any);
      (db.file.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(caller.deleteFile({ id: "f1" })).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
      expect(db.file.delete).not.toHaveBeenCalled();
    });
  });
});
