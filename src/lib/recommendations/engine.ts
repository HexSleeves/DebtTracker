import type { Debt } from "~/types";
import { calculateDebtAvalanche } from "../algorithms/debt-avalanche";
import { calculateDebtSnowball } from "../algorithms/debt-snowball";

export type Strategy = "avalanche" | "snowball";

export interface Recommendation {
	debtId: string;
	amount: number;
}

/**
 * Generate payment recommendations based on selected strategy.
 */
export function generateRecommendations(
	debts: Debt[],
	monthlyBudget: number,
	strategy: Strategy,
): Recommendation[] {
	if (strategy === "avalanche") {
		return calculateDebtAvalanche(
			debts,
			monthlyBudget,
		).paymentRecommendations.map((p) => ({
			debtId: p.debtId,
			amount: p.recommendedPayment,
		}));
	}
	return calculateDebtSnowball(debts, monthlyBudget).paymentRecommendations.map(
		(p) => ({ debtId: p.debtId, amount: p.recommendedPayment }),
	);
}
