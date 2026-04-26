/**
 * @jest-environment node
 *
 * Unit tests for the formatters used throughout the UI:
 *  - formatDate: powers chat timestamps, file row dates, etc.
 *  - formatBytes: powers file row size badges; must handle BigInt and 0
 *  - formatCurrency: powers billing pages
 *
 * A regression in formatBytes (e.g. NaN on bigint, or "Infinity Bytes" on 0)
 * would make every file row look broken.
 */
import { formatBytes, formatCurrency, formatDate } from "../formatters";

describe("formatDate", () => {
  it("formats with the default 'MMM d, yyyy' pattern when no format is provided", () => {
    expect(formatDate(new Date("2024-03-15T00:00:00Z"))).toMatch(/Mar 1[45], 2024/);
  });

  it("accepts a custom pattern (24h time)", () => {
    const d = new Date(2024, 0, 1, 9, 5);
    expect(formatDate(d, "HH:mm")).toBe("09:05");
  });

  it("accepts a string and a number (epoch ms) input", () => {
    expect(formatDate("2024-01-01T00:00:00Z")).toBeTruthy();
    expect(formatDate(1_700_000_000_000)).toBeTruthy();
  });
});

describe("formatBytes", () => {
  it("returns '0 Bytes' for null/undefined/0/'0' inputs", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
    expect(formatBytes("0")).toBe("0 Bytes");
    expect(formatBytes(undefined)).toBe("0 Bytes");
    expect(formatBytes(null)).toBe("0 Bytes");
  });

  it("formats KB/MB with one decimal by default", () => {
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1500)).toBe("1.5 KB");
    expect(formatBytes(1024 * 1024)).toBe("1 MB");
  });

  it("respects a caller-provided decimals argument", () => {
    expect(formatBytes(1500, 0)).toBe("1 KB");
    expect(formatBytes(1500, 2)).toBe("1.46 KB");
  });

  it("handles BigInt without producing NaN", () => {
    expect(formatBytes(BigInt(2048))).toBe("2 KB");
  });

  it("handles a numeric string", () => {
    expect(formatBytes("2048")).toBe("2 KB");
  });
});

describe("formatCurrency", () => {
  it("formats USD by default with $ sign and 2 fraction digits", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });
});
