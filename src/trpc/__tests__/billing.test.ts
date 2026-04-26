/**
 * @jest-environment node
 *
 * Unit tests for the billing tRPC procedure (createStripeSession).
 *
 * The procedure has two branches:
 *  1. Subscribed + has stripeCustomerId -> opens a billing portal session
 *  2. Otherwise                          -> opens a checkout session
 *
 * We mock @/lib/stripe so we don't hit Stripe and so we can verify the SDK
 * was called with the right shape.
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
    },
  },
}));

const mockBillingPortalCreate = jest.fn();
const mockCheckoutCreate = jest.fn();
const mockGetUserSubscriptionPlan = jest.fn();

jest.mock("@/lib/stripe", () => ({
  __esModule: true,
  stripe: {
    billingPortal: { sessions: { create: (...args: unknown[]) => mockBillingPortalCreate(...args) } },
    checkout: { sessions: { create: (...args: unknown[]) => mockCheckoutCreate(...args) } },
  },
  getUserSubscriptionPlan: () => mockGetUserSubscriptionPlan(),
}));

type Ctx = { user: { id: string; email: string; tier: "FREE" | "PRO" | "ADMIN" } };

const userCtx: Ctx = {
  user: { id: "user_1", email: "user@example.com", tier: "FREE" },
};

describe("tRPC createStripeSession", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns UNAUTHORIZED when the user record is missing", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const caller = appRouter.createCaller(userCtx as any);
    (db.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(caller.createStripeSession()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(mockBillingPortalCreate).not.toHaveBeenCalled();
    expect(mockCheckoutCreate).not.toHaveBeenCalled();
  });

  it("opens a billing portal session for an existing subscriber", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const caller = appRouter.createCaller(userCtx as any);
    (db.user.findUnique as jest.Mock).mockResolvedValue({
      stripeCustomerId: "cus_existing",
    });
    mockGetUserSubscriptionPlan.mockResolvedValue({ isSubscribed: true });
    mockBillingPortalCreate.mockResolvedValue({ url: "https://stripe.example/portal" });

    const result = await caller.createStripeSession();

    expect(result).toEqual({ url: "https://stripe.example/portal" });
    expect(mockBillingPortalCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus_existing" }),
    );
    expect(mockCheckoutCreate).not.toHaveBeenCalled();
  });

  it("opens a checkout session for a non-subscriber", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const caller = appRouter.createCaller(userCtx as any);
    (db.user.findUnique as jest.Mock).mockResolvedValue({
      stripeCustomerId: null,
    });
    mockGetUserSubscriptionPlan.mockResolvedValue({ isSubscribed: false });
    mockCheckoutCreate.mockResolvedValue({ url: "https://stripe.example/checkout" });

    const result = await caller.createStripeSession();

    expect(result).toEqual({ url: "https://stripe.example/checkout" });
    expect(mockCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        payment_method_types: ["card"],
        metadata: expect.objectContaining({ userId: "user_1" }),
      }),
    );
    expect(mockBillingPortalCreate).not.toHaveBeenCalled();
  });
});
