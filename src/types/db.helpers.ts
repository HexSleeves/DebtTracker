import type { Database } from "./database.types";

// Database table type aliases for easier usage
export type DbTables = Database["public"]["Tables"];

// Debt types
export type DebtRow = DbTables["debts"]["Row"];
export type DebtInsert = DbTables["debts"]["Insert"];
export type DebtUpdate = DbTables["debts"]["Update"];

// Payment types
export type PaymentRow = DbTables["payments"]["Row"];
export type PaymentInsert = DbTables["payments"]["Insert"];
export type PaymentUpdate = DbTables["payments"]["Update"];

// Payment Plan types
export type PaymentPlanRow = DbTables["payment_plans"]["Row"];
export type PaymentPlanInsert = DbTables["payment_plans"]["Insert"];
export type PaymentPlanUpdate = DbTables["payment_plans"]["Update"];

// Debt Milestone types
export type DebtMilestoneRow = DbTables["debt_milestones"]["Row"];
export type DebtMilestoneInsert = DbTables["debt_milestones"]["Insert"];
export type DebtMilestoneUpdate = DbTables["debt_milestones"]["Update"];

// Payment Recommendation types
export type PaymentRecommendationRow =
	DbTables["payment_recommendations"]["Row"];
export type PaymentRecommendationInsert =
	DbTables["payment_recommendations"]["Insert"];
export type PaymentRecommendationUpdate =
	DbTables["payment_recommendations"]["Update"];

// User types are no longer needed - using Clerk directly

// Application-friendly type transformations
// These transform database types (snake_case, string dates) to application types (camelCase, Date objects)

export interface Debt {
	id: string;
	userId: string;
	name: string;
	type: string;
	balance: number;
	originalBalance: number;
	interestRate: number;
	minimumPayment: number;
	dueDate: Date | null;
	status: "active" | "paid_off" | "archived";
	paidOffDate: Date | null;
	totalInterestPaid: number;
	totalPaymentsMade: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface Payment {
	id: string;
	debtId: string;
	amount: number;
	paymentDate: Date;
	type: string;
	balanceAfterPayment: number | null;
	interestPortion: number;
	principalPortion: number;
	paymentMethod: string;
	notes: string | null;
	createdAt: Date;
}

export interface PaymentPlan {
	id: string;
	userId: string;
	name: string;
	strategy: string;
	monthlyBudget: number;
	extraPayment: number;
	targetDate: Date | null;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface DebtMilestone {
	id: string;
	debtId: string;
	milestoneType:
		| "created"
		| "first_payment"
		| "25_percent_paid"
		| "50_percent_paid"
		| "75_percent_paid"
		| "paid_off"
		| "custom";
	achievedDate: Date;
	milestoneValue: number;
	description: string | null;
	createdAt: Date;
}

export interface PaymentRecommendation {
	id: string;
	userId: string;
	debtId: string | null;
	recommendationType:
		| "strategy_optimal"
		| "extra_payment"
		| "rate_change_alert"
		| "milestone_opportunity"
		| "budget_optimization";
	title: string;
	description: string;
	recommendedAmount: number;
	reasoning: string;
	priority: "low" | "medium" | "high";
	isApplied: boolean;
	createdAt: Date;
	expiresAt: Date | null;
}

// User interface no longer needed - using Clerk directly

// Transformation utilities
export function transformDebtFromDb(dbDebt: DebtRow): Debt {
	return {
		id: dbDebt.id,
		userId: dbDebt.clerk_user_id,
		name: dbDebt.name,
		type: dbDebt.type,
		balance: Number(dbDebt.balance),
		originalBalance: Number(dbDebt.original_balance),
		interestRate: Number(dbDebt.interest_rate),
		minimumPayment: Number(dbDebt.minimum_payment),
		dueDate: dbDebt.due_date ? new Date(dbDebt.due_date) : null,
		status: dbDebt.status as "active" | "paid_off" | "archived",
		paidOffDate: dbDebt.paid_off_date ? new Date(dbDebt.paid_off_date) : null,
		totalInterestPaid: Number(dbDebt.total_interest_paid),
		totalPaymentsMade: dbDebt.total_payments_made,
		createdAt: new Date(dbDebt.created_at ?? new Date().toISOString()),
		updatedAt: new Date(dbDebt.updated_at ?? new Date().toISOString()),
	};
}

export function transformPaymentFromDb(dbPayment: PaymentRow): Payment {
	return {
		id: dbPayment.id,
		debtId: dbPayment.debt_id,
		amount: Number(dbPayment.amount),
		paymentDate: new Date(dbPayment.payment_date),
		type: dbPayment.type,
		balanceAfterPayment: dbPayment.balance_after_payment
			? Number(dbPayment.balance_after_payment)
			: null,
		interestPortion: Number(dbPayment.interest_portion),
		principalPortion: Number(dbPayment.principal_portion),
		paymentMethod: dbPayment.payment_method,
		notes: dbPayment.notes,
		createdAt: new Date(dbPayment.created_at ?? new Date().toISOString()),
	};
}

export function transformPaymentPlanFromDb(
	dbPlan: PaymentPlanRow,
): PaymentPlan {
	return {
		id: dbPlan.id,
		userId: dbPlan.clerk_user_id,
		name: dbPlan.name,
		strategy: dbPlan.strategy,
		monthlyBudget: Number(dbPlan.monthly_budget),
		extraPayment: Number(dbPlan.extra_payment),
		targetDate: dbPlan.target_date ? new Date(dbPlan.target_date) : null,
		isActive: dbPlan.is_active ?? false,
		createdAt: new Date(dbPlan.created_at ?? new Date().toISOString()),
		updatedAt: new Date(dbPlan.updated_at ?? new Date().toISOString()),
	};
}

export function transformDebtMilestoneFromDb(
	dbMilestone: DebtMilestoneRow,
): DebtMilestone {
	return {
		id: dbMilestone.id,
		debtId: dbMilestone.debt_id,
		milestoneType: dbMilestone.milestone_type as DebtMilestone["milestoneType"],
		achievedDate: new Date(dbMilestone.achieved_date),
		milestoneValue: Number(dbMilestone.milestone_value),
		description: dbMilestone.description,
		createdAt: new Date(dbMilestone.created_at),
	};
}

export function transformPaymentRecommendationFromDb(
	dbRecommendation: PaymentRecommendationRow,
): PaymentRecommendation {
	return {
		id: dbRecommendation.id,
		userId: dbRecommendation.clerk_user_id,
		debtId: dbRecommendation.debt_id,
		recommendationType:
			dbRecommendation.recommendation_type as PaymentRecommendation["recommendationType"],
		title: dbRecommendation.title,
		description: dbRecommendation.description,
		recommendedAmount: Number(dbRecommendation.recommended_amount),
		reasoning: dbRecommendation.reasoning,
		priority: dbRecommendation.priority as PaymentRecommendation["priority"],
		isApplied: dbRecommendation.is_applied,
		createdAt: new Date(dbRecommendation.created_at),
		expiresAt: dbRecommendation.expires_at
			? new Date(dbRecommendation.expires_at)
			: null,
	};
}

// User transformation no longer needed - using Clerk directly

// Input types for API operations
export interface CreateDebtInput {
	name: string;
	type: "credit_card" | "loan" | "mortgage" | "other";
	balance: number;
	originalBalance?: number; // Optional - defaults to balance if not provided
	interestRate: number;
	minimumPayment: number;
	dueDate?: Date;
	status?: "active" | "paid_off" | "archived";
}

export interface UpdateDebtInput {
	id: string;
	name?: string;
	type?: "credit_card" | "loan" | "mortgage" | "other";
	balance?: number;
	originalBalance?: number;
	interestRate?: number;
	minimumPayment?: number;
	dueDate?: Date | null;
	status?: "active" | "paid_off" | "archived";
	paidOffDate?: Date | null;
	totalInterestPaid?: number;
	totalPaymentsMade?: number;
}

export interface CreatePaymentInput {
	debtId: string;
	amount: number;
	paymentDate: Date;
	type: "minimum" | "extra" | "full";
	balanceAfterPayment?: number;
	interestPortion?: number;
	principalPortion?: number;
	paymentMethod?: "manual" | "automatic" | "recommended";
	notes?: string;
}

export interface UpdatePaymentInput {
	id: string;
	amount?: number;
	paymentDate?: Date;
	type?: "minimum" | "extra" | "full";
	balanceAfterPayment?: number;
	interestPortion?: number;
	principalPortion?: number;
	paymentMethod?: "manual" | "automatic" | "recommended";
	notes?: string;
}

export interface CreatePaymentPlanInput {
	name: string;
	strategy: "avalanche" | "snowball" | "custom";
	monthlyBudget: number;
	extraPayment: number;
	targetDate?: Date;
	isActive?: boolean;
}

export interface UpdatePaymentPlanInput {
	id: string;
	name?: string;
	strategy?: "avalanche" | "snowball" | "custom";
	monthlyBudget?: number;
	extraPayment?: number;
	targetDate?: Date | null;
	isActive?: boolean;
}

export interface CreateDebtMilestoneInput {
	debtId: string;
	milestoneType:
		| "created"
		| "first_payment"
		| "25_percent_paid"
		| "50_percent_paid"
		| "75_percent_paid"
		| "paid_off"
		| "custom";
	achievedDate?: Date;
	milestoneValue: number;
	description?: string;
}

export interface UpdateDebtMilestoneInput {
	id: string;
	milestoneType?:
		| "created"
		| "first_payment"
		| "25_percent_paid"
		| "50_percent_paid"
		| "75_percent_paid"
		| "paid_off"
		| "custom";
	achievedDate?: Date;
	milestoneValue?: number;
	description?: string;
}

export interface CreatePaymentRecommendationInput {
	userId: string;
	debtId?: string;
	recommendationType:
		| "strategy_optimal"
		| "extra_payment"
		| "rate_change_alert"
		| "milestone_opportunity"
		| "budget_optimization";
	title: string;
	description: string;
	recommendedAmount: number;
	reasoning: string;
	priority?: "low" | "medium" | "high";
	expiresAt?: Date;
}

export interface UpdatePaymentRecommendationInput {
	id: string;
	recommendationType?:
		| "strategy_optimal"
		| "extra_payment"
		| "rate_change_alert"
		| "milestone_opportunity"
		| "budget_optimization";
	title?: string;
	description?: string;
	recommendedAmount?: number;
	reasoning?: string;
	priority?: "low" | "medium" | "high";
	isApplied?: boolean;
	expiresAt?: Date | null;
}

export interface CreateUserInput {
	clerkUserId: string;
	email: string;
}

// Debt statistics type
export interface TDebtStats {
	totalDebt: number;
	totalAccounts: number;
	paidCount: number;
	overdueCount: number;
	highInterestCount: number;
	totalPaid: number;
	totalOverdue: number;
	totalHighInterest: number;
}
