#!/bin/bash

echo "🔄 Updating dependencies safely..."

# Update patch versions (safe)
npm update

# Update specific packages to latest (review first)
npm install next@latest react@latest react-dom@latest

# Update dev dependencies
npm install -D @types/node@latest @types/react@latest typescript@latest eslint@latest prettier@latest

# Remove unused dependencies (placeholders - already removed major ones during audit)
# npm uninstall [package-name]

# Verify everything still works
npm run build

echo "✅ Dependencies updated!"
