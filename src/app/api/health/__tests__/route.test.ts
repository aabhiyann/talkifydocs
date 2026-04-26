/**
 * @jest-environment node
 *
 * Tests for /api/health. The most important property is that the error
 * branch (when something inside healthCheck throws) does NOT echo the
 * underlying error message back to the client; it returns only a generic
 * status.
 */
import { GET } from "../route";

const mockHealthCheck = jest.fn();

jest.mock("@/trpc/server", () => ({
  createServerClient: async () => ({
    healthCheck: () => mockHealthCheck(),
  }),
}));

function makeRequest() {
  return new Request("http://localhost/api/health", { method: "GET" });
}

describe("/api/health GET", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with the underlying healthy payload when all probes pass", async () => {
    mockHealthCheck.mockResolvedValue({ status: "healthy", checks: {} });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await GET(makeRequest() as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: "healthy" });
  });

  it("returns 503 when the healthCheck reports a non-healthy status", async () => {
    mockHealthCheck.mockResolvedValue({ status: "degraded", checks: {} });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await GET(makeRequest() as any);
    expect(res.status).toBe(503);
  });

  it("returns 500 with a sanitized payload when healthCheck throws (no error message leak)", async () => {
    mockHealthCheck.mockImplementation(() => {
      throw new Error("DATABASE_URL=postgres://leaked@host/db");
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await GET(makeRequest() as any);
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.status).toBe("unhealthy");
    expect(json.message).toBe("Health check failed");
    expect(typeof json.timestamp).toBe("string");
    expect(() => new Date(json.timestamp).toISOString()).not.toThrow();

    const body = JSON.stringify(json);
    expect(body).not.toContain("DATABASE_URL");
    expect(body).not.toContain("leaked");
    expect(body).not.toContain("postgres");
  });
});
