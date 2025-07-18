"use client";

import { Calendar, CreditCard, DollarSign, TrendingDown } from "lucide-react";
import { motion } from "motion/react";
import { memo, useMemo } from "react";
import { useRenderTime } from "~/components/performance-monitor";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatCurrency } from "~/lib/currency";
import { useDebtMetrics } from "~/lib/hooks/use-debt-strategy";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

export const DashboardQuickPreview = memo(function DashboardQuickPreview() {
	useRenderTime("DashboardQuickPreview");

	const { data: debts, isLoading } = api.debt.getAll.useQuery(undefined, {
		// Enhanced caching for dashboard data
		staleTime: 2 * 60 * 1000, // 2 minutes
		gcTime: 5 * 60 * 1000, // 5 minutes (was cacheTime)
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	});

	// Memoize animation variants to prevent recreation on each render
	const containerVariants = useMemo(
		() => ({
			hidden: { opacity: 0 },
			visible: {
				opacity: 1,
				transition: {
					staggerChildren: 0.1,
				},
			},
		}),
		[],
	);

	const cardVariants = useMemo(
		() => ({
			hidden: { opacity: 0, y: 20 },
			visible: {
				opacity: 1,
				y: 0,
				transition: {
					duration: 0.4,
					ease: [0.4, 0, 0.2, 1] as const,
				},
			},
		}),
		[],
	);

	// Use debt metrics hook for better calculations
	const debtMetrics = useDebtMetrics(debts ?? []);

	// Calculate upcoming payments
	const upcomingPayments = useMemo(() => {
		if (!debts) return 0;
		const today = new Date();
		return debts.filter((debt) => {
			if (!debt.dueDate) return false;
			const dueDate = new Date(debt.dueDate);
			const daysDiff = Math.ceil(
				(dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
			);
			return daysDiff >= 0 && daysDiff <= 7;
		}).length;
	}, [debts]);

	// Enhanced status calculation functions
	const getInterestRateStatus = (rate: number) => {
		if (rate >= 20)
			return {
				color: "text-error",
				bg: "bg-error/10",
				label: "Critical",
				severity: "critical",
			};
		if (rate >= 15)
			return {
				color: "text-error",
				bg: "bg-error/10",
				label: "High",
				severity: "high",
			};
		if (rate >= 10)
			return {
				color: "text-warning",
				bg: "bg-warning/10",
				label: "Moderate",
				severity: "moderate",
			};
		return {
			color: "text-success",
			bg: "bg-success/10",
			label: "Low",
			severity: "low",
		};
	};

	const getPaymentUrgencyStatus = (count: number) => {
		if (count === 0)
			return {
				color: "text-success",
				bg: "bg-success/10",
				label: "All Clear",
				severity: "low",
			};
		if (count <= 2)
			return {
				color: "text-info",
				bg: "bg-info/10",
				label: "Manageable",
				severity: "moderate",
			};
		if (count <= 4)
			return {
				color: "text-warning",
				bg: "bg-warning/10",
				label: "Busy Week",
				severity: "high",
			};
		return {
			color: "text-error",
			bg: "bg-error/10",
			label: "Critical",
			severity: "critical",
		};
	};

	const getDebtLoadStatus = (totalDebt: number) => {
		if (totalDebt === 0)
			return {
				color: "text-success",
				bg: "bg-success/10",
				label: "Debt Free",
				severity: "low",
			};
		if (totalDebt < 5000)
			return {
				color: "text-info",
				bg: "bg-info/10",
				label: "Light Load",
				severity: "moderate",
			};
		if (totalDebt < 25000)
			return {
				color: "text-warning",
				bg: "bg-warning/10",
				label: "Moderate Load",
				severity: "high",
			};
		return {
			color: "text-error",
			bg: "bg-error/10",
			label: "Heavy Load",
			severity: "critical",
		};
	};

	if (isLoading) {
		return (
			<motion.div
				className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				{["total-debt", "minimum-payment", "interest-rate", "due-week"].map(
					(skeletonId, _index) => (
						<motion.div key={skeletonId} variants={cardVariants}>
							<Card className="hover-lift animate-pulse">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="font-medium text-sm">
										<div className="h-4 w-24 rounded bg-muted" />
									</CardTitle>
									<div className="h-4 w-4 rounded bg-muted" />
								</CardHeader>
								<CardContent>
									<div className="mb-2 h-8 w-32 rounded bg-muted" />
									<div className="h-4 w-40 rounded bg-muted" />
								</CardContent>
							</Card>
						</motion.div>
					),
				)}
			</motion.div>
		);
	}

	const interestRateStatus = getInterestRateStatus(
		debtMetrics.weightedAverageInterestRate,
	);
	const paymentUrgencyStatus = getPaymentUrgencyStatus(upcomingPayments);
	const debtLoadStatus = getDebtLoadStatus(debtMetrics.totalDebt);

	return (
		<motion.div
			className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
		>
			{/* Total Debt */}
			<motion.div variants={cardVariants}>
				<Card className="hover-lift border-l-4 border-l-primary bg-gradient-to-br from-primary-50/50 to-transparent">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Total Debt</CardTitle>
						<div className="rounded-full bg-primary/10 p-2">
							<DollarSign className="h-4 w-4 text-primary" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between">
							<div className="font-bold text-2xl text-primary">
								{formatCurrency(debtMetrics.totalDebt)}
							</div>
							<Badge
								className={cn(
									"text-xs",
									debtLoadStatus.bg,
									debtLoadStatus.color,
								)}
							>
								{debtLoadStatus.label}
							</Badge>
						</div>
						<p className="mt-1 text-muted-foreground text-xs">
							Across {debts?.length ?? 0} debt
							{(debts?.length ?? 0) !== 1 ? "s" : ""}
						</p>
					</CardContent>
				</Card>
			</motion.div>

			{/* Monthly Minimum */}
			<motion.div variants={cardVariants}>
				<Card className="hover-lift border-l-4 border-l-info bg-gradient-to-br from-info-50/50 to-transparent">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Monthly Minimum
						</CardTitle>
						<div className="rounded-full bg-info/10 p-2">
							<CreditCard className="h-4 w-4 text-info" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-info">
							{formatCurrency(debtMetrics.totalMinimumPayments)}
						</div>
						<p className="mt-1 text-muted-foreground text-xs">
							Required monthly payment
						</p>
					</CardContent>
				</Card>
			</motion.div>

			{/* Average Interest Rate */}
			<motion.div variants={cardVariants}>
				<Card
					className={cn(
						"hover-lift border-l-4",
						interestRateStatus.severity === "critical"
							? "border-l-error bg-gradient-to-br from-error-50/50 to-transparent"
							: interestRateStatus.severity === "high"
								? "border-l-error bg-gradient-to-br from-error-50/30 to-transparent"
								: interestRateStatus.severity === "moderate"
									? "border-l-warning bg-gradient-to-br from-warning-50/50 to-transparent"
									: "border-l-success bg-gradient-to-br from-success-50/50 to-transparent",
					)}
				>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Average Interest Rate
						</CardTitle>
						<div className={cn("rounded-full p-2", interestRateStatus.bg)}>
							<TrendingDown
								className={cn("h-4 w-4", interestRateStatus.color)}
							/>
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between">
							<div
								className={cn("font-bold text-2xl", interestRateStatus.color)}
							>
								{debtMetrics.weightedAverageInterestRate.toFixed(1)}%
							</div>
							<Badge
								className={cn(
									"text-xs",
									interestRateStatus.bg,
									interestRateStatus.color,
								)}
							>
								{interestRateStatus.label}
							</Badge>
						</div>
						<p className="mt-1 text-muted-foreground text-xs">
							Weighted average APR
						</p>
					</CardContent>
				</Card>
			</motion.div>

			{/* Due This Week */}
			<motion.div variants={cardVariants}>
				<Card
					className={cn(
						"hover-lift border-l-4",
						paymentUrgencyStatus.severity === "critical"
							? "border-l-error bg-gradient-to-br from-error-50/50 to-transparent"
							: paymentUrgencyStatus.severity === "high"
								? "border-l-warning bg-gradient-to-br from-warning-50/50 to-transparent"
								: paymentUrgencyStatus.severity === "moderate"
									? "border-l-info bg-gradient-to-br from-info-50/50 to-transparent"
									: "border-l-success bg-gradient-to-br from-success-50/50 to-transparent",
					)}
				>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Due This Week</CardTitle>
						<div className={cn("rounded-full p-2", paymentUrgencyStatus.bg)}>
							<Calendar className={cn("h-4 w-4", paymentUrgencyStatus.color)} />
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between">
							<div
								className={cn("font-bold text-2xl", paymentUrgencyStatus.color)}
							>
								{upcomingPayments}
							</div>
							<Badge
								className={cn(
									"text-xs",
									paymentUrgencyStatus.bg,
									paymentUrgencyStatus.color,
								)}
							>
								{paymentUrgencyStatus.label}
							</Badge>
						</div>
						<p className="mt-1 text-muted-foreground text-xs">
							Payment{upcomingPayments !== 1 ? "s" : ""} due within 7 days
						</p>
					</CardContent>
				</Card>
			</motion.div>
		</motion.div>
	);
});
