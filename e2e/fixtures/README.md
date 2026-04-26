# E2E fixtures

Place test artifacts referenced by Playwright specs here.

## `sample.pdf`

The authenticated happy-path spec (`e2e/auth-flow.spec.ts`) uploads
`e2e/fixtures/sample.pdf`. It is intentionally not committed to keep the repo
small and to avoid storing real document content.

To run that spec locally:

```bash
# Drop any small (<1 MB) PDF here. A blank one-page PDF is fine.
cp ~/Downloads/some-small.pdf e2e/fixtures/sample.pdf

PLAYWRIGHT_E2E_USE_AUTH=1 \
E2E_TEST_USER_EMAIL=... \
E2E_TEST_USER_PASSWORD=... \
npm run test:e2e
```

Without `PLAYWRIGHT_E2E_USE_AUTH=1` the spec is skipped, so a missing PDF will
not break CI.
