#!/usr/bin/env bash
set -euo pipefail

# Set locale for reproducibility
export LC_ALL=C

echo "🚀 Starting development servers..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Ensure the database has been brought up with the latest migrations
echo "🗄️ Ensuring database is up to date..."
pnpm supabase:reset
pnpm gen-types

# Start all dev servers
echo "🏃 Starting all development servers..."
pnpm -r --parallel run dev
