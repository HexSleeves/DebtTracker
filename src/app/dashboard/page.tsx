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
        {/* Enhanced Header Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-primary rounded-lg p-2">
              <div className="bg-primary-foreground/20 h-6 w-6 rounded" />
            </div>
            <div>
              <h1 className="text-primary text-3xl font-bold tracking-tight">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Overview of your debt management progress
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Overview Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Financial Overview</h2>
            <div className="bg-gradient-primary h-1 w-16 rounded-full" />
          </div>

          {/* Stream dashboard overview separately */}
          <DashboardSuspenseWrapper>
            <DashboardQuickPreviewWithData />
          </DashboardSuspenseWrapper>
        </div>

        {/* Enhanced Upcoming Payments Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Payment Schedule</h2>
            <div className="bg-gradient-warning h-1 w-16 rounded-full" />
          </div>

          {/* Stream upcoming payments */}
          <Suspense fallback={<UpcomingPaymentsSkeleton />}>
            <UpcomingPaymentsWithData />
          </Suspense>
        </div>
      </div>

      <QuickActions />
    </HydrateClient>
  );
}
