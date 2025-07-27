# Design Document

## Overview

This document outlines the design for migrating the Debt Tracker application from a tRPC + Supabase architecture to a Convex-based architecture. The migration will replace the existing three-layer architecture (Frontend → tRPC → Supabase) with a simplified two-layer architecture (Frontend → Convex), while maintaining all existing functionality and improving developer experience through better type safety and real-time capabilities.

## Architecture

### Current Architecture

```
Frontend (React + tRPC hooks) → tRPC API Layer → Supabase Database
```

### Target Architecture

```
Frontend (React + Convex hooks) → Convex Backend (Functions + Database)
```

### Key Changes

- **API Layer**: Replace tRPC routers with Convex functions
- **Database**: Replace Supabase with Convex's built-in database
- **Frontend Integration**: Replace tRPC React hooks with Convex React hooks
- **Authentication**: Integrate Clerk directly with Convex
- **Real-time Updates**: Leverage Convex's reactive queries for automatic UI updates

## Components and Interfaces

### 1. Database Schema (Convex)

The Convex schema will be extended to include all existing data models:

```typescript
// convex/schema.ts
export default defineSchema({
  debts: defineTable({
    clerk_user_id: v.string(),
    name: v.string(),
    type: v.string(),
    balance: v.number(),
    original_balance: v.number(),
    interest_rate: v.number(),
    minimum_payment: v.number(),
    due_date: v.optional(v.string()),
    created_at: v.optional(v.string()),
  }).index("by_user", ["clerk_user_id"]),

  payments: defineTable({
    clerk_user_id: v.string(),
    debt_id: v.id("debts"),
    amount: v.number(),
    payment_date: v.string(),
    notes: v.optional(v.string()),
    created_at: v.optional(v.string()),
  })
    .index("by_user", ["clerk_user_id"])
    .index("by_debt", ["debt_id"]),

  payment_plans: defineTable({
    clerk_user_id: v.string(),
    name: v.string(),
    strategy_type: v.string(), // "avalanche" | "snowball" | "custom"
    monthly_budget: v.number(),
    extra_payment: v.number(),
    is_active: v.boolean(),
    created_at: v.optional(v.string()),
  })
    .index("by_user", ["clerk_user_id"])
    .index("by_active", ["clerk_user_id", "is_active"]),
});
```

### 2. Convex Functions

#### Debt Functions (`convex/debt.ts`)

- `list(userId)` - Get all debts for user
- `getById(id, userId)` - Get specific debt
- `create(debtData)` - Create new debt
- `update(id, updateData, userId)` - Update existing debt
- `remove(id, userId)` - Delete debt
- `getStats(userId)` - Calculate debt statistics

#### Payment Functions (`convex/payment.ts`)

- `list(userId)` - Get all payments for user
- `listByDebtId(debtId, userId)` - Get payments for specific debt
- `create(paymentData)` - Create payment and update debt balance
- `update(id, updateData, userId)` - Update payment and adjust balances
- `remove(id, userId)` - Delete payment and restore debt balance

#### Payment Plan Functions (`convex/paymentPlan.ts`)

- `list(userId)` - Get all payment plans
- `getById(id, userId)` - Get specific payment plan
- `getActive(userId)` - Get active payment plan
- `create(planData)` - Create new payment plan
- `update(id, updateData, userId)` - Update payment plan
- `remove(id, userId)` - Delete payment plan
- `activate(id, userId)` - Activate plan (deactivate others)
- `calculateStrategies(userId, budget)` - Calculate debt strategies
- `calculateMetrics(planId, userId)` - Calculate plan metrics
- `calculateBudgetImpact(planId, newBudget, userId)` - Calculate budget impact

### 3. Authentication Integration

Convex will be configured to integrate with Clerk authentication:

```typescript
// convex/auth.config.js
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
```

### 4. Frontend Hook Migration

Current tRPC hooks will be replaced with Convex hooks:

```typescript
// Before (tRPC)
const { data: debts } = api.debt.getAll.useQuery();
const createDebt = api.debt.create.useMutation();

// After (Convex)
const debts = useQuery(api.debt.list, { userId });
const createDebt = useMutation(api.debt.create);
```

### 5. Type Safety

Convex provides automatic type generation for functions, ensuring type safety between frontend and backend:

```typescript
// Generated types will be available at convex/_generated/api
import { api } from "../convex/_generated/api";
```

## Data Models

### Debt Model

```typescript
interface Debt {
  _id: Id<"debts">;
  clerk_user_id: string;
  name: string;
  type: string;
  balance: number;
  original_balance: number;
  interest_rate: number;
  minimum_payment: number;
  due_date?: string;
  created_at?: string;
}
```

### Payment Model

```typescript
interface Payment {
  _id: Id<"payments">;
  clerk_user_id: string;
  debt_id: Id<"debts">;
  amount: number;
  payment_date: string;
  notes?: string;
  created_at?: string;
}
```

### Payment Plan Model

```typescript
interface PaymentPlan {
  _id: Id<"payment_plans">;
  clerk_user_id: string;
  name: string;
  strategy_type: "avalanche" | "snowball" | "custom";
  monthly_budget: number;
  extra_payment: number;
  is_active: boolean;
  created_at?: string;
}
```

## Error Handling

### Convex Function Error Handling

- Use `ConvexError` for user-facing errors
- Implement proper validation using Convex's built-in validators
- Handle authentication errors through Clerk integration
- Provide meaningful error messages for frontend consumption

### Frontend Error Handling

- Convex hooks provide built-in error states
- Implement error boundaries for graceful error handling
- Show user-friendly error messages
- Implement retry mechanisms where appropriate

## Testing Strategy

### Unit Testing

- Test individual Convex functions with mock data
- Test frontend components with mocked Convex hooks
- Test data transformation and validation logic

### Integration Testing

- Test complete user flows (create debt → make payment → view statistics)
- Test authentication integration
- Test real-time updates and reactivity

### Migration Testing

- Test data migration script with sample data
- Verify data integrity after migration
- Test rollback procedures

### Performance Testing

- Test query performance with large datasets
- Test real-time update performance
- Monitor bundle size changes

## Migration Strategy

### Phase 1: Setup and Schema

1. Configure Convex with Clerk authentication
2. Extend Convex schema with all required tables
3. Set up development environment

### Phase 2: Backend Migration

1. Implement all Convex functions
2. Test functions individually
3. Implement error handling and validation

### Phase 3: Frontend Migration

1. Update components to use Convex hooks
2. Replace tRPC utilities with Convex equivalents
3. Test UI functionality

### Phase 4: Data Migration

1. Export data from Supabase
2. Create and run migration script
3. Verify data integrity

### Phase 5: Cleanup

1. Remove tRPC dependencies and code
2. Remove Supabase dependencies and code
3. Update documentation and configuration

## Real-time Capabilities

Convex provides built-in reactivity, enabling:

- Automatic UI updates when data changes
- Real-time collaboration features (future enhancement)
- Optimistic updates with automatic rollback on errors
- Efficient subscription management

## Performance Considerations

### Query Optimization

- Use appropriate indexes for common query patterns
- Implement pagination for large datasets
- Cache frequently accessed data

### Bundle Size

- Convex client is lightweight compared to tRPC + Supabase
- Remove unused dependencies during cleanup
- Monitor bundle size impact

### Network Efficiency

- Convex uses WebSocket connections for real-time updates
- Automatic query deduplication and caching
- Efficient subscription management
