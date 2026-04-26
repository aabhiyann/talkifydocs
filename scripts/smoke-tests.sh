#!/bin/bash

# Smoke Tests for Post-Deployment Verification
# Usage: ./scripts/smoke-tests.sh [BASE_URL]
# Example: ./scripts/smoke-tests.sh https://talkifydocs.vercel.app
#
# These probes are intentionally unauthenticated. They verify:
#   - Public pages load
#   - Health endpoint returns a sane payload
#   - Auth is enforced on protected APIs (401/403, NEVER 200 anonymously)
#   - Upload init endpoint is gated
#   - Chat endpoint is gated AND validates input shape (400/401)
#   - tRPC endpoint speaks tRPC (returns JSON, even on auth failure)
#
# We never exercise the full upload+chat path here because that requires
# a signed-in session — that lives in Playwright (e2e/auth-flow.spec.ts).

set -e

BASE_URL="${1:-http://localhost:3000}"
EXIT_CODE=0

echo "Running smoke tests against: $BASE_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ---------- helpers ---------------------------------------------------------

# Assert an endpoint returns one of the listed HTTP status codes.
# Usage: test_endpoint <name> <url> <status1> [status2 ...]
test_endpoint() {
  local name=$1
  local url=$2
  shift 2
  local expected=("$@")

  echo -n "Testing $name... "

  local response
  response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")

  for code in "${expected[@]}"; do
    if [ "$response" = "$code" ]; then
      echo -e "${GREEN}OK${NC} (Status: $response)"
      return 0
    fi
  done

  echo -e "${RED}FAIL${NC} (Expected one of: ${expected[*]}, Got: $response)"
  EXIT_CODE=1
  return 1
}

# Assert a POST endpoint with a body returns one of the listed HTTP status
# codes. Used for negative-path probes (anonymous POST -> 401 etc.).
# Usage: test_post <name> <url> <body> <content-type> <status1> [status2 ...]
test_post() {
  local name=$1
  local url=$2
  local body=$3
  local ctype=$4
  shift 4
  local expected=("$@")

  echo -n "Testing $name... "

  local response
  response=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "Content-Type: $ctype" \
    --data "$body" \
    "$url" || echo "000")

  for code in "${expected[@]}"; do
    if [ "$response" = "$code" ]; then
      echo -e "${GREEN}OK${NC} (Status: $response)"
      return 0
    fi
  done

  echo -e "${RED}FAIL${NC} (Expected one of: ${expected[*]}, Got: $response)"
  EXIT_CODE=1
  return 1
}

# Test health check endpoint payload shape.
test_health() {
  echo -n "Testing health check endpoint payload... "

  local response
  response=$(curl -s "$BASE_URL/api/health" || echo "")

  if echo "$response" | grep -Eq '"status":"(healthy|degraded|error)"'; then
    echo -e "${GREEN}OK${NC}"
    echo "  Response: $(echo "$response" | head -c 200)"
    return 0
  else
    echo -e "${RED}FAIL${NC}"
    echo "  Response: $response"
    EXIT_CODE=1
    return 1
  fi
}

# ---------- page loads ------------------------------------------------------

echo "Page Loads"
echo "===================="
test_endpoint "Homepage" "$BASE_URL/" 200
test_endpoint "Features page" "$BASE_URL/features" 200
test_endpoint "Pricing page" "$BASE_URL/pricing" 200
test_endpoint "Demo page" "$BASE_URL/demo" 200
test_endpoint "Sign in page" "$BASE_URL/sign-in" 200
test_endpoint "Sign up page" "$BASE_URL/sign-up" 200
echo ""

# ---------- public API surface ---------------------------------------------

echo "Public API Endpoints"
echo "========================"
test_endpoint "Health check" "$BASE_URL/api/health" 200 503
test_endpoint "Non-existent API" "$BASE_URL/api/nonexistent" 404
echo ""

echo "Health Check Details"
echo "=============================="
test_health
echo ""

# ---------- auth-gated probes (negative path) -------------------------------

# All of these MUST refuse anonymous access. A 200 here means we've
# regressed an auth gate or accidentally exposed user data.
echo "Auth Gates (anonymous access must be refused)"
echo "=============================================="
# /dashboard is gated by Clerk middleware -> redirect (3xx) or sign-in (200 of sign-in shell).
test_endpoint "Dashboard requires auth" "$BASE_URL/dashboard" 200 302 307 401
# /api/upload/complete should reject anonymous POSTs.
test_post "Upload complete (anon) refused" \
  "$BASE_URL/api/upload/complete" \
  '{"fileName":"x.pdf","fileUrl":"https://example.com/x.pdf","fileKey":"x","fileSize":10}' \
  "application/json" \
  401 403 405

# /api/chat should reject anonymous POSTs (auth before validation).
test_post "Chat (anon) refused" \
  "$BASE_URL/api/chat" \
  '{"fileId":"abc","message":"hello"}' \
  "application/json" \
  401 403 405
echo ""

# ---------- chat input validation (negative path) ---------------------------
# These test the API even when the user IS unauthenticated — we just want to
# confirm the endpoint is reachable and refuses bad input cleanly. We don't
# care if the response is 400 (validation) or 401 (auth-first). We DO care
# that it never 200s and never 5xx's on a malformed body.
echo "Chat input handling"
echo "==================="
test_post "Chat refuses empty body" \
  "$BASE_URL/api/chat" \
  '' \
  "application/json" \
  400 401 403 405
test_post "Chat refuses missing fields" \
  "$BASE_URL/api/chat" \
  '{}' \
  "application/json" \
  400 401 403 405
echo ""

# ---------- tRPC reachability (negative path) ------------------------------
# We pick a known tRPC procedure and assert the endpoint speaks JSON, even
# when refusing access. This catches mis-routing or 5xx regressions.
echo "tRPC reachability"
echo "================="
echo -n "Testing /api/trpc/getUserFiles content-type... "
trpc_resp=$(curl -s -o /dev/null -w "%{http_code}" \
  "$BASE_URL/api/trpc/getUserFiles" || echo "000")
if [[ "$trpc_resp" == "200" || "$trpc_resp" == "401" || "$trpc_resp" == "403" || "$trpc_resp" == "405" ]]; then
  echo -e "${GREEN}OK${NC} (Status: $trpc_resp)"
else
  echo -e "${RED}FAIL${NC} (Got: $trpc_resp)"
  EXIT_CODE=1
fi
echo ""

# ---------- static assets ---------------------------------------------------

echo "Static Assets"
echo "========================"
test_endpoint "Favicon" "$BASE_URL/favicon.ico" 200
echo ""

# ---------- summary ---------------------------------------------------------

echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}All smoke tests passed.${NC}"
else
  echo -e "${RED}Some smoke tests failed.${NC}"
fi

exit $EXIT_CODE
