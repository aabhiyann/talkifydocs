#!/bin/bash

# Smoke Tests for Post-Deployment Verification
# Usage: ./scripts/smoke-tests.sh [BASE_URL]
# Example: ./scripts/smoke-tests.sh https://talkifydocs.vercel.app

set -e

BASE_URL="${1:-http://localhost:3000}"
EXIT_CODE=0

echo "🚀 Running smoke tests against: $BASE_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
  local name=$1
  local url=$2
  local expected_status=${3:-200}
  
  echo -n "Testing $name... "
  
  response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
  
  if [ "$response" = "$expected_status" ]; then
    echo -e "${GREEN}✓${NC} (Status: $response)"
    return 0
  else
    echo -e "${RED}✗${NC} (Expected: $expected_status, Got: $response)"
    EXIT_CODE=1
    return 1
  fi
}

# Test health check endpoint
test_health() {
  echo -n "Testing health check endpoint... "
  
  response=$(curl -s "$BASE_URL/api/health" || echo "")
  
  if echo "$response" | grep -q '"status":"healthy"'; then
    echo -e "${GREEN}✓${NC}"
    echo "  Response: $response" | head -c 200
    echo ""
    return 0
  else
    echo -e "${RED}✗${NC}"
    echo "  Response: $response"
    EXIT_CODE=1
    return 1
  fi
}

# Test page loads
echo "📄 Testing Page Loads"
echo "===================="
test_endpoint "Homepage" "$BASE_URL/" 200
test_endpoint "Features page" "$BASE_URL/features" 200
test_endpoint "Pricing page" "$BASE_URL/pricing" 200
test_endpoint "Demo page" "$BASE_URL/demo" 200
test_endpoint "Sign in page" "$BASE_URL/sign-in" 200
test_endpoint "Sign up page" "$BASE_URL/sign-up" 200
echo ""

# Test API endpoints
echo "🔌 Testing API Endpoints"
echo "========================"
test_endpoint "Health check" "$BASE_URL/api/health" 200
test_endpoint "Non-existent API" "$BASE_URL/api/nonexistent" 404
echo ""

# Test health check details
echo "🏥 Testing Health Check Details"
echo "=============================="
test_health
echo ""

# Test static assets
echo "📦 Testing Static Assets"
echo "========================"
test_endpoint "Favicon" "$BASE_URL/favicon.ico" 200
echo ""

# Summary
echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✅ All smoke tests passed!${NC}"
else
  echo -e "${RED}❌ Some smoke tests failed${NC}"
fi

exit $EXIT_CODE

