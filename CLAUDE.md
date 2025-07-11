# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A debt management and repayment optimization application built to help users track, manage, and eliminate debt efficiently. The application provides debt tracking, payment strategy optimization (Avalanche/Snowball methods), and progress visualization.

## Development Commands

- `bun dev` - Start development server with turbo mode
- `bun run build` - Build production application
- `bun run preview` - Build and run production preview
- `bun run typecheck` - Run TypeScript type checking
- `bun run check` - Run Biome linting and formatting checks
- `bun run check:write` - Run Biome checks and fix auto-fixable issues
- `bun run check:unsafe` - Run Biome checks with unsafe fixes
- `bun run lint` - Run ESLint
- `bun run lint:fix` - Run ESLint with auto-fix
- `bun run format:check` - Check Prettier formatting
- `bun run format:write` - Apply Prettier formatting
- `bun run lighthouse` - Run Lighthouse performance audit
- **IMPORTANT**: Run `bun run typecheck` after changes to ensure TypeScript compliance

### Testing Commands

- `bun test` - Run Jest test suite
- `bun test --watch` - Run tests in watch mode
- `bun test --coverage` - Run tests with coverage report
- Test files: `src/**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}` and `src/**/*.{test,spec}.{js,jsx,ts,tsx}`

## Architecture Overview

Next.js 15 application using the App Router with:

- **Next.js 15** - React framework with App Router, React 19, and React Compiler
- **tRPC** - End-to-end typesafe APIs with React Query integration
- **Tailwind CSS 4** - Utility-first CSS framework with PostCSS
- **TypeScript** - Type safety with strict mode
- **Biome** - Fast linting and formatting (replaces ESLint/Prettier for most tasks)
- **Bun** - Package manager and runtime
- **shadcn/ui** - Component library built on Radix UI primitives
- **Supabase** - Database with TypeScript types and RLS
- **Clerk** - Authentication and user management

### Project Structure

```bash
src/
├── app/                    # Next.js App Router
│   ├── dashboard/          # Protected dashboard routes
│   │   ├── _components/    # Dashboard-specific components
│   │   ├── debts/         # Debt management pages
│   │   └── strategies/    # Payment strategy pages
│   ├── sign-in/           # Clerk authentication routes
│   ├── sign-up/
│   ├── showcase/          # Theme and component showcase
│   └── api/trpc/          # tRPC API endpoint
├── components/            # Shared UI components
│   ├── ui/               # shadcn/ui components
│   └── [feature].tsx     # Custom components
├── lib/                  # Shared utilities and configurations
│   ├── algorithms/       # Debt repayment algorithms
│   ├── hooks/           # Custom React hooks
│   └── supabase/        # Database client configurations
├── server/api/          # tRPC server-side implementation
│   ├── routers/         # API route handlers
│   │   ├── debt/        # Debt CRUD operations
│   │   ├── payment/     # Payment tracking
│   │   └── paymentPlan/ # Strategy optimization
│   ├── root.ts          # Main tRPC router
│   └── trpc.ts          # tRPC configuration
├── trpc/                # Client-side tRPC setup
├── types/               # TypeScript type definitions
│   └── database.types.ts # Generated Supabase types
└── env.js               # Environment variable validation
```

## tRPC Implementation

### Server Configuration

- **Context**: Provides authenticated `userId` via Clerk and `supabase` service client
- **Procedures**: `publicProcedure` and `protectedProcedure` with automatic auth validation
- **Middleware**: Development timing simulation (100-500ms delay)
- **Validation**: Zod schemas for all inputs with automatic error handling
- **Transform**: SuperJSON for Date/BigInt serialization

### Client Configuration

- **Provider**: `TRPCReactProvider` with React Query integration
- **Links**: HTTP batch streaming for optimized requests
- **Caching**: React Query with singleton pattern for browser/server consistency

### Current API Routes

- `debt` - CRUD operations for debt management
- `payment` - Payment history and tracking
- `paymentPlan` - Strategy optimization (Avalanche/Snowball algorithms)
- `post` - Example router (legacy, can be removed)

## Database Schema

Supabase PostgreSQL with generated TypeScript types in `src/types/database.types.ts`:

**Core Tables:**

- `debts` - User debts with balance, interest rate, minimum payments
- `payments` - Payment history linked to specific debts
- `payment_plans` - Strategy configurations and budgets

**Authentication:**

- Row Level Security (RLS) enforced via `clerk_user_id`
- Server-side operations use service role key
- Client-side operations use anon key with RLS

## Environment Variables

Validation via `@t3-oss/env-nextjs` in `src/env.js`:

**Required Server:**

- `CLERK_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Required Client:**

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Code Quality Tools

### Biome Configuration (`biome.jsonc`)

- Linting with custom rules for React/TypeScript
- Auto-formatting with import organization
- Tailwind class sorting for `clsx`, `cva`, `cn` functions
- Git integration for VCS-aware linting

### Additional Tools

- **ESLint**: Next.js configuration with TypeScript rules
- **Prettier**: Code formatting with Tailwind plugin
- **TypeScript**: Strict mode with path aliases (`~/*` → `./src/*`)
- **Jest**: Testing with Next.js integration and jsdom environment

## UI Architecture

### Component System

- **shadcn/ui**: Radix UI primitives with Tailwind styling
- **Variants**: `class-variance-authority` for consistent component APIs
- **Theming**: Dark mode support with `next-themes`
- **Utility**: `cn()` function combines `clsx` and `tailwind-merge`

### Motion and Animation

- **Motion**: Modern animation library (replaces Framer Motion)
- **tw-animate-css**: Extended Tailwind animations

## Business Logic

### Debt Repayment Algorithms (`src/lib/algorithms/`)

- **Avalanche**: Prioritize highest interest rate debts
- **Snowball**: Prioritize smallest balance debts
- **Calculator**: Payment timeline and savings calculations

### Dashboard Features

- Real-time debt tracking with progress visualization
- Payment strategy comparison and optimization
- Due date reminders and payment scheduling
- Budget management and extra payment allocation
