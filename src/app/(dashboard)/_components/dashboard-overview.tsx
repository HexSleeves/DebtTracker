"use client";

import { motion } from "framer-motion";
import { Calendar, CreditCard, DollarSign, TrendingDown } from "lucide-react";
import { memo, useMemo } from "react";
import { useRenderTime } from "~/components/performance-monitor";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";

export const DashboardOverview = memo(function DashboardOverview() {
	useRenderTime("DashboardOverview");

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

	// Memoize calculations to prevent unnecessary recalculations
	const calculations = useMemo(() => {
		if (!debts)
			return {
				totalDebt: 0,
				totalMinimumPayment: 0,
				averageInterestRate: 0,
				upcomingPayments: 0,
			};

		const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
		const totalMinimumPayment = debts.reduce(
			(sum, debt) => sum + debt.minimumPayment,
			0,
		);
		const averageInterestRate = debts.length
			? debts.reduce((sum, debt) => sum + debt.interestRate, 0) / debts.length
			: 0;

		const today = new Date();
		const upcomingPayments = debts.filter((debt) => {
			if (!debt.dueDate) return false;
			const dueDate = new Date(debt.dueDate);
			const daysDiff = Math.ceil(
				(dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
			);
			return daysDiff >= 0 && daysDiff <= 7;
		}).length;

		return {
			totalDebt,
			totalMinimumPayment,
			averageInterestRate,
			upcomingPayments,
		};
	}, [debts]);

	const {
		totalDebt,
		totalMinimumPayment,
		averageInterestRate,
		upcomingPayments,
	} = calculations;

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
							<Card className="animate-pulse">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="font-medium text-sm">
										<div className="h-4 w-24 rounded bg-gray-200" />
									</CardTitle>
									<div className="h-4 w-4 rounded bg-gray-200" />
								</CardHeader>
								<CardContent>
									<div className="mb-2 h-8 w-32 rounded bg-gray-200" />
									<div className="h-4 w-40 rounded bg-gray-200" />
								</CardContent>
							</Card>
						</motion.div>
					),
				)}
			</motion.div>
		);
	}

	return (
		<motion.div
			className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
		>
			<motion.div variants={cardVariants}>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Total Debt</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							${totalDebt.toLocaleString("en-US", { minimumFractionDigits: 2 })}
						</div>
						<p className="text-muted-foreground text-xs">
							Across {debts?.length ?? 0} debt{debts?.length !== 1 ? "s" : ""}
						</p>
					</CardContent>
				</Card>
			</motion.div>

			<motion.div variants={cardVariants}>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Monthly Minimum
						</CardTitle>
						<CreditCard className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							$
							{totalMinimumPayment.toLocaleString("en-US", {
								minimumFractionDigits: 2,
							})}
						</div>
						<p className="text-muted-foreground text-xs">
							Required monthly payment
						</p>
					</CardContent>
				</Card>
			</motion.div>

			<motion.div variants={cardVariants}>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Average Interest Rate
						</CardTitle>
						<TrendingDown className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{averageInterestRate.toFixed(1)}%
						</div>
						<p className="text-muted-foreground text-xs">
							Weighted average APR
						</p>
					</CardContent>
				</Card>
			</motion.div>

			<motion.div variants={cardVariants}>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Due This Week</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{upcomingPayments}</div>
						<p className="text-muted-foreground text-xs">
							Payment{upcomingPayments !== 1 ? "s" : ""} due within 7 days
						</p>
					</CardContent>
				</Card>
			</motion.div>
		</motion.div>
	);
});
