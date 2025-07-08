# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `bun dev` - Start development server with turbo mode
- `bun run build` - Build production application
- `bun run preview` - Build and run production preview
- `bun run typecheck` - Run TypeScript type checking
- `bun run check` - Run Biome linting and formatting checks
- `bun run check:write` - Run Biome checks and fix auto-fixable issues
- `bun run check:unsafe` - Run Biome checks with unsafe fixes

## Architecture Overview

This is a T3 Stack application built with:
- **Next.js 15** (App Router) - React framework with SSR/SSG
- **tRPC** - End-to-end typesafe APIs
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type safety
- **Biome** - Linting and formatting
- **Bun** - Package manager and runtime
- **shadcn/ui** - Component library with Radix UI primitives

### Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── _components/     # Shared components
│   ├── api/trpc/        # tRPC API endpoint
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # shadcn/ui components
│   └── ui/             # Reusable UI components
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
- **Context**: Minimal context with headers in `src/server/api/trpc.ts`
- **Middleware**: Built-in timing middleware with artificial dev delay
- **Error Handling**: Zod validation errors are formatted and passed to client
- **Transformer**: SuperJSON for serialization of complex types

### Client Setup
- **Provider**: `TRPCReactProvider` wraps app with React Query
- **Singleton Pattern**: Query client uses singleton in browser, new instance on server
- **Logging**: Enabled in development and for errors
- **Batch Streaming**: Uses `httpBatchStreamLink` for efficient requests

### Adding New API Routes
1. Create router in `src/server/api/routers/`
2. Export procedures using `publicProcedure`
3. Add router to `appRouter` in `src/server/api/root.ts`
4. Types are automatically inferred via `RouterInputs` and `RouterOutputs`

## Environment Variables

Environment validation is handled by `@t3-oss/env-nextjs` in `src/env.js`:
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

## Development Notes

- Uses Turbo mode for faster development builds
- Artificial delay in tRPC procedures during development to simulate network latency
- All tRPC procedures are logged with execution timing
- Git VCS integration enabled in Biome configuration
- `tw-animate-css` available for advanced animations