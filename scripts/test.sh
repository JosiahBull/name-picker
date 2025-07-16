#!/usr/bin/env bash
set -euo pipefail

# Set locale for reproducibility
export LC_ALL=C

echo "🗄️ Starting database in background..."

pnpm run supabase:start && pnpm run supabase:reset &
DB_PID=$!

echo "🧪 Running tests and quality checks..."

# Run type checking
echo "🔍 Type checking..."
pnpm -r run typecheck

# Run linting
echo "💅 Checking formatting..."
pnpm -r run lint

wait $DB_PID
if [ $? -ne 0 ]; then
    echo "❌ Database setup failed"
    exit 1
fi

# Capture Supabase environment variables from the running instance
echo "🔧 Capturing Supabase environment variables..."

# Get the status output and extract just the JSON part
SUPABASE_OUTPUT=$(pnpm exec supabase status --output json 2>&1)
export VITE_SUPABASE_URL=$(echo "$SUPABASE_STATUS" | jq -r '.API_URL')
export VITE_SUPABASE_ANON_KEY=$(echo "$SUPABASE_STATUS" | jq -r '.ANON_KEY')
export VITE_SUPABASE_SERVICE_ROLE_KEY=$(echo "$SUPABASE_STATUS" | jq -r '.SERVICE_ROLE_KEY')

# Verify we got the values
if [ -z "$VITE_SUPABASE_URL" ] || [ "$VITE_SUPABASE_URL" = "null" ]; then
    echo "❌ Failed to extract Supabase environment variables"
    exit 1
fi

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
