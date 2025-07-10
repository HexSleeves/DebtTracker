"use client";

import { Calendar, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";

export function UpcomingPayments() {
	const { data: debts, isLoading } = api.debt.getAll.useQuery();

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Upcoming Payments
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{["skeleton-1", "skeleton-2", "skeleton-3"].map((skeletonId) => (
							<div
								key={skeletonId}
								className="flex animate-pulse items-center justify-between rounded-lg bg-gray-50 p-3"
							>
								<div className="flex items-center gap-3">
									<div className="h-8 w-8 rounded-full bg-gray-200" />
									<div>
										<div className="mb-1 h-4 w-24 rounded bg-gray-200" />
										<div className="h-3 w-16 rounded bg-gray-200" />
									</div>
								</div>
								<div className="text-right">
									<div className="mb-1 h-4 w-16 rounded bg-gray-200" />
									<div className="h-3 w-12 rounded bg-gray-200" />
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	const upcomingPayments =
		debts
			?.map((debt) => {
				if (!debt.dueDate) return null;
				const today = new Date();
				const dueDate = new Date(debt.dueDate);
				const daysDiff = Math.ceil(
					(dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
				);

				return {
					...debt,
					daysDiff,
					isOverdue: daysDiff < 0,
					isDueSoon: daysDiff >= 0 && daysDiff <= 7,
				};
			})
			.filter(
				(debt): debt is NonNullable<typeof debt> =>
					debt !== null && (debt.isOverdue || debt.isDueSoon),
			)
			.sort((a, b) => a.daysDiff - b.daysDiff)
			.slice(0, 5) ?? [];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Calendar className="h-5 w-5" />
					Upcoming Payments
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{upcomingPayments.length === 0 ? (
						<p className="py-4 text-center text-muted-foreground">
							No payments due in the next 7 days
						</p>
					) : (
						upcomingPayments.map((debt) => (
							<div
								key={debt.id}
								className={`flex items-center justify-between rounded-lg p-3 ${
									debt.isOverdue
										? "border border-red-200 bg-red-50"
										: "border border-gray-200 bg-gray-50"
								}`}
							>
								<div className="flex items-center gap-3">
									<CreditCard
										className={`h-8 w-8 ${
											debt.isOverdue ? "text-red-500" : "text-blue-500"
										}`}
									/>
									<div>
										<h4 className="font-medium text-sm">{debt.name}</h4>
										<p className="text-muted-foreground text-xs">{debt.type}</p>
									</div>
								</div>
								<div className="text-right">
									<p className="font-medium text-sm">
										$
										{debt.minimumPayment.toLocaleString("en-US", {
											minimumFractionDigits: 2,
										})}
									</p>
									<p
										className={`text-xs ${
											debt.isOverdue
												? "text-red-600"
												: debt.daysDiff === 0
													? "text-orange-600"
													: "text-muted-foreground"
										}`}
									>
										{debt.isOverdue
											? `${Math.abs(debt.daysDiff)} day${Math.abs(debt.daysDiff) !== 1 ? "s" : ""} overdue`
											: debt.daysDiff === 0
												? "Due today"
												: `Due in ${debt.daysDiff} day${debt.daysDiff !== 1 ? "s" : ""}`}
									</p>
								</div>
							</div>
						))
					)}
				</div>
			</CardContent>
		</Card>
	);
}
