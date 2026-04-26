/**
 * @jest-environment node
 *
 * Tests for the Stripe webhook handler. The signature verification path is
 * security-critical (a successful spoof would let attackers grant Pro tier),
 * so we lock in:
 *   1. invalid signature -> 400 "Invalid signature" (no internal detail leak)
 *   2. event with no userId metadata -> 200 with no DB write
 *   3. checkout.session.completed -> writes subscription fields to db.user
 */
import { POST } from "../route";

// Mock next/headers so we can simulate the Stripe-Signature header.
const headersStore: Record<string, string> = {};
jest.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) => headersStore[name] ?? null,
  }),
}));

// Mock the DB and stripe SDK.
const mockUserUpdate = jest.fn();
const mockSubscriptionsRetrieve = jest.fn();
const mockConstructEvent = jest.fn();

jest.mock("@/lib/db", () => ({
  db: {
    user: { update: (...args: unknown[]) => mockUserUpdate(...args) },
  },
}));

jest.mock("@/lib/stripe", () => ({
  __esModule: true,
  stripe: {
    webhooks: { constructEvent: (...args: unknown[]) => mockConstructEvent(...args) },
    subscriptions: { retrieve: (...args: unknown[]) => mockSubscriptionsRetrieve(...args) },
  },
}));

function makeRequest(body: string, signature?: string): Request {
  if (signature !== undefined) {
    headersStore["Stripe-Signature"] = signature;
  } else {
    delete headersStore["Stripe-Signature"];
  }
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body,
  });
}

describe("Stripe webhook POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(headersStore).forEach((k) => delete headersStore[k]);
  });

  it("returns 400 'Invalid signature' when constructEvent throws and does not echo the raw error", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Webhook secret leak: rotate me!");
    });

    const res = await POST(makeRequest("{}", "bogus"));
    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).toBe("Invalid signature");
    expect(text).not.toContain("Webhook secret leak");
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it("returns 200 and skips DB writes when the event has no userId metadata", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: { metadata: {} } },
    });

    const res = await POST(makeRequest("{}", "good"));
    expect(res.status).toBe(200);
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it("updates the user record on a valid checkout.session.completed event", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { userId: "user_1" },
          subscription: "sub_1",
        },
      },
    });
    mockSubscriptionsRetrieve.mockResolvedValue({
      id: "sub_1",
      customer: "cus_1",
      items: { data: [{ price: { id: "price_1" } }] },
      current_period_end: 1_700_000_000,
    });
    mockUserUpdate.mockResolvedValue({});

    const res = await POST(makeRequest("{}", "good"));
    expect(res.status).toBe(200);
    expect(mockUserUpdate).toHaveBeenCalledTimes(1);
    const args = mockUserUpdate.mock.calls[0][0];
    expect(args.where).toEqual({ id: "user_1" });
    expect(args.data).toMatchObject({
      stripeSubscriptionId: "sub_1",
      stripeCustomerId: "cus_1",
      stripePriceId: "price_1",
    });
    expect(args.data.stripeCurrentPeriodEnd).toBeInstanceOf(Date);
  });
});
