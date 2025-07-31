"use client";

import { useEffect } from "react";
import DebtProgressCard from "~/components/progress/debt-progress-card";
import MilestoneTimeline from "~/components/progress/milestone-timeline";
import { api } from "~/trpc/react";

export default function ProgressPage() {
	const { data = [], refetch } = api.progress.getAll.useQuery();

	useEffect(() => {
		void refetch();
	}, [refetch]);

	return (
		<div className="space-y-6">
			<h1 className="font-bold text-3xl">Progress Overview</h1>
			{data.map((item) => (
				<div key={item.debt.id} className="space-y-2">
					<h2 className="font-semibold text-xl">{item.debt.name}</h2>
					<DebtProgressCard progress={item.progress} />
					<MilestoneTimeline milestones={item.milestones} />
				</div>
			))}
		</div>
	);
}
