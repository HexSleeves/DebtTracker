import type { Debt, Payment } from "~/types";
import { applyPayment } from "./processor";

/**
 * Record a new payment and update the debt balance.
 * Returns the updated payment with balance information.
 */
export function recordPayment(
	debt: Debt,
	payment: Pick<
		Payment,
		"amount" | "paymentDate" | "type" | "paymentMethod" | "notes"
	>,
	options?: { lastPaymentDate?: Date },
): { updatedDebt: Debt; payment: Payment } {
	const { newBalance, breakdown } = applyPayment(debt, payment, {
		lastPaymentDate: options?.lastPaymentDate,
	});

	const updatedDebt: Debt = {
		...debt,
		balance: newBalance,
		totalInterestPaid: debt.totalInterestPaid + breakdown.interestPortion,
		totalPaymentsMade: debt.totalPaymentsMade + payment.amount,
	};

	const storedPayment: Payment = {
		id: `temp-${Date.now()}`,
		debtId: debt.id,
		amount: payment.amount,
		paymentDate: payment.paymentDate,
		type: payment.type,
		balanceAfterPayment: newBalance,
		interestPortion: breakdown.interestPortion,
		principalPortion: breakdown.principalPortion,
		paymentMethod: payment.paymentMethod,
		notes: payment.notes ?? null,
		createdAt: new Date(),
	};

	return { updatedDebt, payment: storedPayment };
}

/**
 * Edit an existing payment. Returns the updated payment and debt.
 */
export function editPayment(
	debt: Debt,
	existing: Payment,
	updates: Partial<
		Pick<Payment, "amount" | "paymentDate" | "notes" | "paymentMethod">
	>,
): { updatedDebt: Debt; payment: Payment } {
	const newPayment: Payment = { ...existing, ...updates };
	const { newBalance, breakdown } = applyPayment(debt, newPayment, {
		lastPaymentDate: updates.paymentDate ?? existing.paymentDate,
	});

	const updatedDebt: Debt = {
		...debt,
		balance: newBalance,
	};

	newPayment.balanceAfterPayment = newBalance;
	newPayment.interestPortion = breakdown.interestPortion;
	newPayment.principalPortion = breakdown.principalPortion;

	return { updatedDebt, payment: newPayment };
}

/**
 * Reverse a payment, restoring the debt balance.
 */
export function reversePayment(debt: Debt, payment: Payment): Debt {
	return {
		...debt,
		balance: debt.balance + payment.principalPortion,
		totalInterestPaid: debt.totalInterestPaid - payment.interestPortion,
		totalPaymentsMade: debt.totalPaymentsMade - payment.amount,
	};
}
