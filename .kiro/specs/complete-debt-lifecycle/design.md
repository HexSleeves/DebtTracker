# Design Document

## Overview

The Complete Debt Lifecycle feature builds upon the existing debt tracking application to provide a comprehensive end-to-end debt management experience. This design leverages the current Next.js 15 + tRPC + Supabase architecture while extending functionality to support complete debt lifecycle tracking from creation through strategic repayment to final payoff completion.

The system will enhance the existing debt management capabilities with improved state management, milestone tracking, completion workflows, and intelligent recommendations to guide users through their entire debt elimination journey.

## Architecture

### High-Level Architecture

The system follows the existing layered architecture pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  Next.js App Router + React Server Components + Client     │
│  Components (Dashboard, Forms, Dialogs, Progress Views)    │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                             │
│           tRPC Routers + Procedures + Middleware           │
│    (Enhanced with lifecycle management endpoints)          │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                     │
│     Debt Algorithms + Lifecycle Management + Progress      │
│         Tracking + Milestone Detection + Analytics         │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                             │
│    Supabase PostgreSQL + Enhanced Schema + Row Level       │
│              Security + Audit Trail                        │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema Extensions

Building on the existing schema, we'll add new tables and enhance existing ones:

**Enhanced Debts Table:**

- Add `status` field: 'active' | 'paid_off' | 'archived'
- Add `paid_off_date` field for completion tracking
- Add `total_interest_paid` field for final calculations
- Add `total_payments_made` field for statistics

**New Debt Milestones Table:**

```sql
debt_milestones (
  id: uuid PRIMARY KEY,
  debt_id: uuid REFERENCES debts(id),
  milestone_type: text, -- 'created', 'first_payment', '25_percent_paid', '50_percent_paid', '75_percent_paid', 'paid_off'
  achieved_date: timestamp,
  milestone_value: numeric, -- balance at milestone
  created_at: timestamp
)
```

**Enhanced Payments Table:**

- Add `balance_after_payment` field for progress tracking
- Add `interest_portion` and `principal_portion` fields
- Add `payment_method` field for tracking payment sources

**New Payment Recommendations Table:**

```sql
payment_recommendations (
  id: uuid PRIMARY KEY,
  user_id: text,
  debt_id: uuid REFERENCES debts(id),
  recommendation_type: text, -- 'strategy_optimal', 'extra_payment', 'rate_change_alert'
  recommended_amount: numeric,
  reasoning: text,
  is_applied: boolean,
  created_at: timestamp,
  expires_at: timestamp
)
```

## Components and Interfaces

### Core Components

#### 1. Debt Lifecycle Manager

**Location:** `src/lib/debt-lifecycle/manager.ts`

```typescript
interface DebtLifecycleManager {
  createDebt(input: CreateDebtInput): Promise<DebtWithMilestones>;
  updateDebt(input: UpdateDebtInput): Promise<DebtWithMilestones>;
  recordPayment(input: RecordPaymentInput): Promise<PaymentResult>;
  checkMilestones(debtId: string): Promise<MilestoneResult[]>;
  markDebtPaidOff(debtId: string): Promise<DebtCompletionSummary>;
  generateRecommendations(userId: string): Promise<PaymentRecommendation[]>;
}
```

#### 2. Progress Tracking Service

**Location:** `src/lib/progress/tracker.ts`

```typescript
interface ProgressTracker {
  calculateProgress(debt: Debt, payments: Payment[]): DebtProgress;
  detectMilestones(debt: Debt, newPayment: Payment): Milestone[];
  generateProgressReport(userId: string): Promise<ProgressReport>;
  getPayoffProjections(debts: Debt[], strategy: Strategy): PayoffProjection[];
}
```

#### 3. Strategy Engine (Enhanced)

**Location:** `src/lib/algorithms/strategy-engine.ts`

```typescript
interface StrategyEngine {
  calculateOptimalPayments(
    debts: Debt[],
    budget: number,
    strategy: Strategy,
  ): PaymentPlan;
  compareStrategies(debts: Debt[], budget: number): StrategyComparison;
  adjustForRateChanges(
    debts: Debt[],
    rateChanges: RateChange[],
  ): StrategyAdjustment;
  generatePaymentSchedule(debts: Debt[], plan: PaymentPlan): PaymentSchedule;
}
```

### UI Components

#### 1. Debt Creation/Edit Flow

**Location:** `src/components/debt-lifecycle/`

- `DebtWizard.tsx` - Multi-step debt creation wizard
- `DebtEditDialog.tsx` - Enhanced edit dialog with lifecycle context
- `DebtValidation.tsx` - Real-time validation with smart suggestions

#### 2. Progress Visualization

**Location:** `src/components/progress/`

- `DebtProgressCard.tsx` - Individual debt progress with milestones
- `OverallProgressDashboard.tsx` - Portfolio-wide progress view
- `MilestoneTimeline.tsx` - Visual milestone achievement timeline
- `PayoffProjectionChart.tsx` - Interactive payoff projections

#### 3. Payment Management

**Location:** `src/components/payments/`

- `PaymentRecordingForm.tsx` - Enhanced payment entry with auto-calculations
- `PaymentHistoryTable.tsx` - Detailed payment history with analytics
- `PaymentRecommendations.tsx` - Smart payment suggestions

#### 4. Completion & Achievement

**Location:** `src/components/completion/`

- `DebtCompletionCelebration.tsx` - Payoff celebration component
- `CompletionSummary.tsx` - Detailed payoff statistics
- `AchievementBadges.tsx` - Milestone achievement display

## Data Models

### Enhanced Debt Model

```typescript
interface DebtWithLifecycle extends Debt {
  status: "active" | "paid_off" | "archived";
  paidOffDate?: Date;
  totalInterestPaid: number;
  totalPaymentsMade: number;
  milestones: Milestone[];
  progress: DebtProgress;
  nextRecommendation?: PaymentRecommendation;
}

interface DebtProgress {
  percentagePaid: number;
  remainingBalance: number;
  monthsRemaining: number;
  projectedPayoffDate: Date;
  totalInterestProjected: number;
  paymentVelocity: number; // payments per month average
}

interface Milestone {
  id: string;
  type: MilestoneType;
  achievedDate: Date;
  value: number;
  description: string;
}

type MilestoneType =
  | "created"
  | "first_payment"
  | "25_percent_paid"
  | "50_percent_paid"
  | "75_percent_paid"
  | "paid_off"
  | "custom";
```

### Payment Enhancement

```typescript
interface EnhancedPayment extends Payment {
  balanceAfterPayment: number;
  interestPortion: number;
  principalPortion: number;
  paymentMethod: string;
  milestonesTriggered: Milestone[];
  recommendationApplied?: string;
}
```

### Recommendation System

```typescript
interface PaymentRecommendation {
  id: string;
  userId: string;
  debtId?: string;
  type: RecommendationType;
  title: string;
  description: string;
  recommendedAmount: number;
  reasoning: string;
  priority: "low" | "medium" | "high";
  expiresAt: Date;
  isApplied: boolean;
}

type RecommendationType =
  | "strategy_optimal"
  | "extra_payment"
  | "rate_change_alert"
  | "milestone_opportunity"
  | "budget_optimization";
```

## Error Handling

### Debt Lifecycle Errors

```typescript
class DebtLifecycleError extends Error {
  constructor(
    message: string,
    public code: DebtLifecycleErrorCode,
    public context?: Record<string, unknown>,
  ) {
    super(message);
  }
}

enum DebtLifecycleErrorCode {
  DEBT_ALREADY_PAID_OFF = "DEBT_ALREADY_PAID_OFF",
  PAYMENT_EXCEEDS_BALANCE = "PAYMENT_EXCEEDS_BALANCE",
  INVALID_DEBT_STATUS = "INVALID_DEBT_STATUS",
  MILESTONE_ALREADY_ACHIEVED = "MILESTONE_ALREADY_ACHIEVED",
  STRATEGY_CALCULATION_FAILED = "STRATEGY_CALCULATION_FAILED",
  INSUFFICIENT_BUDGET = "INSUFFICIENT_BUDGET",
}
```

### Error Recovery Strategies

1. **Payment Validation Errors**: Provide real-time feedback with suggested corrections
2. **Strategy Calculation Failures**: Fall back to basic calculations and notify user
3. **Database Consistency Issues**: Implement transaction rollback with user notification
4. **Milestone Detection Failures**: Log errors but don't block payment processing

## Testing Strategy

### Unit Testing

**Algorithm Testing:**

- Test debt avalanche and snowball calculations with edge cases
- Test milestone detection logic with various payment scenarios
- Test recommendation engine with different debt portfolios

**Component Testing:**

- Test form validation and user input handling
- Test progress visualization with mock data
- Test completion workflows and celebration components

### Integration Testing

**API Testing:**

- Test complete debt lifecycle workflows through tRPC endpoints
- Test payment recording with milestone detection
- Test strategy switching with recalculations

**Database Testing:**

- Test data consistency during debt status transitions
- Test milestone recording and retrieval
- Test payment history integrity

### End-to-End Testing

**User Journey Testing:**

- Complete debt creation to payoff workflow
- Strategy comparison and switching
- Payment recording and progress tracking
- Milestone achievement and celebration

### Performance Testing

**Load Testing:**

- Test calculation performance with large debt portfolios
- Test database query performance with extensive payment histories
- Test real-time recommendation generation

**Memory Testing:**

- Test memory usage during complex strategy calculations
- Test component rendering performance with large datasets

## Implementation Phases

### Phase 1: Enhanced Debt Management

- Extend existing debt CRUD operations with lifecycle status
- Implement milestone detection and recording
- Add debt completion workflows

### Phase 2: Advanced Progress Tracking

- Build comprehensive progress visualization components
- Implement real-time progress calculations
- Add milestone achievement celebrations

### Phase 3: Intelligent Recommendations

- Develop recommendation engine
- Implement smart payment suggestions
- Add strategy optimization alerts

### Phase 4: Analytics and Insights

- Build comprehensive reporting dashboard
- Add historical analysis and trends
- Implement achievement and badge system

### Phase 5: Advanced Features

- Add goal setting and tracking
- Implement debt consolidation analysis
- Add export and sharing capabilities
