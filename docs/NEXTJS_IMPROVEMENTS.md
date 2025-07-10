# Next.js 15 Improvement Recommendations

This document captures feedback from a senior Next.js 15 developer on enhancing the debt management app. Recommendations are categorized by area, with priorities and actionable steps tied to the project's stack (Next.js 15, tRPC, Tailwind, shadcn/ui, Supabase, Clerk) and PRD requirements.

## 1. Styling & UI/UX Improvements (High Priority)

- **Adopt a Design System**: Enforce consistency by creating a custom theme in `styles/globals.css` using CSS variables (e.g., `--primary: hsl(210, 40%, 98%)` for light/dark modes). Use Next.js 15's built-in dark mode detection via `useTheme` from `next-themes`. Ensure `src/components/theme-provider.tsx` handles system preferences.
- **Responsive & Accessible Design**: Ensure mobile-first with Tailwind's responsive utilities (e.g., `sm:`, `md:`). Add ARIA attributes to components (e.g., in `ui/calendar.tsx`, use `aria-label` for dates). Run Lighthouse audits for WCAG compliance, aiming for 100% accessibility score.
- **Animations & Polish**: Integrate `framer-motion` for subtle transitions (e.g., debt progress charts). For educational content (UX-05), use shadcn's `Accordion` for collapsible tips.
- **Action**: Audit untracked UI files (e.g., `calendar.tsx`, `dialog.tsx`) and stage them. Add a Figma prototype for user flows.

## 2. Performance Optimizations (High Priority)

- **Leverage Next.js 15 Features**: Use Partial Prerendering (PPR) in dynamic routes (e.g., dashboard) to pre-render static shells while streaming dynamic content. Enable React Compiler for automatic memoization. In `next.config.js`, add `experimental: { ppr: true }`.
- **API & Data Fetching**: Wrap tRPC queries in Suspense boundaries for streaming (e.g., in `trpc/react.tsx`). Use Supabase's real-time subscriptions for live debt updates. Cache frequent queries with React Query's `staleTime` (e.g., debt lists).
- **Bundle & Load Time**: Optimize images with `next/image` (AVIF/WebP). Enable compression and tree-shaking in Bun. Aim for <100KB initial bundle—split routes with dynamic imports.
- **Action**: Profile with Vercel Analytics or Sentry. Add loading skeletons in dashboard components (e.g., `dashboard-overview.tsx`) using shadcn's `Skeleton`.

## 3. Architecture & Code Quality (Medium-High Priority)

- **tRPC Enhancements**: Add error boundaries and global error handling in `trpc.ts`. Use tRPC's `batch` for concurrent queries (e.g., fetch debts + plans in one call).
- **Supabase/Clerk Integration**: Stick to Clerk for user management and Supabase for data. Enable RLS in all migrations. Use Clerk's webhooks for user sync.
- **Modularity**: Refactor algorithms into hooks (e.g., `useDebtStrategy`) for reuse. Move shared types to `types/index.ts`.
- **Action**: Complete unchecked tasks like forms (use React Hook Form + Zod for validation in `debt-form.tsx`). Add API docs with tRPC OpenAPI.

## 4. Security & Testing (High Priority)

- **Security**: Enforce HTTPS in `next.config.js`. Use Clerk's session tokens for protected procedures. Audit for OWASP top 10 (e.g., input sanitization in forms).
- **Testing**: Aim for 80% coverage with Jest. Add E2E tests for flows (e.g., add debt → calculate plan). Use MSW for API mocking.
- **Action**: Set up CI with GitHub Actions (lint, test, deploy). Implement data backups via Supabase's pg_dump.

## 5. Other Enhancements (Medium Priority)

- **Bank Integration**: Prioritize Plaid for auto-updates (T-04)—start with sandbox mode.
- **Analytics**: Add PostHog or Mixpanel for engagement tracking.
- **Deployment**: Use Vercel for seamless Next.js hosting with auto-scaling.
- **General**: Update tasklist regularly. Consider PWAs for offline access.

These improvements will enhance robustness, user-friendliness, and performance, aligning with PRD metrics like <500ms responses and user satisfaction.
