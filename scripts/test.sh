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
SUPABASE_OUTPUT=$(pnpm exec supabase status --output json 2> /dev/null)
export VITE_SUPABASE_URL=$(echo "$SUPABASE_OUTPUT" | jq -r '.API_URL')
export VITE_SUPABASE_ANON_KEY=$(echo "$SUPABASE_OUTPUT" | jq -r '.ANON_KEY')
export VITE_SUPABASE_SERVICE_ROLE_KEY=$(echo "$SUPABASE_OUTPUT" | jq -r '.SERVICE_ROLE_KEY')

# Verify we got the values
if [ -z "$VITE_SUPABASE_URL" ] || [ "$VITE_SUPABASE_URL" = "null" ]; then
    echo "❌ Failed to extract Supabase environment variables"
    exit 1
fi

# Start the dev server in the background
echo "🚀 Starting dev server..."
pnpm --filter=frontend run dev > /tmp/vite-output.log 2>&1 &
DEV_SERVER_PID=$!

# Wait for the dev server to be ready and detect the port
echo "⏳ Waiting for dev server to be ready..."
DEV_SERVER_URL=""
for i in {1..30}; do
    if [ -f /tmp/vite-output.log ]; then
        # Extract the URL from vite output
        URL=$(grep -o "http://localhost:[0-9]*" /tmp/vite-output.log | head -1)
        if [ -n "$URL" ]; then
            DEV_SERVER_URL=$URL
            break
        fi
    fi
    sleep 1
done

if [ -z "$DEV_SERVER_URL" ]; then
    echo "❌ Failed to detect dev server URL"
    exit 1
fi

echo "✅ Dev server is ready at $DEV_SERVER_URL"

# Update Playwright config with the correct base URL
export PLAYWRIGHT_BASE_URL=$DEV_SERVER_URL

# Run E2E tests with Playwright
echo "🎭 Running E2E tests..."
pnpm exec playwright test --reporter=line
PLAYWRIGHT_EXIT_CODE=$?

# Clean up: kill the dev server
echo "🛑 Stopping dev server..."
kill $DEV_SERVER_PID 2>/dev/null || true

# Exit with the same code as playwright
exit $PLAYWRIGHT_EXIT_CODE
