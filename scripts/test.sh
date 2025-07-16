#!/usr/bin/env bash
set -euo pipefail

# Set locale for reproducibility
export LC_ALL=C

echo "🧪 Running tests and quality checks..."

# Run type checking
echo "🔍 Type checking..."
pnpm -r run typecheck

# Run linting
echo "💅 Checking formatting..."
pnpm -r run lint

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

# Run E2E tests with Playwright
echo "🎭 Running E2E tests..."
pnpm exec playwright test --reporter=line
PLAYWRIGHT_EXIT_CODE=$?

# Exit with the same code as playwright
exit $PLAYWRIGHT_EXIT_CODE
