"use client";

import { useCallback, useMemo } from "react";
// Re-export types from server algorithms for compatibility
import type { StrategyComparison } from "~/server/lib/algorithms/calculator";
import type { AvalancheResult } from "~/server/lib/algorithms/debt-avalanche";
import type { SnowballResult } from "~/server/lib/algorithms/debt-snowball";
import { api } from "~/trpc/react";
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
	const shouldSkip = debts.length === 0 || monthlyBudget <= 0;

	// Main strategy calculation using tRPC
	const strategiesQuery = api.paymentPlan.calculateStrategies.useQuery(
		{
			debts,
			monthlyBudget,
			monthlyIncome,
		},
		{
			enabled: !shouldSkip,
			staleTime: 5 * 60 * 1000, // 5 minutes
		},
	);

	// Note: Budget impact is now calculated client-side for real-time UI updates
	// Could be moved to server if needed for more accurate calculations

	const isLoading = shouldSkip || strategiesQuery.isLoading;

	const error = useMemo(() => {
		if (debts.length === 0) return "No debts provided";
		if (monthlyBudget <= 0) return "Monthly budget must be greater than 0";
		if (strategiesQuery.error) return strategiesQuery.error.message;
		return null;
	}, [debts.length, monthlyBudget, strategiesQuery.error]);

	// Budget impact calculator - synchronous for component compatibility
	const budgetImpact = useCallback(
		(increasedBudget: number) => {
			if (shouldSkip || error || !strategiesQuery.data) {
				return { monthsSaved: 0, interestSaved: 0, percentageImprovement: 0 };
			}

			// Use client-side calculation if needed for real-time updates
			// Import the algorithm locally for synchronous computation
			const currentTotal =
				strategiesQuery.data.avalanche?.totalMonthsToDebtFree ?? 0;
			const currentInterest =
				strategiesQuery.data.avalanche?.totalInterestSaved ?? 0;

			// Simple approximation for UI responsiveness
			const extraPayment = increasedBudget - monthlyBudget;
			const totalMinimum = strategiesQuery.data.metrics.totalMinimumPayments;
			const improvement = extraPayment / (totalMinimum ?? 1);

			const monthsSaved = Math.round(currentTotal * improvement * 0.3); // Approximation
			const interestSaved = Math.round(currentInterest * improvement * 0.1); // Approximation
			const percentageImprovement = (monthsSaved / (currentTotal ?? 1)) * 100;

			return {
				monthsSaved: Math.max(0, monthsSaved),
				interestSaved: Math.max(0, interestSaved),
				percentageImprovement: Math.max(0, percentageImprovement),
			};
		},
		[strategiesQuery.data, shouldSkip, error, monthlyBudget],
	);

	return {
		avalanche: strategiesQuery.data?.avalanche ?? null,
		snowball: strategiesQuery.data?.snowball ?? null,
		comparison: strategiesQuery.data?.comparison ?? null,
		metrics: strategiesQuery.data?.metrics ?? {
			totalMinimumPayments: 0,
			debtToIncomeRatio: null,
			weightedAverageInterestRate: 0,
			extraPayment: 0,
			minimumPaymentTimeline: {
				totalMonths: 0,
				totalInterest: 0,
				debtFreeDate: new Date(),
			},
		},
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
	const shouldSkip = debts.length === 0;

	const metricsQuery = api.paymentPlan.calculateMetrics.useQuery(
		{
			debts,
			monthlyIncome,
		},
		{
			enabled: !shouldSkip,
			staleTime: 5 * 60 * 1000, // 5 minutes
		},
	);

	return useMemo(() => {
		if (shouldSkip || !metricsQuery.data) {
			return {
				totalDebt: 0,
				totalMinimumPayments: 0,
				debtToIncomeRatio: null,
				weightedAverageInterestRate: 0,
				highestInterestRate: 0,
				lowestInterestRate: 0,
				averageBalance: 0,
				isLoading: metricsQuery.isLoading,
			};
		}

		return {
			...metricsQuery.data,
			isLoading: metricsQuery.isLoading,
		};
	}, [metricsQuery.data, shouldSkip, metricsQuery.isLoading]);
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
