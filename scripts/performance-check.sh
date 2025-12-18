#!/bin/bash

# Performance Check Script
# Checks bundle size, build time, and other performance metrics
# Usage: ./scripts/performance-check.sh

set -e

echo "📊 Performance Check"
echo "===================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Build the application
echo "🔨 Building application..."
START_TIME=$(date +%s)
npm run build
END_TIME=$(date +%s)
BUILD_TIME=$((END_TIME - START_TIME))

echo -e "${GREEN}✓${NC} Build completed in ${BUILD_TIME}s"
echo ""

# Check bundle sizes
echo "📦 Checking Bundle Sizes"
echo "========================"

if [ -d ".next" ]; then
  # Find and display largest chunks
  echo "Largest JavaScript chunks:"
  find .next/static/chunks -name "*.js" -type f -exec ls -lh {} \; | \
    awk '{print $5, $9}' | \
    sort -hr | \
    head -10 | \
    while read size file; do
      size_mb=$(echo "scale=2; $(echo $size | sed 's/[^0-9]//g') / 1024 / 1024" | bc 2>/dev/null || echo "N/A")
      echo "  $size_mb MB - $(basename $file)"
    done
  
  echo ""
  echo "Total .next directory size:"
  du -sh .next | awk '{print $1}'
else
  echo -e "${RED}✗${NC} .next directory not found. Run 'npm run build' first."
fi

echo ""

# Check for large dependencies
echo "📚 Checking Dependencies"
echo "======================"
if [ -f "package.json" ]; then
  echo "Total dependencies: $(npm list --depth=0 2>/dev/null | wc -l | xargs)"
  echo ""
  echo "Largest node_modules packages:"
  du -sh node_modules/* 2>/dev/null | sort -hr | head -10 || echo "  (Could not analyze)"
fi

echo ""

# Performance recommendations
echo "💡 Performance Recommendations"
echo "============================="
echo ""

if [ $BUILD_TIME -gt 120 ]; then
  echo -e "${YELLOW}⚠${NC}  Build time is over 2 minutes. Consider optimizing."
else
  echo -e "${GREEN}✓${NC}  Build time is acceptable (< 2 minutes)"
fi

echo ""
echo "Check the following:"
echo "  - Bundle size should be < 500KB per chunk"
echo "  - First Contentful Paint should be < 1.5s"
echo "  - Time to Interactive should be < 3.5s"
echo "  - Lighthouse Performance score should be > 70"
echo ""

