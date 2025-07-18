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
	createdAt: Date;
	updatedAt: Date;
}

export interface Payment {
	id: string;
	debtId: string;
	amount: number;
	paymentDate: Date;
	type: string;
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
}

export interface CreatePaymentInput {
	debtId: string;
	amount: number;
	paymentDate: Date;
	type: "minimum" | "extra" | "full";
}

export interface UpdatePaymentInput {
	id: string;
	amount?: number;
	paymentDate?: Date;
	type?: "minimum" | "extra" | "full";
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
