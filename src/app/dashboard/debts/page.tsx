"use client";

import {
	AlertTriangle,
	CheckCircle,
	CreditCard,
	TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import DebtDialog from "~/components/dialogs/debt-dialog";
import { DebtForm } from "~/components/forms/debt-form";
import { StatCard } from "~/components/stats-card";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { formatCurrency } from "~/lib/currency";
import type {
	TCreateDebt,
	TUpdateDebt,
} from "~/server/api/routers/debt/debt.schema";
import { api } from "~/trpc/react";
import type { Debt, TDebtStats } from "~/types/db.helpers";
import { DebtTable } from "../_components/debt-table";

export default function DebtsPage() {
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
	const [deletingDebtId, setDeletingDebtId] = useState<string | null>(null);

	const utils = api.useUtils();
	const { data: debts = [], isLoading } = api.debt.getAll.useQuery();

	const {
		data: debtStats = {
			totalDebt: 0,
			totalAccounts: 0,
			paidCount: 0,
			overdueCount: 0,
			highInterestCount: 0,
			totalPaid: 0,
			totalOverdue: 0,
			totalHighInterest: 0,
		} as TDebtStats,
	} = api.debt.getStats.useQuery();

	const updateDebtMutation = api.debt.update.useMutation({
		onSuccess: (data, _variables) => {
			utils.debt.getAll.setData(undefined, (old = []) =>
				old.map((debt) => (debt.id === data.id ? data : debt)),
			);

			toast.success("Debt updated successfully");
			setEditingDebt(null);
			void utils.debt.getAll.invalidate();
		},
		onError: (error) => {
			toast.error(`Failed to update debt: ${error.message}`);
		},
	});

	const deleteDebtMutation = api.debt.delete.useMutation({
		onSuccess: (_, variables) => {
			utils.debt.getAll.setData(undefined, (old = []) =>
				old.filter((debt) => debt.id !== variables.id),
			);

			toast.success("Debt deleted successfully");
			setDeletingDebtId(null);
		},
		onError: (error) => {
			toast.error(`Failed to delete debt: ${error.message}`);
		},
		onSettled: () => {
			void utils.debt.getAll.invalidate();
		},
	});

	const handleUpdateDebt = (values: TCreateDebt) => {
		if (!editingDebt) return;

		const updateData: TUpdateDebt = {
			id: editingDebt.id,
			...values,
		};

		updateDebtMutation.mutate(updateData);
	};

	const handleDeleteDebt = (id: string) => {
		deleteDebtMutation.mutate({ id });
	};

	useEffect(() => {
		const fetchDebts = async () => {
			const res = await fetch("/api/debts");
			const data = (await res.json()) as Debt[];
			console.log(data);
		};

		void fetchDebts();
	}, []);

	if (isLoading) {
		return (
			<div className="space-y-8">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<h1 className="font-bold text-3xl tracking-tight">Debts</h1>
						<p className="text-muted-foreground">
							Manage your debts and track your progress
						</p>
					</div>
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="animate-pulse">
							<div className="h-32 rounded-lg bg-muted" />
						</div>
					))}
				</div>
				<div className="animate-pulse">
					<div className="mb-4 h-10 rounded bg-muted" />
					<div className="h-64 rounded bg-muted" />
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Header Section */}
			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<h1 className="font-bold text-3xl tracking-tight">Debt Overview</h1>
					<p className="text-muted-foreground">
						Track your debts and monitor your financial progress
					</p>
				</div>

				<DebtDialog
					isOpen={isAddDialogOpen}
					onOpenChangeAction={setIsAddDialogOpen}
				/>
			</div>

			{/* Statistics Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<StatCard
					color="blue"
					trend="neutral"
					title="Total Debt"
					className="hover-lift"
					icon={<CreditCard className="h-6 w-6" />}
					value={formatCurrency(debtStats.totalDebt)}
					subtitle={`${debtStats.totalAccounts} accounts`}
				/>

				<StatCard
					trend="up"
					color="green"
					title="Paid Off"
					className="hover-lift"
					icon={<CheckCircle className="h-6 w-6" />}
					subtitle={`${debtStats.paidCount} accounts`}
					value={formatCurrency(Math.abs(debtStats.totalPaid))}
				/>

				<StatCard
					trend="down"
					color="amber"
					title="High Interest"
					className="hover-lift"
					icon={<TrendingUp className="h-6 w-6" />}
					value={formatCurrency(debtStats.totalHighInterest)}
					subtitle={`${debtStats.highInterestCount} accounts`}
				/>

				<StatCard
					color="red"
					title="Overdue"
					className="hover-lift"
					icon={<AlertTriangle className="h-6 w-6" />}
					value={formatCurrency(debtStats.totalOverdue)}
					subtitle={`${debtStats.overdueCount} payments`}
					trend={debtStats.overdueCount > 0 ? "up" : "neutral"}
				/>
			</div>

			{/* Debt Table */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="font-semibold text-xl">Your Debts</h2>
					{debts.length > 0 && (
						<p className="text-muted-foreground text-sm">
							{debts.length} debt{debts.length !== 1 ? "s" : ""} tracked
						</p>
					)}
				</div>

				<DebtTable
					debts={debts}
					setIsAddDialogOpen={setIsAddDialogOpen}
					setEditingDebt={setEditingDebt}
					setDeletingDebtId={setDeletingDebtId}
				/>
			</div>

			{/* Edit Debt Dialog */}
			<Dialog
				open={editingDebt !== null}
				onOpenChange={(open) => !open && setEditingDebt(null)}
			>
				<DialogContent className="border-l-4 border-l-warning sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-warning">
							<CreditCard className="h-5 w-5" />
							Edit Debt
						</DialogTitle>
						<DialogDescription>
							Update the details of your debt to keep your tracking accurate.
						</DialogDescription>
					</DialogHeader>
					{editingDebt && (
						<DebtForm
							onSubmitAction={handleUpdateDebt}
							isLoading={updateDebtMutation.isPending}
							defaultValues={{
								name: editingDebt.name,
								type: editingDebt.type as
									| "credit_card"
									| "loan"
									| "mortgage"
									| "other",
								balance: editingDebt.balance,
								originalBalance: editingDebt.originalBalance,
								interestRate: editingDebt.interestRate,
								minimumPayment: editingDebt.minimumPayment,
								dueDate: editingDebt.dueDate ?? undefined,
							}}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deletingDebtId !== null}
				onOpenChange={(open) => !open && setDeletingDebtId(null)}
			>
				<DialogContent className="border-l-4 border-l-error">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-error">
							<AlertTriangle className="h-5 w-5" />
							Delete Debt
						</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this debt? This action cannot be
							undone and will also delete all associated payment history.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2">
						<Button
							variant="outline"
							onClick={() => setDeletingDebtId(null)}
							disabled={deleteDebtMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							className="interactive-error hover-lift"
							onClick={() => deletingDebtId && handleDeleteDebt(deletingDebtId)}
							disabled={deleteDebtMutation.isPending}
						>
							{deleteDebtMutation.isPending ? "Deleting..." : "Delete Debt"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
