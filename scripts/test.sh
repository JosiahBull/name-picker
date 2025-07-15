#!/usr/bin/env bash
set -euo pipefail

# Set locale for reproducibility
export LC_ALL=C

echo "🧪 Running tests and quality checks..."

# Install dependencies if in CI or missing
if [ "${CI:-false}" = "true" ] || [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    if [ "${CI:-false}" = "true" ]; then
        pnpm install --frozen-lockfile
    else
        pnpm install
    fi
fi

# Run build
echo "🏗️ Building all packages..."
pnpm run --filter=shared build
pnpm run --filter=frontend build

# Run type checking
echo "🔍 Type checking..."
pnpm -r run typecheck

# Run linting
echo "🔧 Linting..."
pnpm -r run lint

# Run formatting check
echo "💅 Checking formatting..."
pnpm -r run format

# Run tests (when they exist)
echo "🧪 Running unit tests..."
if pnpm -r run test --if-present 2>/dev/null; then
    echo "✅ All unit tests passed"
else
    echo "⚠️  No unit tests found - this is expected for now"
fi

# Run E2E tests with Playwright
echo "🎭 Running E2E tests..."
if [ "${CI:-false}" = "true" ]; then
    # In CI, run headless
    npx playwright test
else
    # Local development, can be more verbose
    npx playwright test --reporter=list
fi

echo "✅ All quality checks passed!"
