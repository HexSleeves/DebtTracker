# Debt Tracker

## Overview

This is a debt tracker app that allows you to track your debts and payments.

## Features

- Track your debts and payments
- Get a summary of your debts
- Get a summary of your payments
- User authentication with Clerk
- Debt management dashboard

## Setup

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Clerk Authentication (Required)
# Get these from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here

# Optional: Clerk Redirect URLs (defaults work if not set)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase (Required)
# Get these from your Supabase project dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### Installation

1. Install dependencies:

   ```bash
   bun install
   ```

2. Set up your environment variables (see above)

3. Run the development server:

   ```bash
   bun dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Authentication

The app uses Clerk for authentication. Users can:

- Sign up at `/sign-up`
- Sign in at `/sign-in`
- Access the dashboard at `/dashboard` (protected route)
