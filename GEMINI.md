# Gemini Project Guide: Debt Tracker

This document provides a comprehensive guide for me, Gemini, to effectively assist with the development of the Debt Tracker application. It outlines the project's architecture, conventions, and key areas of focus.

## 1. Project Overview

The Debt Tracker is a web application designed to help users manage and eliminate their debt. It provides tools for tracking debts, visualizing progress, and implementing repayment strategies like the Debt Avalanche and Debt Snowball methods.

- **Target Audience:** Individuals who are feeling overwhelmed by debt and those who are financially savvy and want to optimize their repayment strategy.
- **Core Features:**
  - Debt tracking and management (CRUD operations for debts).
  - Payment strategy optimization (Avalanche, Snowball, custom plans).
  - Interactive dashboard with data visualizations.
  - User authentication and data security.

## 2. Tech Stack & Architecture

The application is a modern, full-stack, type-safe web application built with the following technologies:

- **Framework:** Next.js 15 (with App Router, PPR, and React Compiler)
- **UI:** shadcn/ui, Tailwind CSS, and Recharts for data visualization.
- **API Layer:** tRPC for type-safe client-server communication.
- **Authentication:** Clerk for user management and authentication.
- **Database:** Supabase (PostgreSQL) for the database, with schema migrations managed in the `supabase/migrations` directory.
- **Form Management:** React Hook Form with Zod for validation.
- **Styling:** Tailwind CSS with `tailwind-merge` and `clsx`.
- **Linting & Formatting:** Biome and Prettier.

## 3. Development Workflow

### Setup

1. Create a `.env.local` file with the necessary environment variables (see `.env.example`).
2. Install dependencies: `bun install`
3. Run the development server: `bun dev`

### Scripts

- `bun dev`: Starts the development server with Turbo.
- `bun build`: Creates a production build.
- `bun start`: Starts the production server.
- `bun check`: Runs Biome linter.
- `bun typecheck`: Runs TypeScript compiler to check for type errors.
- `bun format:write`: Formats the code with Prettier.
- `bun lint`: Runs Next.js linter.

## 4. Code Style & Conventions

- **Code Style:** Enforced by Biome and Prettier. Adhere to the rules in `biome.jsonc` and `prettier.config.js`.
- **File Naming:** Use kebab-case for files and folders.
- **Component Structure:** Components are organized in `src/components`. Reusable UI components are in `src/components/ui`.
- **Types:** Shared types are located in `src/types`.
- **API:** tRPC routers are in `src/server/api/routers`.
- **Database Schema:** The database schema is defined in `supabase/migrations`.

## 5. Database Schema

The database consists of the following main tables:

- `users`: Stores user information, linked to Clerk users.
- `debts`: Contains details about each debt, such as balance, interest rate, and minimum payment.
- `payments`: Logs payments made towards debts.
- `payment_plans`: Stores user-defined payment strategies.

## 6. API & Data Flow

- The frontend communicates with the backend via tRPC.
- tRPC procedures are defined in `src/server/api/routers`.
- These procedures interact with the Supabase database to perform CRUD operations.
- Clerk is used for authentication and to protect tRPC procedures.

## 7. Key Files & Folders

- `src/app`: The main application code, following the Next.js App Router structure.
- `src/components`: Reusable React components.
- `src/lib`: Utility functions, hooks, and Supabase client.
- `src/server/api`: tRPC API implementation.
- `supabase/migrations`: Database schema migrations.
- `docs`: Project documentation, including the PRD and development task list.

## 8. Future Improvements & Tasks

Based on the `DEVELOPMENT_TASKLIST.md` and `NEXTJS_IMPROVEMENTS.md` files, the following are the key areas for future development:

- **Architecture & Code Quality:**
  - Enhance tRPC error handling.
  - Refactor algorithms into reusable hooks.
  - Complete form implementations with React Hook Form and Zod.
- **Security & Testing:**
  - Enforce HTTPS.
  - Increase test coverage with Jest and add E2E tests.
  - Set up CI/CD with GitHub Actions.
- **Advanced Features:**
  - Integrate Plaid for bank account syncing.
  - Implement user analytics.
- **New Features:**
  - Implement payment logging system.
  - Build the debt list view with sorting.
  - Create the main dashboard layout.
  - Implement the Debt Avalanche and Snowball algorithms.
