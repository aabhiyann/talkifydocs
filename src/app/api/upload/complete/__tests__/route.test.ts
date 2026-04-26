/**
 * @jest-environment node
 *
 * Tests for /api/upload/complete. The most important property here is the
 * IDOR fix: the existing-file lookup must be scoped by both `key` AND
 * `userId`, so a malicious caller who guesses someone else's storage key
 * cannot retrieve that file's metadata.
 */
import { POST } from "../route";

const mockGetCurrentUser = jest.fn();
const mockFindFirst = jest.fn();
const mockCreate = jest.fn();

jest.mock("@/lib/auth", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    file: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

// Avoid kicking off real PDF processing during tests.
jest.mock("@/lib/upload/process-pdf", () => ({
  processPdfFile: jest.fn().mockResolvedValue(undefined),
}));

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/upload/complete", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("/api/upload/complete POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when there is no current user", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await POST(makeRequest({ url: "k", fileName: "f" }) as any);
    expect(res.status).toBe(401);
  });

  it("returns 400 when url or fileName is missing", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user_1" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await POST(makeRequest({ url: "k" }) as any);
    expect(res.status).toBe(400);
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it("scopes the existing-file lookup by both key AND userId (IDOR guard)", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user_1" });
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      id: "f_new",
      key: "k1",
      url: "k1",
      name: "doc.pdf",
      userId: "user_1",
      size: BigInt(0),
    });

    await POST(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest({ url: "k1", fileName: "doc.pdf", size: 0 }) as any,
    );

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { key: "k1", userId: "user_1" },
    });
  });

  it("returns the existing record (with size stringified) when one is owned by the caller", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user_1" });
    mockFindFirst.mockResolvedValue({
      id: "f_existing",
      key: "k1",
      url: "k1",
      name: "doc.pdf",
      userId: "user_1",
      size: BigInt(2048),
    });

    const res = await POST(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest({ url: "k1", fileName: "doc.pdf", size: 2048 }) as any,
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ id: "f_existing", size: "2048" });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("creates a new record when no owned record exists, with the caller's userId", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user_1" });
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      id: "f_new",
      key: "k1",
      url: "k1",
      name: "doc.pdf",
      userId: "user_1",
      size: BigInt(1024),
    });

    const res = await POST(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      makeRequest({ url: "k1", fileName: "doc.pdf", size: 1024 }) as any,
    );
    expect(res.status).toBe(200);

    const args = mockCreate.mock.calls[0][0];
    expect(args.data).toMatchObject({
      key: "k1",
      url: "k1",
      name: "doc.pdf",
      userId: "user_1",
      uploadStatus: "PROCESSING",
    });
  });
});
