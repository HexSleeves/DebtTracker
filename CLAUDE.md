# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a debt management and repayment optimization application built to help users track, manage, and eliminate their debt efficiently. The application provides debt tracking, payment strategy optimization (Avalanche/Snowball methods), and progress visualization. See `docs/PRD.md` for detailed product requirements.

## Development Commands

- `bun dev` - Start development server with turbo mode
- `bun run build` - Build production application
- `bun run preview` - Build and run production preview
- `bun run typecheck` - Run TypeScript type checking
- `bun run check` - Run Biome linting and formatting checks
- `bun run check:write` - Run Biome checks and fix auto-fixable issues
- `bun run check:unsafe` - Run Biome checks with unsafe fixes
- **IMPORTANT**: Run `bun run typecheck` after changes to ensure your changes didnt break typescript

### Testing Commands

- `bun test` - Run Jest test suite
- `bun test --watch` - Run tests in watch mode
- `bun test --coverage` - Run tests with coverage report
- Test files: `src/**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}`

## Architecture Overview

This is a T3 Stack application built with:

- **Next.js 15** (App Router) - React framework with SSR/SSG
- **tRPC** - End-to-end typesafe APIs
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type safety
- **Biome** - Linting and formatting
- **Bun** - Package manager and runtime
- **shadcn/ui** - Component library with Radix UI primitives
- **Supabase** - Database and backend services
- **Clerk** - Authentication and user management

### Project Structure

```bash
src/
├── app/                 # Next.js App Router
│   ├── (clerk)/        # Clerk auth route group
│   ├── (landing)/      # Landing page route group
│   ├── _components/     # Shared components
│   ├── api/trpc/        # tRPC API endpoint
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # Application components
│   ├── ui/             # shadcn/ui components
│   └── stats-card.tsx  # Custom debt statistics card
├── lib/                # Shared utilities
│   └── utils.ts        # cn() helper for class merging
├── server/              # Server-side code
│   └── api/            # tRPC API definition
│       ├── root.ts     # Main router
│       ├── trpc.ts     # tRPC setup
│       └── routers/    # API route handlers
├── trpc/               # Client-side tRPC setup
│   ├── react.tsx       # React Query provider
│   ├── query-client.ts # Query client config
│   └── server.ts       # Server-side caller
├── env.js              # Environment validation
└── styles/             # Global styles
```

## tRPC Implementation

### Server Setup

- **Context**: Provides `userId` from Clerk auth and `supabase` client in `src/server/api/trpc.ts`
- **Authentication**: Uses Clerk's `auth()` function for user authentication
- **Database**: Supabase client with service role key for server-side operations
- **Middleware**: Built-in timing middleware with artificial dev delay (100-500ms in dev)
- **Error Handling**: Zod validation errors are formatted and passed to client
- **Transformer**: SuperJSON for serialization of complex types
- **Procedures**: Both `publicProcedure` and `protectedProcedure` available

### Client Setup

- **Provider**: `TRPCReactProvider` wraps app with React Query
- **Singleton Pattern**: Query client uses singleton in browser, new instance on server
- **Logging**: Enabled in development and for errors
- **Batch Streaming**: Uses `httpBatchStreamLink` for efficient requests

### Adding New API Routes

1. Create router in `src/server/api/routers/`
2. Export procedures using `publicProcedure` or `protectedProcedure`
3. Add router to `appRouter` in `src/server/api/root.ts`
4. Types are automatically inferred via `RouterInputs` and `RouterOutputs`

### Existing API Routes

- **debt**: Debt management operations (create, read, update, delete debts)
- **payment**: Payment tracking and history
- **paymentPlan**: Payment strategy optimization (Avalanche/Snowball methods)
- **post**: Example router (can be removed when no longer needed)

## Environment Variables

Environment validation is handled by `@t3-oss/env-nextjs` in `src/env.js`. Required environment variables:

**Server Variables:**

- `CLERK_SECRET_KEY` - Clerk authentication secret key
- `CLERK_WEBHOOK_SECRET` - Clerk webhook secret for secure callbacks
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key for server-side operations

**Client Variables:**

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key for client-side auth
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key for client-side operations

Configuration pattern:

- Server variables: Define in `server` object
- Client variables: Define in `client` object (must be prefixed with `NEXT_PUBLIC_`)
- Add to `runtimeEnv` object for runtime access
- Use `SKIP_ENV_VALIDATION=1` to skip validation during builds

## Code Quality

- **Biome**: Configured in `biome.jsonc` with strict rules
- **TypeScript**: Strict mode enabled
- **Import Organization**: Auto-organized via Biome
- **CSS Classes**: Sorted automatically for Tailwind (supports `clsx`, `cva`, `cn`)

## UI Components

### shadcn/ui Integration

- **Component Library**: Built on Radix UI primitives with Tailwind CSS
- **Utility Function**: `cn()` in `src/lib/utils.ts` combines `clsx` and `tailwind-merge`
- **Variants**: Uses `class-variance-authority` for component variants
- **Composition**: Components support `asChild` prop via `@radix-ui/react-slot`

### Component Patterns

- All UI components use the `cn()` utility for class merging
- Variant-based styling with `cva()` for consistent component APIs
- Dark mode support built into component variants
- Focus and accessibility states handled automatically

## Path Aliases

The project uses TypeScript path aliases configured in `tsconfig.json`:

- `~/*` maps to `./src/*`

## Authentication Architecture

The project is configured for dual authentication providers:

- **Supabase**: Database-integrated auth with `@supabase/ssr` and `@supabase/supabase-js`
- **Clerk**: Modern auth provider with `@clerk/nextjs`

The current `src/env.js` shows Supabase configuration, but Clerk is available as a dependency.

## Database Integration

Supabase client configuration is available in `src/lib/supabase/`:

- `client.ts` - Browser client
- `server.ts` - Server-side client
- `middleware.ts` - Middleware integration

## Development Notes

- Uses Turbo mode for faster development builds
- Artificial delay in tRPC procedures during development to simulate network latency (100-500ms)
- All tRPC procedures are logged with execution timing
- Git VCS integration enabled in Biome configuration
- `tw-animate-css` available for advanced animations
- Jest configured with Next.js integration and jsdom environment
- Test setup includes path aliases and coverage collection
- Husky and lint-staged configured for pre-commit hooks

## Database Schema

The application uses Supabase with TypeScript types generated from the database schema. Key concepts:

- Database types are defined in `src/types/db.ts` (generated from Supabase)
- Supabase client is configured for both client-side and server-side use
- Row Level Security (RLS) should be enabled for user data isolation
- Database migrations managed through Supabase dashboard or CLI

## Core Business Logic

Based on the PRD, the application implements:

1. **Debt Management**: Track multiple debt types with balance, APR, minimum payments
2. **Payment Strategies**:
   - Avalanche: Pay highest interest rate first
   - Snowball: Pay smallest balance first
   - Custom: User-defined prioritization
3. **Progress Visualization**: Charts showing debt reduction over time
4. **Payment Scheduling**: Due date reminders and payment tracking