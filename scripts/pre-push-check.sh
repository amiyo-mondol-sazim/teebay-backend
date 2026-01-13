#!/bin/bash

set -e

echo "🔍 Running pre-push checks..."
echo ""

echo "📦 Building project..."
yarn build
echo "✅ Build passed"
echo ""

echo "🔎 Checking TypeScript types..."
npx tsc --noEmit
echo "✅ Type check passed"
echo ""

echo "🎨 Checking code formatting..."
npx prettier --check "src/**/*.ts" "test/**/*.ts"
echo "✅ Format check passed"
echo ""

echo "🔧 Running linter..."
yarn lint
echo "✅ Lint passed"
echo ""

echo "🧪 Running tests..."
yarn test
echo "✅ Tests passed"
echo ""

echo "✅ All checks passed! Safe to push."
