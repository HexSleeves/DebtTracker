import { Suspense } from "react";
import {
	DashboardSuspenseWrapper,
	UpcomingPaymentsSkeleton,
} from "~/components/suspense-wrapper";
import { api, HydrateClient } from "~/trpc/server";
import { QuickActions } from "./_components/quick-actions";
import { DashboardQuickPreview } from "./_components/quick-preview";
import { UpcomingPayments } from "./_components/upcoming-payments";

// Separate component for prefetching to enable streaming
async function DashboardQuickPreviewWithData() {
	// Prefetch debt data for the dashboard overview
	void api.debt.getAll.prefetch();
	return <DashboardQuickPreview />;
}

async function UpcomingPaymentsWithData() {
	// Prefetch debt data for upcoming payments
	void api.debt.getAll.prefetch();
	return <UpcomingPayments />;
}

export default async function DashboardPage() {
	// Enable streaming by using Suspense boundaries
	return (
		<HydrateClient>
			<div className="space-y-8">
				<div>
					<h2 className="font-bold text-3xl tracking-tight">Dashboard</h2>
					<p className="text-muted-foreground">
						Overview of your debt management progress
					</p>
				</div>

				{/* Stream dashboard overview separately */}
				<DashboardSuspenseWrapper>
					<DashboardQuickPreviewWithData />
				</DashboardSuspenseWrapper>

				{/* Stream upcoming payments */}
				<Suspense fallback={<UpcomingPaymentsSkeleton />}>
					<UpcomingPaymentsWithData />
				</Suspense>
			</div>

			<QuickActions />
		</HydrateClient>
	);
}
