import { api } from "~/trpc/server";
import { DashboardOverview } from "../_components/dashboard-overview";
import { QuickActions } from "../_components/quick-actions";
import { UpcomingPayments } from "../_components/upcoming-payments";

export default async function DashboardPage() {
	// Prefetch debt data for the dashboard
	void api.debt.getAll.prefetch();

	return (
		<div className="space-y-8">
			<div>
				<h2 className="font-bold text-3xl tracking-tight">Dashboard</h2>
				<p className="text-muted-foreground">
					Overview of your debt management progress
				</p>
			</div>

			<DashboardOverview />

			<div className="grid gap-8 md:grid-cols-2">
				<UpcomingPayments />
				<QuickActions />
			</div>
		</div>
	);
}
