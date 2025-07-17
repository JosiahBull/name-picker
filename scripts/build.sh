#!/usr/bin/env bash
set -euo pipefail

# Set locale for reproducibility
export LC_ALL=C

echo "🏗️  Building all packages..."

# Install dependencies if in CI or missing
if [ "${CI:-false}" = "true" ] || [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    if [ "${CI:-false}" = "true" ]; then
        pnpm install --frozen-lockfile
    else
        pnpm install
    fi
fi

# Build frontend
echo "🌐 Building frontend..."
pnpm --filter=frontend... build

echo "✅ All packages built successfully!"
