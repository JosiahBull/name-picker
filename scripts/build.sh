#!/bin/bash

echo "🏗️  Building all packages..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Build in correct order
echo "1️⃣  Building shared package..."
pnpm --filter @name-picker/shared build

echo "2️⃣  Building backend..."
pnpm --filter @name-picker/backend build

echo "3️⃣  Building frontend..."
pnpm --filter @name-picker/frontend build

echo "✅ Build complete!"