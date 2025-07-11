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
export type DebtStatus = "overdue" | "high_interest" | "current" | "paid";

export function getDebtStatus(debt: Debt): DebtStatus {
  // Check if debt is paid off
  if (debt.balance <= 0) {
    return "paid";
  }

  // Check if debt is overdue (due date is in the past)
  if (debt.dueDate && debt.dueDate < new Date()) {
    return "overdue";
  }

  // Check if debt has high interest rate (>= 15%)
  if (debt.interestRate >= 15) {
    return "high_interest";
  }

  // Default to current
  return "current";
}

export function getDebtStatusColor(status: DebtStatus): string {
  switch (status) {
    case "overdue":
      return "debt-overdue";
    case "high_interest":
      return "debt-warning";
    case "paid":
      return "debt-paid";
    case "current":
    default:
      return "debt-current";
  }
}

export function getDebtStatusLabel(status: DebtStatus): string {
  switch (status) {
    case "overdue":
      return "Overdue";
    case "high_interest":
      return "High Interest";
    case "paid":
      return "Paid Off";
    case "current":
    default:
      return "Current";
  }
}

export function getDebtRowColor(debt: Debt): string {
  const status = getDebtStatus(debt);
  switch (status) {
    case "overdue":
      return "border-l-error border-l-4 bg-error-50/30";
    case "high_interest":
      return "border-l-warning border-l-4 bg-warning-50/30";
    case "paid":
      return "border-l-success border-l-4 bg-success-50/30";
    case "current":
    default:
      return "border-l-info border-l-4 bg-info-50/20";
  }
}

export function getInterestRateColor(interestRate: number): string {
  if (interestRate >= 20) {
    return "text-error font-semibold";
  } else if (interestRate >= 15) {
    return "text-warning font-semibold";
  } else if (interestRate >= 10) {
    return "text-warning";
  } else {
    return "text-success";
  }
}

export function getBalanceColor(balance: number): string {
  if (balance <= 0) {
    return "text-success font-semibold";
  } else if (balance >= 10000) {
    return "text-error font-semibold";
  } else if (balance >= 5000) {
    return "text-warning font-semibold";
  } else {
    return "text-foreground";
  }
}
