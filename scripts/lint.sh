#!/bin/bash

echo "🔍 Running linters and type checks..."

# Generate supabase types
echo "🛠️ Generating Supabase types..."
pnpm run gen-types

# Run type checking
echo "📋 Type checking..."
pnpm typecheck

# Run ESLint
echo "🔧 Running ESLint..."
pnpm lint

# Run Prettier check
echo "💅 Checking formatting..."
pnpm format

echo "✅ All checks complete!"
