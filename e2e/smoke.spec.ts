import { expect, test } from "@playwright/test";

/**
 * Smoke E2E specs that DO NOT require sign-in. These verify the app boots and
 * the public surface and health endpoint respond. They run on every CI pipeline.
 *
 * Run locally with: npm run test:e2e
 * (Requires `next dev` or another server up at PLAYWRIGHT_BASE_URL.)
 */
test.describe("public smoke", () => {
  test("home page returns 2xx and renders the brand", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status(), "home page status").toBeLessThan(400);

    // talkifydocs branding should appear somewhere on the public landing page.
    await expect(page).toHaveTitle(/talkify/i);
  });

  test("/api/health returns a JSON status payload", async ({ request }) => {
    const res = await request.get("/api/health");
    expect([200, 503]).toContain(res.status());

    const json = (await res.json()) as { status?: string; timestamp?: string };
    expect(typeof json.status).toBe("string");
    if (json.timestamp) {
      // timestamp must round-trip through Date if present
      expect(() => new Date(json.timestamp!).toISOString()).not.toThrow();
    }
  });

  test("an authenticated route redirects unauthenticated visitors", async ({ page }) => {
    const response = await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    expect(response).toBeTruthy();

    // Either a 3xx redirect handled by Next, or we end up on a sign-in page.
    const url = page.url();
    expect(url).not.toMatch(/\/dashboard\/?$/);
    expect(url).toMatch(/sign[-_]?in|sign[-_]?up|clerk|\/auth/i);
  });
});
