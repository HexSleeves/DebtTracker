# Migration Guide: tRPC & Supabase to Convex

This document outlines the high level steps required to replace the existing tRPC and Supabase based database layer with [Convex](https://convex.dev/).

## 1. Set Up Convex

1. Install the Convex CLI:
   ```bash
   npm install -g convex
   ```
2. Initialize Convex in the project root:
   ```bash
   convex dev
   ```
   This creates a `convex/` directory and a `.env.local` entry for the Convex deployment.

## 2. Port Database Logic

1. Identify all database operations implemented with Supabase (e.g., in `src/server/api/routers`).
2. Create corresponding Convex functions inside `convex/` for each operation.
3. Replace any direct SQL queries with Convex storage API calls.

## 3. Remove tRPC Layer

1. Delete the tRPC router definitions from `src/server/api`.
2. Replace tRPC API routes (e.g., `/api/trpc/*`) with Next.js API routes that invoke the new Convex functions.
3. Update frontend hooks (e.g., files importing from `~/trpc/react`) to call Convex via `useQuery` and `useMutation`.

## 4. Migrate Existing Data

1. Export data from Supabase.
2. Write a one‑time migration script that loads the export and populates Convex using the Convex client.

## 5. Clean Up

1. Remove Supabase configuration files and keys from `.env.local`.
2. Delete the `supabase/` directory and any Supabase specific utilities in `src/lib`.
3. Uninstall tRPC and Supabase packages from `package.json`.

After completing these steps, the application will use Convex for all data storage and queries, simplifying the backend and removing the dependency on Supabase and tRPC.
