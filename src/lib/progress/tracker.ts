import { addMonths, differenceInMonths } from "date-fns";
import type { Debt, DebtMilestone, DebtProgress, Payment } from "~/types";

/**
 * Calculate progress information for a single debt based on existing payments.
 */
export function calculateProgress(
	debt: Debt,
	payments: Payment[],
): DebtProgress {
	const paid = debt.originalBalance - debt.balance;
	const percentagePaid =
		debt.originalBalance > 0 ? (paid / debt.originalBalance) * 100 : 0;

	const remainingBalance = Math.max(0, debt.balance);
	const monthsRemaining =
		debt.minimumPayment > 0
			? Math.ceil(remainingBalance / debt.minimumPayment)
			: 0;

	const projectedPayoffDate = addMonths(new Date(), monthsRemaining);

	let paymentVelocity = 0;
	if (payments.length > 1) {
		const months = Math.max(
			1,
			differenceInMonths(new Date(), payments[0]?.paymentDate ?? new Date()),
		);
		paymentVelocity = payments.length / months;
	} else if (payments.length === 1) {
		paymentVelocity = 1;
	}

	return {
		percentagePaid,
		remainingBalance,
		monthsRemaining,
		projectedPayoffDate,
		totalInterestProjected: debt.totalInterestPaid,
		paymentVelocity,
	};
}

/**
 * Detect which milestone thresholds are reached after a new payment.
 * Returns the milestones that should be recorded.
 */
export function detectMilestones(
	debt: Debt,
	newPayment: Payment,
): DebtMilestone[] {
	const milestones: DebtMilestone[] = [];
	const newBalance = Math.max(0, debt.balance - newPayment.amount);
	const progressAfter =
		debt.originalBalance > 0
			? ((debt.originalBalance - newBalance) / debt.originalBalance) * 100
			: 0;

	const now = new Date();
	const checks: Array<{
		threshold: number;
		type: DebtMilestone["milestoneType"];
	}> = [
		{ threshold: 25, type: "25_percent_paid" },
		{ threshold: 50, type: "50_percent_paid" },
		{ threshold: 75, type: "75_percent_paid" },
		{ threshold: 100, type: "paid_off" },
	];

	for (const check of checks) {
		if (progressAfter >= check.threshold) {
			milestones.push({
				id: "", // to be filled by database
				debtId: debt.id,
				milestoneType: check.type,
				achievedDate: now,
				milestoneValue: newBalance,
				description: `${check.threshold}% of debt paid off`,
				createdAt: now,
			});
		}
	}

	return milestones;
}
