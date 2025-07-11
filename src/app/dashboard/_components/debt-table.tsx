"use client";

import { CreditCard } from "lucide-react";
import { DashboardCardSkeleton } from "~/components/suspense-wrapper";
import { formatCurrency } from "~/lib/currency";
import { formatPercentage } from "~/lib/utils";
import { api } from "~/trpc/react";

export function DebtTableSkeleton() {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{["skel-1", "skel-2", "skel-3", "skel-4"].map((skel) => (
				<DashboardCardSkeleton key={skel} />
			))}
		</div>
	);
}

export function DebtTable() {
	const utils = api.useUtils();
	const debts = utils.debt.getAll.getData() ?? [];

	return (
		<div className="hover-lift rounded-lg border bg-card p-6 shadow-sm">
			<h2 className="mb-6 flex items-center font-semibold text-xl">
				<CreditCard className="mr-2 h-5 w-5 text-primary" />
				Debts
			</h2>
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-border border-b">
							<th className="px-4 py-3 text-left font-medium text-foreground">
								Name
							</th>
							<th className="px-4 py-3 text-left font-medium text-foreground">
								Type
							</th>
							<th className="px-4 py-3 text-right font-medium text-foreground">
								Balance
							</th>
							<th className="px-4 py-3 text-right font-medium text-foreground">
								Interest Rate
							</th>
							<th className="px-4 py-3 text-right font-medium text-foreground">
								Min Payment
							</th>
							<th className="px-4 py-3 text-right font-medium text-foreground">
								Due Date
							</th>
						</tr>
					</thead>
					<tbody>
						{debts.map((debt) => {
							// Determine interest rate color
							const interestRateColor =
								debt.interestRate >= 15
									? "text-error"
									: debt.interestRate >= 8
										? "text-warning"
										: "text-success";

							// Check if payment is due soon
							const isDueSoon =
								debt.dueDate &&
								(() => {
									const today = new Date();
									const dueDate = new Date(debt.dueDate);
									const daysDiff = Math.ceil(
										(dueDate.getTime() - today.getTime()) /
											(1000 * 60 * 60 * 24),
									);
									return daysDiff <= 7 && daysDiff >= 0;
								})();

							return (
								<tr
									key={debt.id}
									className="border-border border-b transition-colors hover:bg-muted/50"
								>
									<td className="px-4 py-3 font-medium text-foreground">
										{debt.name}
									</td>
									<td className="px-4 py-3 text-muted-foreground text-sm capitalize">
										{debt.type.replace("_", " ")}
									</td>
									<td className="px-4 py-3 text-right font-medium font-mono text-foreground">
										{formatCurrency(debt.balance)}
									</td>
									<td
										className={`px-4 py-3 text-right font-medium ${interestRateColor}`}
									>
										{formatPercentage(debt.interestRate)}
									</td>
									<td className="px-4 py-3 text-right font-mono text-foreground">
										{formatCurrency(debt.minimumPayment)}
									</td>
									<td
										className={`px-4 py-3 text-right ${
											isDueSoon ? "font-medium text-warning" : "text-foreground"
										}`}
									>
										{debt.dueDate?.toLocaleDateString() ?? "N/A"}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
