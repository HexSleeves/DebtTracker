"use client";

import {
	AlertTriangle,
	Calendar,
	DollarSign,
	TrendingDown,
	TrendingUp,
	Zap,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { formatCurrency } from "~/lib/currency";
import {
	useDebtRecommendations,
	useDebtStrategy,
} from "~/lib/hooks/use-debt-strategy";
import { api } from "~/trpc/react";

export default function StrategiesPage() {
	const { data: debts, isLoading } = api.debt.getAll.useQuery();

	// For demo purposes, using a fixed monthly budget
	// In a real app, this would come from user preferences or be input by the user
	const monthlyBudget = 1500;

	const {
		avalanche,
		snowball,
		comparison,
		metrics,
		budgetImpact,
		isLoading: strategyLoading,
		error,
	} = useDebtStrategy(debts || [], monthlyBudget);

	const recommendations = useDebtRecommendations(debts || [], monthlyBudget);

	if (isLoading) {
		return <StrategiesPageSkeleton />;
	}

	if (!debts || debts.length === 0) {
		return (
			<div className="space-y-8">
				<div>
					<h2 className="font-bold text-3xl tracking-tight">Debt Strategies</h2>
					<p className="text-muted-foreground">
						Optimize your debt repayment with proven strategies
					</p>
				</div>
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-16">
						<AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-lg">No Debts Found</h3>
						<p className="text-center text-muted-foreground">
							Add some debts to see personalized repayment strategies.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-8">
				<div>
					<h2 className="font-bold text-3xl tracking-tight">Debt Strategies</h2>
					<p className="text-muted-foreground">
						Optimize your debt repayment with proven strategies
					</p>
				</div>
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-16">
						<AlertTriangle className="mb-4 h-12 w-12 text-destructive" />
						<h3 className="mb-2 font-semibold text-lg">Strategy Error</h3>
						<p className="text-center text-muted-foreground">{error}</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div>
				<h2 className="font-bold text-3xl tracking-tight">Debt Strategies</h2>
				<p className="text-muted-foreground">
					Compare avalanche vs snowball methods for optimal debt repayment
				</p>
			</div>

			{/* Debt Overview Metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Total Debt</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{formatCurrency(
								debts.reduce((sum, debt) => sum + debt.balance, 0),
							)}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Monthly Payments
						</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{formatCurrency(metrics.totalMinimumPayments)}
						</div>
						<p className="text-muted-foreground text-xs">Minimum required</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Extra Payment</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{formatCurrency(metrics.extraPayment)}
						</div>
						<p className="text-muted-foreground text-xs">
							Available for strategy
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Avg Interest Rate
						</CardTitle>
						<TrendingDown className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{metrics.weightedAverageInterestRate.toFixed(2)}%
						</div>
						<p className="text-muted-foreground text-xs">Weighted average</p>
					</CardContent>
				</Card>
			</div>

			{/* Strategy Recommendations */}
			{recommendations && recommendations.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Zap className="h-5 w-5" />
							Recommended Strategies
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{recommendations.map((rec) => (
							<div
								key={rec.title}
								className="rounded-r-lg border-l-4 border-l-blue-500 bg-blue-50 p-4"
							>
								<div className="flex items-start justify-between">
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<h4 className="font-semibold">{rec.title}</h4>
											<Badge
												variant={
													rec.priority === "high" ? "destructive" : "secondary"
												}
											>
												{rec.priority}
											</Badge>
										</div>
										<p className="text-muted-foreground text-sm">
											{rec.description}
										</p>
										<p className="text-muted-foreground text-xs italic">
											{rec.reasoning}
										</p>
									</div>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{/* Strategy Comparison */}
			{avalanche && snowball && comparison && (
				<div className="grid gap-6 md:grid-cols-2">
					{/* Debt Avalanche */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">🏔️ Debt Avalanche</CardTitle>
							<p className="text-muted-foreground text-sm">
								Pay highest interest rates first
							</p>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="font-medium text-sm">Interest Saved</span>
									<span className="text-sm">
										{formatCurrency(avalanche.totalInterestSaved)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium text-sm">Payoff Time</span>
									<span className="text-sm">
										{avalanche.totalMonthsToDebtFree} months
									</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium text-sm">Debt Free Date</span>
									<span className="text-sm">
										{avalanche.debtFreeDate.toLocaleDateString()}
									</span>
								</div>
							</div>
							<div className="space-y-2">
								<span className="font-medium text-sm">Payment Order:</span>
								{avalanche.paymentRecommendations
									.slice(0, 3)
									.map((rec, index) => (
										<div
											key={rec.debtId}
											className="flex items-center justify-between text-sm"
										>
											<span>
												{index + 1}. {rec.debtName}
											</span>
											<Badge variant="outline">
												{formatCurrency(rec.recommendedPayment)}
											</Badge>
										</div>
									))}
								{avalanche.paymentRecommendations.length > 3 && (
									<p className="text-muted-foreground text-xs">
										+{avalanche.paymentRecommendations.length - 3} more debts
									</p>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Debt Snowball */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">⛄ Debt Snowball</CardTitle>
							<p className="text-muted-foreground text-sm">
								Pay smallest balances first
							</p>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="font-medium text-sm">Total Interest</span>
									<span className="text-sm">
										{formatCurrency(snowball.totalInterestPaid)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium text-sm">Payoff Time</span>
									<span className="text-sm">
										{snowball.totalMonthsToDebtFree} months
									</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium text-sm">Debt Free Date</span>
									<span className="text-sm">
										{snowball.debtFreeDate.toLocaleDateString()}
									</span>
								</div>
							</div>
							<div className="space-y-2">
								<span className="font-medium text-sm">Payment Order:</span>
								{snowball.paymentRecommendations.slice(0, 3).map((rec) => (
									<div
										key={rec.debtId}
										className="flex items-center justify-between text-sm"
									>
										<span>
											{rec.priorityRank}. {rec.debtName}
										</span>
										<Badge variant="outline">
											{formatCurrency(rec.recommendedPayment)}
										</Badge>
									</div>
								))}
								{snowball.paymentRecommendations.length > 3 && (
									<p className="text-muted-foreground text-xs">
										+{snowball.paymentRecommendations.length - 3} more debts
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Strategy Impact */}
			{comparison && (
				<Card>
					<CardHeader>
						<CardTitle>Strategy Impact Analysis</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid gap-4 md:grid-cols-3">
							<div className="rounded-lg border p-4 text-center">
								<div className="font-bold text-2xl text-green-600">
									{formatCurrency(
										comparison.comparison.interestSavingsWithAvalanche,
									)}
								</div>
								<p className="text-muted-foreground text-sm">
									Interest Savings with Avalanche
								</p>
							</div>
							<div className="rounded-lg border p-4 text-center">
								<div className="font-bold text-2xl text-blue-600">
									{comparison.comparison.timeSavingsWithAvalanche}
								</div>
								<p className="text-muted-foreground text-sm">
									Months Saved with Avalanche
								</p>
							</div>
							<div className="rounded-lg border p-4 text-center">
								<div className="font-bold text-2xl text-purple-600">
									{comparison.comparison.motivationalBenefitOfSnowball}
								</div>
								<p className="text-muted-foreground text-sm">
									Quick Wins with Snowball
								</p>
							</div>
						</div>

						{/* Budget Impact Calculator */}
						<div className="space-y-4">
							<h4 className="font-semibold">Budget Impact Analysis</h4>
							<div className="grid gap-4 md:grid-cols-3">
								{[100, 200, 500].map((increase) => {
									const impact = budgetImpact(monthlyBudget + increase);
									return (
										<div key={increase} className="rounded-lg border p-4">
											<div className="font-semibold text-lg">
												+{formatCurrency(increase)}/month
											</div>
											<div className="space-y-1 text-sm">
												<p>Save {impact.monthsSaved} months</p>
												<p>
													Save {formatCurrency(impact.interestSaved)} interest
												</p>
												<p className="text-green-600">
													{impact.percentageImprovement.toFixed(1)}% improvement
												</p>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

function StrategiesPageSkeleton() {
	return (
		<div className="space-y-8">
			<div>
				<Skeleton className="h-8 w-48" />
				<Skeleton className="mt-2 h-4 w-64" />
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<Card key={i}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-4" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-8 w-20" />
							<Skeleton className="mt-1 h-3 w-16" />
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{[1, 2].map((i) => (
					<Card key={i}>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
							<Skeleton className="h-4 w-48" />
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								{[1, 2, 3].map((j) => (
									<div key={j} className="flex justify-between">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-4 w-16" />
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
