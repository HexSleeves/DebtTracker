"use client";

import {
	AlertTriangle,
	BarChart3,
	Calculator,
	Calendar,
	CheckCircle,
	Clock,
	DollarSign,
	Info,
	PieChart,
	Target,
	TrendingDown,
	TrendingUp,
	Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart as RechartsPieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import {
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
	Tooltip as UITooltip,
} from "~/components/ui/tooltip";
import { formatCurrency } from "~/lib/currency";
import {
	useDebtRecommendations,
	useDebtStrategy,
} from "~/lib/hooks/use-debt-strategy";
import { api } from "~/trpc/react";

type StrategyType = "avalanche" | "snowball" | "custom";

const CHART_COLORS = [
	"#3B82F6", // Blue
	"#EF4444", // Red
	"#10B981", // Green
	"#F59E0B", // Yellow
	"#8B5CF6", // Purple
	"#EC4899", // Pink
	"#06B6D4", // Cyan
	"#84CC16", // Lime
];

export default function StrategiesPage() {
	const { data: debts, isLoading } = api.debt.getAll.useQuery();
	const [selectedStrategy, setSelectedStrategy] =
		useState<StrategyType>("avalanche");
	const [customBudget, setCustomBudget] = useState<number>(1500);
	const [showDetailedProjections, setShowDetailedProjections] = useState(false);

	const {
		error,
		avalanche,
		snowball,
		comparison,
		metrics,
		budgetImpact,
		isLoading: strategyLoading,
	} = useDebtStrategy(debts ?? [], customBudget);

	const recommendations = useDebtRecommendations(debts ?? [], customBudget);

	// Memoized chart data
	const payoffTimelineData = useMemo(() => {
		if (!avalanche || !snowball) return [];

		const maxMonths = Math.max(
			avalanche.totalMonthsToDebtFree,
			snowball.totalMonthsToDebtFree,
		);
		const data = [];

		for (let month = 0; month <= maxMonths; month += 6) {
			const avalancheRemaining =
				avalanche.monthlyBreakdown
					.find((m) => m.month === month)
					?.payments.reduce((sum, p) => sum + p.remainingBalance, 0) ?? 0;

			const snowballRemaining =
				snowball.monthlyBreakdown
					.find((m) => m.month === month)
					?.payments.reduce((sum, p) => sum + p.remainingBalance, 0) ?? 0;

			data.push({
				month,
				avalanche: avalancheRemaining,
				snowball: snowballRemaining,
				date: new Date(
					Date.now() + month * 30 * 24 * 60 * 60 * 1000,
				).toLocaleDateString("en-US", {
					month: "short",
					year: "numeric",
				}),
			});
		}

		return data;
	}, [avalanche, snowball]);

	const debtCompositionData = useMemo(() => {
		if (!debts) return [];

		return debts.map((debt, index) => ({
			name: debt.name,
			balance: debt.balance,
			interestRate: debt.interestRate,
			color: CHART_COLORS[index % CHART_COLORS.length],
		}));
	}, [debts]);

	const interestSavingsData = useMemo(() => {
		if (!comparison) return [];

		return [
			{
				strategy: "Minimum Payments",
				totalInterest: metrics.minimumPaymentTimeline.totalInterest,
				months: metrics.minimumPaymentTimeline.totalMonths,
			},
			{
				strategy: "Debt Snowball",
				totalInterest: comparison.snowball.totalInterestPaid,
				months: comparison.snowball.totalMonthsToDebtFree,
			},
			{
				strategy: "Debt Avalanche",
				totalInterest: comparison.avalanche.totalInterestPaid,
				months: comparison.avalanche.totalMonthsToDebtFree,
			},
		];
	}, [comparison, metrics]);

	const currentStrategy =
		selectedStrategy === "avalanche" ? avalanche : snowball;

	if (isLoading || strategyLoading) {
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
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-bold text-3xl tracking-tight">
						Debt Strategy Dashboard
					</h2>
					<p className="text-muted-foreground">
						Comprehensive analysis and optimization of your debt repayment
						strategy
					</p>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<Calculator className="h-4 w-4" />
						<Label htmlFor="budget">Monthly Budget</Label>
						<Input
							id="budget"
							type="number"
							value={customBudget}
							onChange={(e) => setCustomBudget(Number(e.target.value))}
							className="w-32"
							min="0"
							step="50"
						/>
					</div>
					<Select
						value={selectedStrategy}
						onValueChange={(value: StrategyType) => setSelectedStrategy(value)}
					>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="Select strategy" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="avalanche">🏔️ Debt Avalanche</SelectItem>
							<SelectItem value="snowball">⛄ Debt Snowball</SelectItem>
							<SelectItem value="custom">🎯 Custom Strategy</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Key Metrics Overview */}
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
						<p className="text-muted-foreground text-xs">
							Across {debts.length} debt{debts.length !== 1 ? "s" : ""}
						</p>
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
							{formatCurrency(customBudget)}
						</div>
						<p className="text-muted-foreground text-xs">
							Min: {formatCurrency(metrics.totalMinimumPayments)}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Payoff Time</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{currentStrategy?.totalMonthsToDebtFree ?? 0} months
						</div>
						<p className="text-muted-foreground text-xs">
							{currentStrategy?.debtFreeDate.toLocaleDateString()}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Interest Savings
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-green-600">
							{formatCurrency(
								selectedStrategy === "avalanche"
									? (avalanche?.totalInterestSaved ?? 0)
									: (comparison?.comparison.interestSavingsWithAvalanche ?? 0),
							)}
						</div>
						<p className="text-muted-foreground text-xs">vs minimum payments</p>
					</CardContent>
				</Card>
			</div>

			{/* Complete Debt Overview Table */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BarChart3 className="h-5 w-5" />
						Complete Debt Overview
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Debt</TableHead>
									<TableHead>Balance</TableHead>
									<TableHead>Interest Rate</TableHead>
									<TableHead>Min Payment</TableHead>
									<TableHead>Recommended Payment</TableHead>
									<TableHead>Priority</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{debts.map((debt) => {
									const recommendation =
										currentStrategy?.paymentRecommendations.find(
											(rec) => rec.debtId === debt.id,
										);
									const projection = currentStrategy?.projections.find(
										(proj) => proj.debtId === debt.id,
									);

									return (
										<TableRow key={debt.id}>
											<TableCell className="font-medium">{debt.name}</TableCell>
											<TableCell>{formatCurrency(debt.balance)}</TableCell>
											<TableCell>{debt.interestRate.toFixed(2)}%</TableCell>
											<TableCell>
												{formatCurrency(debt.minimumPayment)}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													{formatCurrency(
														recommendation?.recommendedPayment ??
															debt.minimumPayment,
													)}
													{recommendation &&
														!recommendation.isMinimumPayment && (
															<Badge variant="secondary" className="text-xs">
																+
																{formatCurrency(
																	recommendation.recommendedPayment -
																		debt.minimumPayment,
																)}
															</Badge>
														)}
												</div>
											</TableCell>
											<TableCell>
												<Badge
													variant={
														recommendation?.priorityRank === 1
															? "default"
															: recommendation?.priorityRank === 2
																? "secondary"
																: "outline"
													}
												>
													#{recommendation?.priorityRank ?? "-"}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<div className="flex items-center gap-1">
														<Clock className="h-3 w-3" />
														<span className="text-sm">
															{projection?.monthsToPayoff ?? 0}mo
														</span>
													</div>
													<TooltipProvider>
														<UITooltip>
															<TooltipTrigger>
																<Info className="h-3 w-3 text-muted-foreground" />
															</TooltipTrigger>
															<TooltipContent>
																<p>
																	Payoff date:{" "}
																	{projection?.payoffDate.toLocaleDateString()}
																</p>
																<p>
																	Total interest:{" "}
																	{formatCurrency(
																		projection?.totalInterestPaid ?? 0,
																	)}
																</p>
															</TooltipContent>
														</UITooltip>
													</TooltipProvider>
												</div>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			{/* Strategy Recommendations */}
			{recommendations && recommendations.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Zap className="h-5 w-5" />
							Strategy Recommendations
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{recommendations.map((rec) => (
							<div
								key={rec.title}
								className="rounded-r-lg border-l-4 border-l-blue-500 bg-blue-50 p-4 dark:bg-blue-950/20"
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

			{/* Visual Analytics */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Debt Payoff Timeline */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingDown className="h-5 w-5" />
							Debt Payoff Timeline
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-80">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={payoffTimelineData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="date" />
									<YAxis
										tickFormatter={(value) => formatCurrency(value as number)}
									/>
									<Tooltip
										formatter={(value) => formatCurrency(value as number)}
									/>
									<Area
										type="monotone"
										dataKey="avalanche"
										stackId="1"
										stroke="#3B82F6"
										fill="#3B82F6"
										fillOpacity={0.3}
										name="Avalanche"
									/>
									<Area
										type="monotone"
										dataKey="snowball"
										stackId="2"
										stroke="#EF4444"
										fill="#EF4444"
										fillOpacity={0.3}
										name="Snowball"
									/>
									<Legend />
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				{/* Debt Composition */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<PieChart className="h-5 w-5" />
							Debt Composition
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-80">
							<ResponsiveContainer width="100%" height="100%">
								<RechartsPieChart>
									<Pie
										data={debtCompositionData}
										cx="50%"
										cy="50%"
										labelLine={false}
										label={({
											name,
											percent,
										}: {
											name: string;
											percent?: number;
										}) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
										outerRadius={80}
										fill="#8884d8"
										dataKey="balance"
									>
										{debtCompositionData.map((entry) => (
											<Cell key={entry.name} fill={entry.color} />
										))}
									</Pie>
									<Tooltip
										formatter={(value) => formatCurrency(value as number)}
									/>
								</RechartsPieChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Strategy Comparison */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Target className="h-5 w-5" />
						Strategy Comparison
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={interestSavingsData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="strategy" />
								<YAxis
									tickFormatter={(value) => formatCurrency(value as number)}
								/>
								<Tooltip
									formatter={(value) => formatCurrency(value as number)}
								/>
								<Bar
									dataKey="totalInterest"
									fill="#3B82F6"
									name="Total Interest"
								/>
								<Legend />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>

			{/* Monthly Payment Allocation */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calculator className="h-5 w-5" />
						Monthly Payment Allocation
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-3">
								<h4 className="font-semibold">Current Month Breakdown</h4>
								{currentStrategy?.paymentRecommendations.map((rec) => (
									<div
										key={rec.debtId}
										className="flex items-center justify-between rounded-lg border p-3"
									>
										<div className="flex items-center gap-3">
											<Badge variant="outline">#{rec.priorityRank}</Badge>
											<div>
												<p className="font-medium">{rec.debtName}</p>
												<p className="text-muted-foreground text-sm">
													{rec.isMinimumPayment
														? "Minimum payment"
														: "Priority payment"}
												</p>
											</div>
										</div>
										<div className="text-right">
											<p className="font-bold">
												{formatCurrency(rec.recommendedPayment)}
											</p>
											{!rec.isMinimumPayment && (
												<p className="text-green-600 text-xs">
													+
													{formatCurrency(
														rec.recommendedPayment -
															(debts.find((d) => d.id === rec.debtId)
																?.minimumPayment ?? 0),
													)}
												</p>
											)}
										</div>
									</div>
								))}
							</div>

							<div className="space-y-3">
								<h4 className="font-semibold">Budget Impact Calculator</h4>
								{[100, 200, 500].map((increase) => {
									const impact = budgetImpact(customBudget + increase);
									return (
										<div
											key={increase}
											className="rounded-lg border bg-muted/20 p-3"
										>
											<div className="mb-2 flex items-center justify-between">
												<span className="font-medium">
													+{formatCurrency(increase)}/month
												</span>
												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														setCustomBudget(customBudget + increase)
													}
												>
													Apply
												</Button>
											</div>
											<div className="grid grid-cols-2 gap-2 text-sm">
												<div>
													<p className="text-muted-foreground">Time saved</p>
													<p className="font-medium">
														{impact.monthsSaved} months
													</p>
												</div>
												<div>
													<p className="text-muted-foreground">
														Interest saved
													</p>
													<p className="font-medium text-green-600">
														{formatCurrency(impact.interestSaved)}
													</p>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Detailed Projections */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<CheckCircle className="h-5 w-5" />
							Detailed Debt Projections
						</div>
						<Button
							variant="outline"
							onClick={() =>
								setShowDetailedProjections(!showDetailedProjections)
							}
						>
							{showDetailedProjections ? "Hide" : "Show"} Details
						</Button>
					</CardTitle>
				</CardHeader>
				{showDetailedProjections && (
					<CardContent>
						<div className="space-y-6">
							{currentStrategy?.projections.map((projection) => {
								const debt = debts.find((d) => d.id === projection.debtId);
								if (!debt) return null;

								const progressPercentage =
									((debt.originalBalance - projection.currentBalance) /
										debt.originalBalance) *
									100;

								console.log(debt.originalBalance, projection.currentBalance);

								return (
									<div
										key={projection.debtId}
										className="rounded-lg border p-4"
									>
										<div className="mb-3 flex items-center justify-between">
											<div>
												<h4 className="font-semibold">{projection.debtName}</h4>
												<p className="text-muted-foreground text-sm">
													{formatCurrency(projection.currentBalance)} remaining
												</p>
											</div>
											<div className="text-right">
												<p className="font-bold">
													{projection.monthsToPayoff} months
												</p>
												<p className="text-muted-foreground text-sm">
													{projection.payoffDate.toLocaleDateString()}
												</p>
											</div>
										</div>

										<div className="space-y-2">
											<div className="flex justify-between text-sm">
												<span>Progress</span>
												<span>{progressPercentage.toFixed(1)}%</span>
											</div>
											<div className="h-2 w-full rounded-full bg-gray-200">
												<div
													className="h-2 rounded-full bg-blue-600 transition-all duration-300"
													style={{ width: `${progressPercentage}%` }}
												/>
											</div>
											<div className="flex justify-between text-muted-foreground text-xs">
												<span>
													Total Interest:{" "}
													{formatCurrency(projection.totalInterestPaid)}
												</span>
												<span>
													Original Balance:{" "}
													{formatCurrency(debt.originalBalance)}
												</span>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</CardContent>
				)}
			</Card>
		</div>
	);
}

function StrategiesPageSkeleton() {
	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<Skeleton className="h-8 w-64" />
					<Skeleton className="mt-2 h-4 w-96" />
				</div>
				<div className="flex items-center gap-4">
					<Skeleton className="h-10 w-32" />
					<Skeleton className="h-10 w-48" />
				</div>
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

			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-48" />
				</CardHeader>
				<CardContent>
					<Skeleton className="h-64 w-full" />
				</CardContent>
			</Card>

			<div className="grid gap-6 lg:grid-cols-2">
				{[1, 2].map((i) => (
					<Card key={i}>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-80 w-full" />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
