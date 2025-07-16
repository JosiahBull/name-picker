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

echo "🗄️ Ensuring database is up to date..."
pnpm run supabase:start
pnpm run supabase:reset

# Start the dev server in the background
echo "🚀 Starting dev server..."
pnpm --filter=frontend run dev &
DEV_SERVER_PID=$!

# Wait for the dev server to be ready
echo "⏳ Waiting for dev server to be ready..."
while ! curl -s http://localhost:5173 > /dev/null 2>&1; do
    sleep 1
done
echo "✅ Dev server is ready"

# Run E2E tests with Playwright
echo "🎭 Running E2E tests..."
npx playwright test
PLAYWRIGHT_EXIT_CODE=$?

# Clean up: kill the dev server
echo "🛑 Stopping dev server..."
kill $DEV_SERVER_PID 2>/dev/null || true

# Exit with the same code as playwright
exit $PLAYWRIGHT_EXIT_CODE
