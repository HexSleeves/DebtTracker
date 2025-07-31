"use client";

import type { DebtProgress } from "~/types";

export default function DebtProgressCard({
	progress,
}: {
	progress: DebtProgress;
}) {
	return (
		<div className="rounded border p-4">
			<p>{progress.percentagePaid.toFixed(1)}% paid</p>
			<p>${progress.remainingBalance.toFixed(2)} remaining</p>
		</div>
	);
}
