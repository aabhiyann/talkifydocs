import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for talkifydocs E2E tests.
 *
 * - Tests live in ./e2e
 * - The test runner expects a server already serving the app at PLAYWRIGHT_BASE_URL
 *   (defaults to http://localhost:3000). Use `next dev` or a Vercel preview.
 * - On CI, we keep retries low and run in headless mode by default.
 *
 * Sign-in/upload/chat happy-path tests live in `e2e/auth-flow.spec.ts` and are
 * gated behind PLAYWRIGHT_E2E_USE_AUTH=1 so they don't run unless test
 * credentials are available; the smoke specs in `e2e/smoke.spec.ts` always run.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
