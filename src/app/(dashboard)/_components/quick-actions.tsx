"use client";

import { CreditCard, DollarSign, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DebtForm } from "~/components/forms/debt-form";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import type { TCreateDebt } from "~/routers/debt/debt.schema";
import { api } from "~/trpc/react";

export function QuickActions() {
	const [isDebtDialogOpen, setIsDebtDialogOpen] = useState(false);
	const utils = api.useUtils();

	const createDebt = api.debt.create.useMutation({
		onSuccess: () => {
			setIsDebtDialogOpen(false);
			void utils.debt.getAll.invalidate();
		},
	});

	const handleCreateDebt = (data: TCreateDebt) => {
		createDebt.mutate(data);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Plus className="h-5 w-5" />
					Quick Actions
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-3">
					<Dialog open={isDebtDialogOpen} onOpenChange={setIsDebtDialogOpen}>
						<DialogTrigger asChild>
							<Button className="w-full justify-start" variant="outline">
								<CreditCard className="mr-2 h-4 w-4" />
								Add New Debt
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-md">
							<DialogHeader>
								<DialogTitle>Add New Debt</DialogTitle>
								<DialogDescription>
									Enter the details of your debt to start tracking and
									optimizing your payments.
								</DialogDescription>
							</DialogHeader>
							<DebtForm
								onSubmit={handleCreateDebt}
								isLoading={createDebt.isPending}
							/>
						</DialogContent>
					</Dialog>

					<Link href="/dashboard/payments/new">
						<Button className="w-full justify-start" variant="outline">
							<DollarSign className="mr-2 h-4 w-4" />
							Log Payment
						</Button>
					</Link>

					<Link href="/dashboard/strategies">
						<Button className="w-full justify-start" variant="outline">
							<TrendingUp className="mr-2 h-4 w-4" />
							View Payment Strategies
						</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
