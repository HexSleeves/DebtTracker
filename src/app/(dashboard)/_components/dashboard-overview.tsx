"use client";

import { motion } from "framer-motion";
import { Calendar, CreditCard, DollarSign, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";

export function DashboardOverview() {
	const { data: debts, isLoading } = api.debt.getAll.useQuery();

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const cardVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.4,
				ease: [0.4, 0, 0.2, 1] as const,
			},
		},
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
					(skeletonId, index) => (
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

	const totalDebt = debts?.reduce((sum, debt) => sum + debt.balance, 0) ?? 0;
	const totalMinimumPayment =
		debts?.reduce((sum, debt) => sum + debt.minimumPayment, 0) ?? 0;
	const averageInterestRate = debts?.length
		? debts.reduce((sum, debt) => sum + debt.interestRate, 0) / debts.length
		: 0;
	const upcomingPayments =
		debts?.filter((debt) => {
			if (!debt.dueDate) return false;
			const today = new Date();
			const dueDate = new Date(debt.dueDate);
			const daysDiff = Math.ceil(
				(dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
			);
			return daysDiff >= 0 && daysDiff <= 7;
		}).length ?? 0;

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
}
