/**
 * @jest-environment node
 *
 * Tests for /api/chat. Focuses on the security-critical pre-LLM gates:
 *  - input validation (Zod messageSchema)
 *  - sanitization of malicious content (<script>, javascript:, on=…)
 *  - authentication (401 when no current user)
 *  - rate limiting (429 with Retry-After + X-RateLimit-* headers)
 *  - file ownership scoping (404 when fileId is not owned)
 *
 * Mocks all the heavy collaborators (DB, Pinecone, embeddings, env) so the
 * test never reaches an LLM provider.
 */

// IMPORTANT: env is imported at module load time, so set GOOGLE_API_KEY first.
process.env.GOOGLE_API_KEY = "test-google-key";

const mockGetCurrentUser = jest.fn();
const mockCheckRateLimit = jest.fn();
const mockFileFindFirst = jest.fn();
const mockConversationFindFirst = jest.fn();
const mockMessageCreate = jest.fn();

jest.mock("@/lib/auth", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

jest.mock("@/lib/security", () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
}));

jest.mock("@/lib/db", () => ({
  db: {
    file: { findFirst: (...args: unknown[]) => mockFileFindFirst(...args) },
    conversation: {
      findFirst: (...args: unknown[]) => mockConversationFindFirst(...args),
      create: jest.fn(),
    },
    message: { create: (...args: unknown[]) => mockMessageCreate(...args) },
  },
}));

import { POST } from "../route";

const VALID_CUID = "cjld2cjxh0000qzrmn831i7rn";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("/api/chat POST – pre-LLM gates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 'Invalid request body' when fileId is missing", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await POST(makeRequest({ message: "hi" }) as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid request body");
    expect(mockGetCurrentUser).not.toHaveBeenCalled();
  });

  it("returns 400 when the message contains a <script> tag (XSS guard)", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await POST(
      makeRequest({ fileId: VALID_CUID, message: "<script>alert(1)</script>" }) as any,
    );
    expect(res.status).toBe(400);
    expect(mockGetCurrentUser).not.toHaveBeenCalled();
  });

  it("returns 400 when the message contains a javascript: URL", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await POST(
      makeRequest({ fileId: VALID_CUID, message: "click javascript:evil()" }) as any,
    );
    expect(res.status).toBe(400);
  });

  it("returns 401 when there is no current user", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await POST(makeRequest({ fileId: VALID_CUID, message: "hi" }) as any);
    expect(res.status).toBe(401);
    expect(mockCheckRateLimit).not.toHaveBeenCalled();
  });

  it("returns 429 with Retry-After + X-RateLimit-* headers when rate-limited", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user_1" });
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 60_000,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await POST(makeRequest({ fileId: VALID_CUID, message: "hi" }) as any);
    expect(res.status).toBe(429);

    const retryAfter = res.headers.get("Retry-After");
    expect(retryAfter).not.toBeNull();
    expect(Number(retryAfter)).toBeGreaterThanOrEqual(1);
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(res.headers.get("X-RateLimit-Reset")).not.toBeNull();

    expect(mockFileFindFirst).not.toHaveBeenCalled();
  });

  it("returns 404 'File not found' when the fileId is not owned by the caller", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user_1" });
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 49,
      resetTime: Date.now() + 60_000,
    });
    mockFileFindFirst.mockResolvedValue(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await POST(makeRequest({ fileId: VALID_CUID, message: "hi" }) as any);
    expect(res.status).toBe(404);
    expect(mockFileFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: VALID_CUID, userId: "user_1" }),
      }),
    );
  });
});
