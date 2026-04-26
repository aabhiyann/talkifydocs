/**
 * @jest-environment node
 *
 * Unit tests for admin-only tRPC procedures. Verifies that the adminProcedure
 * gate (FORBIDDEN for non-admins) is enforced, and that updateUserTier and
 * deleteUser respect their authorization rules.
 */
import { appRouter } from "../index";
import { db } from "@/lib/db";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

type Tier = "FREE" | "PRO" | "ADMIN";
type Ctx = { user: { id: string; email: string; tier: Tier } };

const adminCtx: Ctx = {
  user: { id: "admin_1", email: "admin@example.com", tier: "ADMIN" },
};
const freeCtx: Ctx = {
  user: { id: "user_1", email: "user@example.com", tier: "FREE" },
};

describe("tRPC admin procedures", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("adminProcedure gate", () => {
    it("rejects non-admin callers with FORBIDDEN on updateUserTier", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caller = appRouter.createCaller(freeCtx as any);
      await expect(
        caller.updateUserTier({ userId: "u1", tier: "PRO" }),
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
      expect(db.user.update).not.toHaveBeenCalled();
    });

    it("rejects non-admin callers with FORBIDDEN on deleteUser", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caller = appRouter.createCaller(freeCtx as any);
      await expect(
        caller.deleteUser({ userId: "u1" }),
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
      expect(db.user.delete).not.toHaveBeenCalled();
    });
  });

  describe("updateUserTier", () => {
    it("returns NOT_FOUND when target user is missing", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caller = appRouter.createCaller(adminCtx as any);
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        caller.updateUserTier({ userId: "ghost", tier: "PRO" }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("updates the user's tier when target exists", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caller = appRouter.createCaller(adminCtx as any);
      (db.user.findUnique as jest.Mock).mockResolvedValue({ tier: "FREE" });
      (db.user.update as jest.Mock).mockResolvedValue({});

      const result = await caller.updateUserTier({ userId: "u1", tier: "PRO" });
      expect(result).toEqual({ success: true });
      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: { tier: "PRO" },
      });
    });
  });

  describe("deleteUser", () => {
    const fullUser = {
      id: "u1",
      email: "victim@example.com",
      tier: "FREE" as Tier,
      _count: { files: 0, messages: 0, conversations: 0 },
    };

    it("returns NOT_FOUND when target user is missing", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caller = appRouter.createCaller(adminCtx as any);
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(caller.deleteUser({ userId: "ghost" })).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });

    it("rejects deleting your own admin account with FORBIDDEN", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caller = appRouter.createCaller(adminCtx as any);
      (db.user.findUnique as jest.Mock).mockResolvedValue({
        ...fullUser,
        id: "admin_1",
        tier: "ADMIN",
      });

      await expect(caller.deleteUser({ userId: "admin_1" })).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
      expect(db.user.delete).not.toHaveBeenCalled();
    });

    it("rejects deleting another admin's account with FORBIDDEN", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caller = appRouter.createCaller(adminCtx as any);
      (db.user.findUnique as jest.Mock).mockResolvedValue({
        ...fullUser,
        id: "admin_2",
        tier: "ADMIN",
      });

      await expect(caller.deleteUser({ userId: "admin_2" })).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
      expect(db.user.delete).not.toHaveBeenCalled();
    });

    it("deletes a non-admin user when called by an admin", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caller = appRouter.createCaller(adminCtx as any);
      (db.user.findUnique as jest.Mock).mockResolvedValue(fullUser);
      (db.user.delete as jest.Mock).mockResolvedValue({});

      const result = await caller.deleteUser({ userId: "u1" });
      expect(result).toEqual({ success: true });
      expect(db.user.delete).toHaveBeenCalledWith({ where: { id: "u1" } });
    });
  });
});
