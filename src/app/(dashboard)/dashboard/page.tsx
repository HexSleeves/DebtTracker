import { Suspense } from "react";
import {
	DashboardSuspenseWrapper,
	UpcomingPaymentsSkeleton,
} from "~/components/suspense-wrapper";
import { api } from "~/trpc/server";
import { DashboardOverview } from "../_components/dashboard-overview";
import { QuickActions } from "../_components/quick-actions";
import { UpcomingPayments } from "../_components/upcoming-payments";

// Separate component for prefetching to enable streaming
async function DashboardOverviewWithData() {
	// Prefetch debt data for the dashboard overview
	void api.debt.getAll.prefetch();
	return <DashboardOverview />;
}

async function UpcomingPaymentsWithData() {
	// Prefetch debt data for upcoming payments
	void api.debt.getAll.prefetch();
	return <UpcomingPayments />;
}

export default async function DashboardPage() {
	// Enable streaming by using Suspense boundaries
	return (
		<div className="space-y-8">
			<div>
				<h2 className="font-bold text-3xl tracking-tight">Dashboard</h2>
				<p className="text-muted-foreground">
					Overview of your debt management progress
				</p>
			</div>

			{/* Stream dashboard overview separately */}
			<DashboardSuspenseWrapper>
				<DashboardOverviewWithData />
			</DashboardSuspenseWrapper>

			<div className="grid gap-8 md:grid-cols-2">
				{/* Stream upcoming payments */}
				<Suspense fallback={<UpcomingPaymentsSkeleton />}>
					<UpcomingPaymentsWithData />
				</Suspense>

				{/* Quick actions don't need data, so no suspense needed */}
				<QuickActions />
			</div>
		</div>
	);
}
