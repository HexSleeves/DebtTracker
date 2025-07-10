"use client";

import { useCallback, useMemo } from "react";
import {
	calculateBudgetImpact,
	calculateDebtToIncomeRatio,
	calculateExtraPayment,
	calculateTotalMinimumPayments,
	calculateWeightedAverageInterestRate,
	compareStrategies,
	estimateMinimumPaymentTimeline,
	type StrategyComparison,
} from "~/lib/algorithms/calculator";
import {
	type AvalancheResult,
	calculateDebtAvalanche,
} from "~/lib/algorithms/debt-avalanche";
import {
	calculateDebtSnowball,
	type SnowballResult,
} from "~/lib/algorithms/debt-snowball";
import type { Debt } from "~/types/db.helpers";

export interface DebtStrategyHookReturn {
	avalanche: AvalancheResult | null;
	snowball: SnowballResult | null;
	comparison: StrategyComparison | null;
	metrics: {
		totalMinimumPayments: number;
		debtToIncomeRatio: number | null;
		weightedAverageInterestRate: number;
		extraPayment: number;
		minimumPaymentTimeline: {
			totalMonths: number;
			totalInterest: number;
			debtFreeDate: Date;
		};
	};
	budgetImpact: (increasedBudget: number) => {
		monthsSaved: number;
		interestSaved: number;
		percentageImprovement: number;
	};
	isLoading: boolean;
	error: string | null;
}

/**
 * Custom hook for debt strategy calculations
 * Provides memoized calculations for debt avalanche, snowball, and comparison strategies
 */
export function useDebtStrategy(
	debts: Debt[],
	monthlyBudget: number,
	monthlyIncome?: number,
): DebtStrategyHookReturn {
	const isLoading = useMemo(() => {
		return debts.length === 0 || monthlyBudget <= 0;
	}, [debts.length, monthlyBudget]);

	const error = useMemo(() => {
		if (debts.length === 0) return "No debts provided";
		if (monthlyBudget <= 0) return "Monthly budget must be greater than 0";

		const totalMinimum = calculateTotalMinimumPayments(debts);
		if (monthlyBudget < totalMinimum) {
			return `Monthly budget ($${monthlyBudget}) is less than minimum payments required ($${totalMinimum})`;
		}

		return null;
	}, [debts, monthlyBudget]);

	// Calculate debt avalanche strategy
	const avalanche = useMemo(() => {
		if (isLoading || error) return null;

		try {
			return calculateDebtAvalanche(debts, monthlyBudget);
		} catch (err) {
			console.error("Error calculating debt avalanche:", err);
			return null;
		}
	}, [debts, monthlyBudget, isLoading, error]);

	// Calculate debt snowball strategy
	const snowball = useMemo(() => {
		if (isLoading || error) return null;

		try {
			return calculateDebtSnowball(debts, monthlyBudget);
		} catch (err) {
			console.error("Error calculating debt snowball:", err);
			return null;
		}
	}, [debts, monthlyBudget, isLoading, error]);

	// Compare strategies
	const comparison = useMemo(() => {
		if (isLoading || error) return null;

		try {
			return compareStrategies(debts, monthlyBudget);
		} catch (err) {
			console.error("Error comparing strategies:", err);
			return null;
		}
	}, [debts, monthlyBudget, isLoading, error]);

	// Calculate debt metrics
	const metrics = useMemo(() => {
		const totalMinimumPayments = calculateTotalMinimumPayments(debts);
		const debtToIncomeRatio = monthlyIncome
			? calculateDebtToIncomeRatio(debts, monthlyIncome)
			: null;
		const weightedAverageInterestRate =
			calculateWeightedAverageInterestRate(debts);
		const extraPayment = calculateExtraPayment(debts, monthlyBudget);
		const minimumPaymentTimeline = estimateMinimumPaymentTimeline(debts);

		return {
			totalMinimumPayments,
			debtToIncomeRatio,
			weightedAverageInterestRate,
			extraPayment,
			minimumPaymentTimeline,
		};
	}, [debts, monthlyBudget, monthlyIncome]);

	// Budget impact calculator
	const budgetImpact = useCallback(
		(increasedBudget: number) => {
			if (isLoading || error) {
				return { monthsSaved: 0, interestSaved: 0, percentageImprovement: 0 };
			}

			try {
				return calculateBudgetImpact(debts, monthlyBudget, increasedBudget);
			} catch (err) {
				console.error("Error calculating budget impact:", err);
				return { monthsSaved: 0, interestSaved: 0, percentageImprovement: 0 };
			}
		},
		[debts, monthlyBudget, isLoading, error],
	);

	return {
		avalanche,
		snowball,
		comparison,
		metrics,
		budgetImpact,
		isLoading,
		error,
	};
}

/**
 * Simplified hook for quick debt calculations
 * Useful for displaying basic debt information
 */
export function useDebtMetrics(debts: Debt[], monthlyIncome?: number) {
	return useMemo(() => {
		if (debts.length === 0) {
			return {
				totalDebt: 0,
				totalMinimumPayments: 0,
				debtToIncomeRatio: null,
				weightedAverageInterestRate: 0,
				highestInterestRate: 0,
				lowestInterestRate: 0,
				averageBalance: 0,
			};
		}

		const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
		const totalMinimumPayments = calculateTotalMinimumPayments(debts);
		const debtToIncomeRatio = monthlyIncome
			? calculateDebtToIncomeRatio(debts, monthlyIncome)
			: null;
		const weightedAverageInterestRate =
			calculateWeightedAverageInterestRate(debts);
		const interestRates = debts.map((debt) => debt.interestRate);
		const highestInterestRate = Math.max(...interestRates);
		const lowestInterestRate = Math.min(...interestRates);
		const averageBalance = totalDebt / debts.length;

		return {
			totalDebt,
			totalMinimumPayments,
			debtToIncomeRatio,
			weightedAverageInterestRate,
			highestInterestRate,
			lowestInterestRate,
			averageBalance,
		};
	}, [debts, monthlyIncome]);
}

/**
 * Hook for debt strategy recommendations
 * Provides intelligent recommendations based on debt profile
 */
export function useDebtRecommendations(debts: Debt[], monthlyBudget: number) {
	const { comparison, metrics } = useDebtStrategy(debts, monthlyBudget);

	return useMemo(() => {
		if (!comparison || !metrics) return null;

		const recommendations: Array<{
			type: "avalanche" | "snowball" | "mixed";
			title: string;
			description: string;
			priority: "high" | "medium" | "low";
			reasoning: string;
		}> = [];

		// Interest savings recommendation
		if (comparison.comparison.interestSavingsWithAvalanche > 1000) {
			recommendations.push({
				type: "avalanche",
				title: "Use Debt Avalanche Strategy",
				description: `Save $${comparison.comparison.interestSavingsWithAvalanche.toFixed(
					2,
				)} in interest`,
				priority: "high",
				reasoning:
					"Significant interest savings make this the most cost-effective approach",
			});
		}

		// Motivational recommendation
		if (comparison.comparison.motivationalBenefitOfSnowball >= 2) {
			recommendations.push({
				type: "snowball",
				title: "Consider Debt Snowball for Motivation",
				description: `Eliminate ${comparison.comparison.motivationalBenefitOfSnowball} debts in the first year`,
				priority: "medium",
				reasoning:
					"Quick wins can provide psychological motivation to stick with the plan",
			});
		}

		// Mixed strategy recommendation
		if (
			debts.length > 3 &&
			comparison.comparison.interestSavingsWithAvalanche < 500
		) {
			recommendations.push({
				type: "mixed",
				title: "Try a Mixed Strategy",
				description:
					"Start with smallest debts, then switch to highest interest rates",
				priority: "medium",
				reasoning: "Balance between motivation and interest savings",
			});
		}

		return recommendations;
	}, [comparison, metrics, debts.length]);
}

/**
 * Hook for debt progress tracking
 * Useful for displaying progress over time
 */
export function useDebtProgress(
	originalDebts: Debt[],
	currentDebts: Debt[],
	monthlyBudget: number,
) {
	return useMemo(() => {
		const originalTotal = originalDebts.reduce(
			(sum, debt) => sum + debt.balance,
			0,
		);
		const currentTotal = currentDebts.reduce(
			(sum, debt) => sum + debt.balance,
			0,
		);
		const totalPaid = originalTotal - currentTotal;
		const progressPercentage =
			originalTotal > 0 ? (totalPaid / originalTotal) * 100 : 0;

		const debtsEliminated = originalDebts.length - currentDebts.length;
		const averageMonthlyProgress =
			monthlyBudget > 0 ? totalPaid / monthlyBudget : 0;

		return {
			originalTotal,
			currentTotal,
			totalPaid,
			progressPercentage,
			debtsEliminated,
			averageMonthlyProgress,
		};
	}, [originalDebts, currentDebts, monthlyBudget]);
}
