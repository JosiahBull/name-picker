#!/usr/bin/env bash
set -euo pipefail

# Set locale for reproducibility
export LC_ALL=C

echo "🚀 Setting up development environment..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Check if Docker is running (for Supabase)
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker for Supabase local development."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Copy environment file if it doesn't exist
if [ ! -f "packages/frontend/.env.local" ]; then
    echo "📄 Creating .env.local file..."
    cp packages/frontend/.env.example packages/frontend/.env.local
    echo "⚠️  Please update packages/frontend/.env.local with your Supabase credentials"
fi

# Start Supabase
echo "🗄️  Starting Supabase..."
pnpm supabase:start

# Generate types
echo "🔧 Generating database types..."
pnpm gen-types

echo "✅ Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'pnpm dev' to start the development server"
echo "2. Visit http://localhost:5173 to see the app"
echo "3. Visit http://localhost:54323 to access Supabase Studio"