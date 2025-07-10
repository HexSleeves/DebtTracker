"use client";

import { CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { useState } from "react";
import FloatingActionButton, {
	type ActionItem,
} from "~/components/floating-action-button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import type { TCreateDebt } from "~/routers/debt/debt.schema";
import type { TCreatePayment } from "~/routers/payment/payment.schema";
import { api } from "~/trpc/react";
import { DebtForm } from "./forms/debt-form";
import { PaymentForm } from "./forms/payment-form";

export function QuickActions() {
	const utils = api.useUtils();
	const [isDebtDialogOpen, setIsDebtDialogOpen] = useState(false);
	const [isLogPaymentDialogOpen, setIsLogPaymentDialogOpen] = useState(false);

	const debts = api.debt.getAll.useQuery();

	const createDebt = api.debt.create.useMutation({
		onSuccess: () => {
			setIsDebtDialogOpen(false);
			void utils.debt.getAll.invalidate();
		},
	});
	const createPayment = api.payment.create.useMutation({
		onSuccess: () => {
			setIsLogPaymentDialogOpen(false);
			void utils.payment.getAll.invalidate();
		},
	});

	const handleCreateDebt = (data: TCreateDebt) => {
		createDebt.mutate(data);
	};
	const handleLogPayment = (data: TCreatePayment) => {
		createPayment.mutate(data);
	};

	const actionItems: ActionItem[] = [
		{
			icon: <CreditCard size={20} />,
			label: "Add New Debt",
			onClick: (ctx) => {
				ctx.setIsOpen(false);
				setIsDebtDialogOpen(true);
			},
			color: "bg-blue-500 hover:bg-blue-600",
		},
		{
			icon: <DollarSign size={20} />,
			label: "Log Payment",
			onClick: (ctx) => {
				ctx.setIsOpen(false);
				setIsLogPaymentDialogOpen(true);
			},
			color: "bg-green-500 hover:bg-green-600",
		},
		{
			icon: <TrendingUp size={20} />,
			label: "View Strategies",
			href: "/dashboard/strategies",
			color: "bg-purple-500 hover:bg-purple-600",
		},
	];

	return (
		<>
			<FloatingActionButton actionItems={actionItems} />

			{/* Add Debt Dialog */}
			<Dialog open={isDebtDialogOpen} onOpenChange={setIsDebtDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Add New Debt</DialogTitle>
						<DialogDescription>
							Enter the details of your debt to start tracking and optimizing
							your payments.
						</DialogDescription>
					</DialogHeader>
					<DebtForm
						onSubmit={handleCreateDebt}
						isLoading={createDebt.isPending}
					/>
				</DialogContent>
			</Dialog>

			{/* Log Payment Dialog */}
			<Dialog
				open={isLogPaymentDialogOpen}
				onOpenChange={setIsLogPaymentDialogOpen}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Log Payment</DialogTitle>
						<DialogDescription>
							Enter the details of your payment to start tracking and optimizing
							your payments.
						</DialogDescription>
					</DialogHeader>
					<PaymentForm
						debts={debts.data ?? []}
						onSubmit={handleLogPayment}
						isLoading={createPayment.isPending}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
