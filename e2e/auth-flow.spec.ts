import { expect, test } from "@playwright/test";

/**
 * The full sign-in -> upload -> chat happy-path. Gated behind
 * PLAYWRIGHT_E2E_USE_AUTH so it doesn't fail in environments without
 * Clerk test credentials. Skips itself with a useful reason instead of
 * failing.
 *
 * Required env when enabled:
 *   PLAYWRIGHT_E2E_USE_AUTH=1
 *   E2E_TEST_USER_EMAIL=...
 *   E2E_TEST_USER_PASSWORD=...
 *
 * The test exercises the critical user funnel:
 *   1. Sign in (Clerk)
 *   2. Land on the dashboard
 *   3. Upload a small PDF fixture
 *   4. Wait for processing to complete
 *   5. Send a chat message and assert a streamed reply appears
 *
 * The actual selectors are intentionally resilient to copy changes —
 * they match by role/text rather than CSS class.
 */

const ENABLED = process.env.PLAYWRIGHT_E2E_USE_AUTH === "1";

test.describe("authenticated happy path (sign-in -> upload -> chat)", () => {
  test.skip(
    !ENABLED,
    "PLAYWRIGHT_E2E_USE_AUTH=1 not set; skipping auth-required E2E flow.",
  );

  const email = process.env.E2E_TEST_USER_EMAIL ?? "";
  const password = process.env.E2E_TEST_USER_PASSWORD ?? "";

  test("user can sign in, upload a PDF, and chat with it", async ({ page }) => {
    test.skip(
      !email || !password,
      "E2E_TEST_USER_EMAIL/E2E_TEST_USER_PASSWORD are required when PLAYWRIGHT_E2E_USE_AUTH=1.",
    );

    // 1. Sign in via Clerk's hosted form.
    await page.goto("/sign-in");
    await page.getByLabel(/email/i).fill(email);
    await page.getByRole("button", { name: /continue|next|sign in/i }).first().click();
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole("button", { name: /continue|sign in/i }).first().click();

    // 2. Land on the dashboard.
    await page.waitForURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: /my files|documents|dashboard/i })).toBeVisible({
      timeout: 15_000,
    });

    // 3. Upload a small PDF fixture (the file is tracked in the repo).
    await page.getByRole("button", { name: /upload|new file/i }).first().click();

    const [fileChooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      page.getByText(/click to upload|drop pdf|drag.*pdf/i).first().click(),
    ]);
    await fileChooser.setFiles("e2e/fixtures/sample.pdf");

    // 4. Wait for processing to complete and the file to be clickable.
    const fileRow = page.getByRole("link", { name: /sample\.pdf/i });
    await expect(fileRow).toBeVisible({ timeout: 60_000 });
    await fileRow.click();

    // 5. Send a chat message and expect a non-empty reply.
    const input = page.getByRole("textbox", { name: /ask|message|chat/i }).first();
    await input.fill("What is this document about?");
    await input.press("Enter");

    const aiMessage = page.locator('[data-role="assistant"], [data-testid="ai-message"]').last();
    await expect(aiMessage).toBeVisible({ timeout: 30_000 });
    await expect(aiMessage).not.toHaveText("");
  });
});
