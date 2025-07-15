# Name Picker

A Tinder-style name selection app for couples choosing their last name together.

## Features

- 📱 Swipe-based interface for name selection
- 💾 Results saved to Supabase database
- 📊 Usage analytics and response tracking
- 👥 Couple-based matching system
- 🔄 Review matched names together

## Architecture

This is a pnpm monorepo with the following packages:

- **`packages/frontend`** - React app with Material-UI and Vite
- **`packages/backend`** - Express.js API with Supabase integration
- **`packages/shared`** - Common types and utilities

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development servers
./scripts/dev.sh
# or
pnpm dev

# Build all packages
./scripts/build.sh
# or 
pnpm build

# Run linting and type checking
./scripts/lint.sh
# or
pnpm lint && pnpm typecheck
```

## Development

### Prerequisites

- Node.js >= 18
- pnpm >= 8

### Scripts

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages
- `pnpm lint` - Run ESLint across all packages
- `pnpm format` - Format code with Prettier
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm clean` - Clean all build artifacts and node_modules

### Package Structure

```
packages/
├── frontend/          # React frontend application
├── backend/           # Express.js API server
└── shared/            # Shared types and utilities

scripts/               # Global development scripts
├── dev.sh            # Start development environment
├── build.sh          # Build all packages
└── lint.sh           # Run linting and type checks
```

## Tech Stack

- **Frontend**: React, Material-UI, Vite, TypeScript
- **Backend**: Express.js, Supabase, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Package Manager**: pnpm
- **Build Tools**: Vite, TypeScript
- **Code Quality**: ESLint, Prettier

## Getting Started

1. Clone the repository
2. Run `pnpm install` to install dependencies
3. Set up your Supabase project and configure environment variables
4. Run `./scripts/dev.sh` to start development servers
5. Open http://localhost:5173 to view the frontend

## Contributing

1. Run `pnpm lint` before committing
2. Ensure all type checks pass with `pnpm typecheck`
3. Format code with `pnpm format`