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
		<div className="rounded-lg border border-border-primary bg-surface-primary p-6 transition-theme">
			<h2 className="mb-6 flex items-center font-semibold text-xl">
				<CreditCard className="mr-2 h-5 w-5" />
				Debts
			</h2>
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-border-primary border-b">
							<th className="px-4 py-3 text-left font-medium text-text-primary">
								Name
							</th>
							<th className="px-4 py-3 text-left font-medium text-text-primary">
								Type
							</th>
							<th className="px-4 py-3 text-right font-medium text-text-primary">
								Balance
							</th>
							<th className="px-4 py-3 text-right font-medium text-text-primary">
								Interest Rate
							</th>
							<th className="px-4 py-3 text-right font-medium text-text-primary">
								Min Payment
							</th>
							<th className="px-4 py-3 text-right font-medium text-text-primary">
								Due Date
							</th>
						</tr>
					</thead>
					<tbody>
						{debts.map((debt) => (
							<tr
								key={debt.id}
								className="border-border-primary border-b transition-theme hover:bg-surface-secondary"
							>
								<td className="px-4 py-3 font-medium text-text-primary">
									{debt.name}
								</td>
								<td className="px-4 py-3 text-sm text-text-secondary capitalize">
									{debt.type.replace("_", " ")}
								</td>
								<td className="px-4 py-3 text-right font-medium text-text-primary">
									{formatCurrency(debt.balance)}
								</td>
								<td className="px-4 py-3 text-right text-text-primary">
									{formatPercentage(debt.interestRate)}
								</td>
								<td className="px-4 py-3 text-right text-text-primary">
									{formatCurrency(debt.minimumPayment)}
								</td>
								<td className="px-4 py-3 text-right text-text-primary">
									{debt.dueDate?.toLocaleDateString() ?? "N/A"}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
