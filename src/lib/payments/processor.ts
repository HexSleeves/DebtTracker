import type { Debt, Payment, PaymentBreakdown } from "~/types";

/**
 * Calculate the interest and principal portions of a payment.
 * This is a simplified calculation using monthly interest.
 */
export function calculatePaymentBreakdown(
	debt: Pick<Debt, "balance" | "interestRate">,
	amount: number,
	options?: { paymentDate?: Date; lastPaymentDate?: Date },
): PaymentBreakdown {
	const monthlyRate = debt.interestRate / 100 / 12;
	const paymentDate = options?.paymentDate ?? new Date();
	const lastDate = options?.lastPaymentDate ?? new Date(paymentDate);
	const days = Math.max(
		0,
		(paymentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
	);
	// Simple interest approximation based on days since last payment
	const interest = Math.min(debt.balance * monthlyRate * (days / 30), amount);
	const principal = Math.max(0, amount - interest);
	return { interestPortion: interest, principalPortion: principal };
}

/**
 * Apply a payment to a debt and return the new balance with breakdown info.
 */
export function applyPayment(
	debt: Debt,
	payment: Pick<Payment, "amount" | "paymentDate">,
	options?: { lastPaymentDate?: Date },
): { newBalance: number; breakdown: PaymentBreakdown } {
	const breakdown = calculatePaymentBreakdown(debt, payment.amount, {
		paymentDate: payment.paymentDate,
		lastPaymentDate: options?.lastPaymentDate,
	});
	const newBalance = Math.max(0, debt.balance - breakdown.principalPortion);
	return { newBalance, breakdown };
}
