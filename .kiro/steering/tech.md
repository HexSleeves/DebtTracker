# Technology Stack & Build System

## Core Framework & Runtime

- **Next.js 15** with App Router, Partial Prerendering (PPR), and React Compiler
- **React 19** with modern features and optimizations
- **TypeScript** with strict configuration and path aliases (`~/` for src)
- **Bun** as package manager and runtime

## Backend & API

- **tRPC** for type-safe client-server communication with SuperJSON transformer
- **Supabase** (PostgreSQL) for database with Row Level Security
- **Clerk** for authentication and user management
- Server-side rendering with React Server Components

## Frontend & UI

- **Tailwind CSS** for styling with custom design system
- **shadcn/ui** component library built on Radix UI primitives
- **Framer Motion** for animations
- **Recharts** for data visualization
- **React Hook Form** with Zod validation
- **TanStack Table** for data tables
- **TanStack Query** for client-side data fetching

## Development Tools

- **Biome** for linting and formatting (primary)
- **Prettier** for additional formatting
- **ESLint** with Next.js configuration
- **Lefthook** for git hooks
- **Jest** for testing

## Environment & Configuration

- Environment variables validated with `@t3-oss/env-nextjs` and Zod
- Type-safe environment configuration in `src/env.js`
- Bundle analysis with `@next/bundle-analyzer`

## Common Commands

```bash
# Development
bun dev              # Start development server with Turbopack
bun dev:profile      # Start with performance monitoring

# Building
bun build            # Production build
bun build:analyze    # Build with bundle analysis
bun preview          # Build and start production server

# Code Quality
bun check            # Run Biome checks
bun check:write      # Run Biome with auto-fix
bun typecheck        # TypeScript type checking
bun lint             # ESLint
bun format:check     # Prettier check
bun format:write     # Prettier format

# Performance
bun lighthouse       # Run Lighthouse audit
```

## Architecture Patterns

- Server Components for data fetching
- Client Components for interactivity
- tRPC procedures with middleware for logging, timing, and error handling
- Protected routes with Clerk authentication
- Database operations through Supabase client with proper error handling
