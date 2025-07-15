#!/bin/bash

echo "🚀 Starting development servers..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Ensure the database has been brought up with the latest migrations
echo "🗄️ Ensuring database is up to date..."
pnpm run supabase:reset
pnpm run gen-types

# Build shared package first
echo "🔨 Building shared package..."
pnpm --filter @name-picker/shared build

# Start all dev servers
echo "🏃 Starting all development servers..."
pnpm dev
