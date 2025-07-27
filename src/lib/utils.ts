import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Debt } from "~/types/db.helpers";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatPercentage(value: number): string {
	return `${value.toFixed(2)}%`;
}

/**
 * Debt status utilities for enhanced theming
 */
export const DebtStatus = {
	OVERDUE: "overdue",
	HIGH_INTEREST: "high_interest",
	IN_PAYMENT: "in-payment",
	PAID: "paid",
} as const;
export type DebtStatusType = (typeof DebtStatus)[keyof typeof DebtStatus];

export function getDebtStatus(debt: Debt): DebtStatusType {
	// Check if debt is paid off
	if (debt.balance <= 0) {
		return DebtStatus.PAID;
	}

	// Check if debt is overdue (due date is in the past)
	if (debt.dueDate && debt.dueDate < new Date()) {
		return DebtStatus.OVERDUE;
	}

	// Check if debt has high interest rate (>= 15%)
	if (debt.interestRate >= 15) {
		return DebtStatus.HIGH_INTEREST;
	}

	// Default to current
	return DebtStatus.IN_PAYMENT;
}

export function getDebtStatusColor(status: DebtStatusType): string {
	switch (status) {
		case DebtStatus.OVERDUE:
			return "debt-overdue";
		case DebtStatus.HIGH_INTEREST:
			return "debt-warning";
		case DebtStatus.PAID:
			return "debt-paid";
		default:
			return "debt-current";
	}
}

export function getDebtStatusLabel(status: DebtStatusType): string {
	switch (status) {
		case DebtStatus.OVERDUE:
			return "Overdue";
		case DebtStatus.HIGH_INTEREST:
			return "High Interest";
		case DebtStatus.PAID:
			return "Paid Off";
		default:
			return "In Payment";
	}
}

export function getDebtRowColor(debt: Debt): string {
	const status = getDebtStatus(debt);
	switch (status) {
		case DebtStatus.OVERDUE:
			return "border-l-error border-l-4 bg-error-50/30";
		case DebtStatus.HIGH_INTEREST:
			return "border-l-warning border-l-4 bg-warning-50/30";
		case DebtStatus.PAID:
			return "border-l-success border-l-4 bg-success-50/30";
		default:
			return "border-l-info border-l-4 bg-info-50/20";
	}
}

export function getInterestRateColor(interestRate: number): string {
	if (interestRate >= 20) {
		return "text-error font-semibold";
	}
	if (interestRate >= 15) {
		return "text-warning font-semibold";
	}
	if (interestRate >= 10) {
		return "text-warning";
	}
	return "text-success";
}

export function getBalanceColor(balance: number): string {
	if (balance <= 0) {
		return "text-success font-semibold";
	}
	if (balance >= 10000) {
		return "text-error font-semibold";
	}
	if (balance >= 5000) {
		return "text-warning font-semibold";
	}
	return "text-foreground";
}
