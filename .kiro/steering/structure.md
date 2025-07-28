# Project Structure & Organization

## Root Level

- **Configuration files**: `next.config.js`, `biome.jsonc`, `tsconfig.json`, `package.json`
- **Environment**: `.env.local`, `.env.example` for environment variables
- **Documentation**: `README.md`, `CONTRIBUTING.md`, `docs/PRD.md`

## Source Structure (`src/`)

### Application Routes (`src/app/`)

- **App Router structure** with nested layouts and pages
- **API routes**: `api/trpc/[trpc]/route.ts` for tRPC endpoint
- **Dashboard**: Main application area with nested routes
  - `dashboard/page.tsx` - Main dashboard
  - `dashboard/debts/page.tsx` - Debt management
  - `dashboard/payments/page.tsx` - Payment tracking
  - `dashboard/strategies/page.tsx` - Strategy comparison
- **Authentication**: `sign-in/` and `sign-up/` with Clerk integration
- **Public pages**: Landing page and showcase

### Components (`src/components/`)

- **UI components** (`ui/`): shadcn/ui components (Button, Card, Table, etc.)
- **Form fields** (`form-fields/`): Reusable form inputs with validation
- **Forms** (`forms/`): Complete form components
- **Dialogs** (`dialogs/`): Modal components
- **Shared components**: Error boundaries, theme providers, performance monitors

### Server Layer (`src/server/`)

- **API structure** (`api/`): tRPC router definitions
  - `root.ts` - Main router
  - `trpc.ts` - tRPC configuration and procedures
  - `routers/` - Individual route handlers
- **Server utilities** (`lib/`): Server-side algorithms and helpers

### Client Layer (`src/trpc/`)

- **React integration**: tRPC React Query setup
- **Query client**: TanStack Query configuration
- **Server calls**: Server-side tRPC usage

### Utilities & Configuration

- **Types** (`src/types/`): Database types and application interfaces
- **Library code** (`src/lib/`):
  - Utility functions (`utils.ts`)
  - Custom hooks (`hooks/`)
  - Algorithm implementations (`algorithms/`)
  - Supabase client configuration (`supabase/`)
- **Styles** (`src/styles/`): Global CSS and Tailwind configuration
- **Environment** (`src/env.js`): Type-safe environment validation

## Database (`supabase/`)

- **Migrations**: SQL migration files
- **Configuration**: `config.toml` for Supabase settings

## Naming Conventions

- **Files**: kebab-case for components and pages (`debt-table.tsx`)
- **Directories**: kebab-case for folders (`form-fields/`)
- **Components**: PascalCase for React components
- **Functions**: camelCase for utilities and hooks
- **Types**: PascalCase for interfaces and types
- **Database**: snake_case for database fields (transformed to camelCase in app)

## Import Patterns

- Use path alias `~/` for src imports
- Barrel exports in `index.ts` files where appropriate
- Type-only imports with `import type`
- Server-only imports protected with `server-only` package

## Component Organization

- Co-locate related components in feature directories
- Separate UI primitives from business logic components
- Use `_components` prefix for route-specific component folders
- Keep forms and dialogs in dedicated directories
