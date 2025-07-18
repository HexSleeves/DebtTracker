import { Skeleton } from "~/components/ui/skeleton";

export default function DashboardLoading() {
	return (
		<div className="fade-in animate-in space-y-8 duration-200">
			{/* Header skeleton */}
			<div className="space-y-2">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-4 w-64" />
			</div>

			{/* Dashboard overview skeleton */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{["skel-1", "skel-2", "skel-3", "skel-4"].map((skel) => (
					<div key={skel} className="rounded-lg border bg-card p-6 shadow-sm">
						<div className="flex items-center justify-between space-y-0 pb-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-4" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-8 w-32" />
							<Skeleton className="h-3 w-40" />
						</div>
					</div>
				))}
			</div>

			{/* Bottom section skeleton */}
			<div className="grid gap-8 md:grid-cols-2">
				{/* Upcoming payments skeleton */}
				<div className="rounded-lg border bg-card p-6 shadow-sm">
					<div className="flex items-center gap-2 pb-4">
						<Skeleton className="h-5 w-5" />
						<Skeleton className="h-5 w-32" />
					</div>
					<div className="space-y-3">
						{["skel-1", "skel-2", "skel-3"].map((skel) => (
							<div
								key={skel}
								className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
							>
								<div className="flex items-center gap-3">
									<Skeleton className="h-8 w-8 rounded-full" />
									<div className="space-y-1">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-3 w-16" />
									</div>
								</div>
								<div className="space-y-1 text-right">
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-3 w-12" />
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Quick actions skeleton */}
				<div className="rounded-lg border bg-card p-6 shadow-sm">
					<div className="flex items-center gap-2 pb-4">
						<Skeleton className="h-5 w-5" />
						<Skeleton className="h-5 w-24" />
					</div>
					<div className="space-y-3">
						{["skel-1", "skel-2", "skel-3"].map((skel) => (
							<Skeleton key={skel} className="h-10 w-full" />
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
