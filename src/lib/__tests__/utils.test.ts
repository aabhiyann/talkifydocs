/**
 * @jest-environment node
 *
 * absoluteUrl branches on `typeof window !== "undefined"`, so these tests
 * MUST run in a Node environment. We previously hacked around the default
 * jsdom env by `delete (global as any).window`, which is unsafe (it leaks
 * into other tests). Forcing node here is the right knob.
 */
import { cn, absoluteUrl } from "../utils";

describe("Utils", () => {
  describe("cn", () => {
    it("should merge class names correctly", () => {
      expect(cn("class1", "class2")).toBe("class1 class2");
    });

    it("should handle conditional classes", () => {
      expect(cn("class1", { class2: true, class3: false })).toBe("class1 class2");
    });

    it("should handle undefined and null values", () => {
      expect(cn("class1", undefined, null, "class2")).toBe("class1 class2");
    });
  });

  describe("absoluteUrl", () => {
    // Snapshot the env keys we touch so we can restore them in a finally
    // block. Anything we mutate during a test MUST be restored even if the
    // test throws — otherwise we contaminate sibling tests.
    const ENV_KEYS = ["VERCEL_URL", "PORT"] as const;
    const originalEnv: Record<string, string | undefined> = {};

    beforeEach(() => {
      for (const k of ENV_KEYS) originalEnv[k] = process.env[k];
      delete process.env.VERCEL_URL;
      delete process.env.PORT;
    });

    afterEach(() => {
      for (const k of ENV_KEYS) {
        if (originalEnv[k] === undefined) {
          delete process.env[k];
        } else {
          process.env[k] = originalEnv[k];
        }
      }
    });

    it("uses VERCEL_URL with https scheme when defined", () => {
      try {
        process.env.VERCEL_URL = "test.vercel.app";
        expect(absoluteUrl("/test")).toBe("https://test.vercel.app/test");
      } finally {
        delete process.env.VERCEL_URL;
      }
    });

    it("falls back to localhost on the default port when VERCEL_URL is unset", () => {
      // PORT is also unset by beforeEach, so the implementation should
      // use its hard-coded default of 3000.
      expect(absoluteUrl("/test")).toBe("http://localhost:3000/test");
    });

    it("respects a custom PORT when VERCEL_URL is unset", () => {
      try {
        process.env.PORT = "3001";
        expect(absoluteUrl("/test")).toBe("http://localhost:3001/test");
      } finally {
        delete process.env.PORT;
      }
    });

    it("prefers VERCEL_URL over PORT when both are set", () => {
      try {
        process.env.VERCEL_URL = "preview.vercel.app";
        process.env.PORT = "9999";
        expect(absoluteUrl("/path")).toBe("https://preview.vercel.app/path");
      } finally {
        delete process.env.VERCEL_URL;
        delete process.env.PORT;
      }
    });
  });
});
