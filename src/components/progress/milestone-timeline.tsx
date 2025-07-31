"use client";

import type { DebtMilestone } from "~/types";

export default function MilestoneTimeline({
	milestones,
}: {
	milestones: DebtMilestone[];
}) {
	return (
		<ul className="space-y-2">
			{milestones.map((m) => (
				<li key={m.id}>
					{m.milestoneType} - {m.achievedDate.toDateString()}
				</li>
			))}
		</ul>
	);
}
