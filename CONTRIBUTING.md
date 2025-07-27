# Contributing to Name Picker

Thanks for your interest in contributing! This guide will help you get up and running with the development environment.

## 🚀 Quick Setup

### Prerequisites

- **Node.js** 22+
- **pnpm** 10+
- **Docker**
- **Git** for version control

### Initial Setup

```bash
# 1. Clone the repository
git clone https://github.com/josiahbull/name-picker.git
cd name-picker

# 2. Start development
pnpm dev
```

The app will be available at:

- **Frontend**: http://localhost:5173
- **Supabase Studio**: http://localhost:54323

## 📁 Project Structure

```
name-picker/
├── .github/workflows/       # CI/CD workflows
├── packages/
│   ├── frontend/           # React app (Vite + Material-UI)
│   │   ├── src/
│   │   │   ├── components/ # Reusable UI components
│   │   │   ├── pages/      # Route components
│   │   │   ├── context/    # React contexts (API, User)
│   │   │   └── theme.ts    # Material-UI theme
│   │   ├── .env.example    # Environment template
│   │   └── package.json
│   └── shared/             # Common code
│       ├── src/
│       │   ├── types.ts    # TypeScript types
│       │   ├── api.ts      # Supabase API client
│       │   └── index.ts    # Package exports
│       └── package.json
├── supabase/               # Database
│   ├── migrations/         # SQL migration files
│   ├── seed.sql           # Sample data
│   └── config.toml        # Supabase config
├── scripts/               # Development tools
│   ├── dev-setup.sh      # Initial environment setup
│   ├── ci-test.sh        # CI testing script
│   └── ci-build.sh       # CI build script
└── package.json          # Root workspace config
```

## 🛠 Development Workflow

### Daily Development

```bash
# Start all services
pnpm dev

# In separate terminals, you can also run:
pnpm --filter=frontend dev    # Frontend only
pnpm supabase:start          # Database only
```

### Code Quality

Before committing, always run:

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Auto-fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

### Database Changes

```bash
# Create a new migration
pnpm dlx supabase@latest migration new migration_name

# Apply migrations locally
pnpm dlx supabase@latest db reset

# Generate TypeScript types
pnpm gen-types
```

## 🏗 Architecture Overview

### Frontend (React)

- **Vite** for fast development and building
- **Material-UI** for consistent design components
- **React Router** for navigation
- **Framer Motion** for swipe animations
- **TypeScript** for type safety

### Backend (Supabase)

- **PostgreSQL** database with Row Level Security
- **Supabase Edge Functions** for serverless API
- **Database functions** for complex queries
- **Real-time subscriptions** for live updates

### Shared Package

- **TypeScript types** shared between frontend and any future backend
- **API client** for consistent database interactions
- **Utilities** and common functions

## 🧪 Testing

Currently, the project focuses on type safety and linting. Test setup is planned for the future.

```bash
# Run all quality checks
./scripts/test.sh

# Individual checks
pnpm typecheck    # TypeScript
pnpm lint         # ESLint
pnpm audit        # Security audit
```

## 🎨 Code Style

### TypeScript Guidelines

```typescript
// ✅ Good: Explicit interface definitions
interface UserProfile {
	id: string;
	name: string;
	email?: string;
}

// ✅ Good: Descriptive function names
async function getUserProfile(userId: string): Promise<UserProfile> {
	// implementation
}

// ❌ Avoid: any types
const userData: any = fetchUser();

// ✅ Better: Proper typing
const userData: UserProfile = await fetchUser();
```

### React Guidelines

```typescript
// ✅ Good: Functional components with TypeScript
interface Props {
  name: string
  onSelect: (name: string) => void
}

export function NameCard({ name, onSelect }: Props) {
  return (
    <Card onClick={() => onSelect(name)}>
      {name}
    </Card>
  )
}

// ✅ Good: Custom hooks for reusable logic
function useNameFetcher(userId: string) {
  const [names, setNames] = useState<Name[]>([])
  // hook logic
  return { names, refetch }
}
```

### Import/Export Style

```typescript
// ✅ Good: Organized imports
import React from 'react';
import { Button, Card } from '@mui/material';

import { SupabaseApiClient } from '@name-picker/shared';

import { useUser } from '../context/UserContext';
import './NameCard.css';

// ✅ Good: Named exports
export { NameCard };
export type { NameCardProps };
```

## 🔧 Common Tasks

### Adding a New Page

1. Create component in `packages/frontend/src/pages/NewPage.tsx`
2. Add route in `packages/frontend/src/App.tsx`
3. Add navigation link if needed

### Adding Database Fields

1. Create migration: `pnpm dlx supabase@latest migration new add_field`
2. Write SQL in the migration file
3. Apply: `pnpm dlx supabase@latest db reset`
4. Generate types: `pnpm gen-types`
5. Update TypeScript interfaces in `packages/shared/src/types.ts`

### Adding a New API Method

1. Add method to `ApiClient` interface in `packages/shared/src/types.ts`
2. Implement in `SupabaseApiClient` in `packages/shared/src/api.ts`
3. Use in frontend components via `useApi()` hook

## 🐛 Debugging

### Frontend Issues

- Check browser console for errors
- Verify API calls in Network tab
- Check component state with React DevTools

### Database Issues

- Use Supabase Studio at http://localhost:54323
- Check SQL Query tab for query debugging
- Review RLS policies in Authentication > Policies

### Environment Issues

```bash
# Reset everything
pnpm clean
pnpm install

# Reset Supabase
pnpm supabase:reset
```

## 📋 Pull Request Process

1. **Create Feature Branch**

    ```bash
    git checkout -b feature/your-feature-name
    ```

2. **Make Changes**
    - Follow code style guidelines
    - Add/update types as needed
    - Test your changes manually

3. **Run Quality Checks**

    ```bash
    ./scripts/ci-test.sh
    ```

4. **Commit with Clear Messages**

    ```bash
    git commit -m "feat: add name upload validation"
    ```

5. **Push and Create PR**

    ```bash
    git push origin feature/your-feature-name
    ```

6. **PR Review**
    - CI checks must pass
    - Code review from maintainers
    - Address any feedback

## 🆘 Getting Help

- **Documentation**: Check this CONTRIBUTING.md
- **Issues**: Search existing GitHub issues
- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue with reproduction steps

## 🎯 Development Priorities

1. **Type Safety** - Ensure all code is properly typed
2. **User Experience** - Smooth, intuitive interactions
3. **Performance** - Fast loading and responsive UI
4. **Security** - Proper authentication and data protection
5. **Maintainability** - Clean, well-documented code

Happy coding! 🚀
