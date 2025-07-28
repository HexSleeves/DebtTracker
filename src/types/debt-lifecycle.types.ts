import type {
	Debt,
	DebtMilestone,
	Payment,
	PaymentRecommendation,
} from "./db.helpers";

// Use the transformed types from db.helpers instead of raw database types
export type {
	Debt,
	DebtMilestone,
	Payment,
	PaymentRecommendation,
} from "./db.helpers";

// Alias for consistency with design document
export type Milestone = DebtMilestone;

// Debt status enum
export type DebtStatus = "active" | "paid_off" | "archived";

// Milestone type enum
export type MilestoneType =
	| "created"
	| "first_payment"
	| "25_percent_paid"
	| "50_percent_paid"
	| "75_percent_paid"
	| "paid_off"
	| "custom";

// Recommendation type enum
export type RecommendationType =
	| "strategy_optimal"
	| "extra_payment"
	| "rate_change_alert"
	| "milestone_opportunity"
	| "budget_optimization";

// Priority enum
export type Priority = "low" | "medium" | "high";

// Payment method enum
export type PaymentMethod = "manual" | "automatic" | "recommended";

// Enhanced debt with lifecycle information
export interface DebtWithLifecycle extends Debt {
	milestones: Milestone[];
	progress: DebtProgress;
	nextRecommendation?: PaymentRecommendation;
}

// Debt progress information
export interface DebtProgress {
	percentagePaid: number;
	remainingBalance: number;
	monthsRemaining: number;
	projectedPayoffDate: Date;
	totalInterestProjected: number;
	paymentVelocity: number; // payments per month average
}

// Enhanced payment with milestone information
export interface EnhancedPayment extends Payment {
	milestonesTriggered?: Milestone[];
	recommendationApplied?: string;
}

// Payment breakdown result
export interface PaymentBreakdown {
	interestPortion: number;
	principalPortion: number;
}

// Payment processing result
export interface PaymentResult {
	payment: EnhancedPayment;
	newBalance: number;
	milestonesTriggered: number;
	breakdown: PaymentBreakdown;
}

// Debt completion summary
export interface DebtCompletionSummary {
	debt: Debt;
	totalInterestPaid: number;
	totalPaymentsMade: number;
	timeToPayoff: number; // in months
	payoffDate: Date;
	milestones: Milestone[];
}

// Progress report for user's entire debt portfolio
export interface ProgressReport {
	totalDebts: number;
	activeDebts: number;
	paidOffDebts: number;
	totalBalance: number;
	totalOriginalBalance: number;
	overallProgress: number;
	projectedDebtFreeDate: Date;
	totalInterestProjected: number;
	recentMilestones: Milestone[];
}

// Strategy comparison data
export interface StrategyComparison {
	avalanche: StrategyProjection;
	snowball: StrategyProjection;
	current: StrategyProjection;
}

// Strategy projection
export interface StrategyProjection {
	strategy: string;
	payoffDate: Date;
	totalInterest: number;
	monthlyPayments: PaymentAllocation[];
	milestoneProjections: MilestoneProjection[];
}

// Payment allocation for strategy
export interface PaymentAllocation {
	debtId: string;
	debtName: string;
	amount: number;
	isMinimum: boolean;
}

// Milestone projection
export interface MilestoneProjection {
	debtId: string;
	milestoneType: MilestoneType;
	projectedDate: Date;
	projectedBalance: number;
}

// Database function result types
export interface DebtProgressResult {
	debt_id: string;
	progress_percentage: number;
}

export interface PaymentBreakdownResult {
	interest_portion: number;
	principal_portion: number;
}

export interface PaymentProcessingResult {
	new_balance: number;
	milestones_triggered: number;
}
