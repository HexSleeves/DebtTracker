"use client";

import {
	ArrowDown,
	ArrowUp,
	CreditCard,
	Edit,
	MoreVertical,
	Plus,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { formatCurrency } from "~/lib/currency";
import { useAuthGuard } from "~/lib/hooks/use-auth-guard";
import { formatPercentage } from "~/lib/utils";
import type {
	TCreateDebt,
	TUpdateDebt,
} from "~/server/api/routers/debt/debt.schema";
import { api } from "~/trpc/react";
import { DebtForm } from "../_components/forms/debt-form";

type SortField =
	| "name"
	| "balance"
	| "interestRate"
	| "minimumPayment"
	| "dueDate";
type SortDirection = "asc" | "desc";

export default function DebtsPage() {
	const [sortField, setSortField] = useState<SortField>("name");
	const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [editingDebt, setEditingDebt] = useState<{
		id: string;
		name: string;
		type: string;
		balance: number;
		interestRate: number;
		minimumPayment: number;
		dueDate?: Date | null;
	} | null>(null);
	const { user } = useAuthGuard();
	const [deletingDebtId, setDeletingDebtId] = useState<string | null>(null);

	const utils = api.useUtils();
	const { data: debts = [], isLoading } = api.debt.getAll.useQuery();

	const createDebtMutation = api.debt.create.useMutation({
		onMutate: async (newDebt) => {
			await utils.debt.getAll.cancel();

			const optimisticDebt = {
				id: `temp-${Date.now()}`,
				...newDebt,
				createdAt: new Date(),
				updatedAt: new Date(),
				userId: user.id,
				dueDate: newDebt.dueDate ?? null,
			};

			return { optimisticDebt };
		},
		onSuccess: (_data, _variables, { optimisticDebt }) => {
			utils.debt.getAll.setData(undefined, (old = []) => [
				...old,
				optimisticDebt,
			]);

			toast.success("Debt added successfully");
			setIsAddDialogOpen(false);
		},
		onError: (error) => {
			toast.error(`Failed to add debt: ${error.message}`);
		},
		onSettled: () => {
			void utils.debt.getAll.invalidate();
		},
	});

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

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	const sortedDebts = [...debts].sort((a, b) => {
		const aValue = a[sortField];
		const bValue = b[sortField];

		if (aValue === undefined || aValue === null) return 1;
		if (bValue === undefined || bValue === null) return -1;

		let comparison = 0;
		if (aValue < bValue) comparison = -1;
		if (aValue > bValue) comparison = 1;

		return sortDirection === "asc" ? comparison : -comparison;
	});

	const handleCreateDebt = (values: TCreateDebt) => {
		createDebtMutation.mutate(values);
	};

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

	const SortableHeader = ({
		field,
		children,
		className = "",
	}: {
		field: SortField;
		children: React.ReactNode;
		className?: string;
	}) => (
		<TableHead
			className={`cursor-pointer select-none hover:bg-muted/50 ${className}`}
			onClick={() => handleSort(field)}
		>
			<div className="flex items-center gap-2">
				{children}
				{sortField === field && (
					<div className="flex flex-col">
						{sortDirection === "asc" ? (
							<ArrowUp className="h-3 w-3" />
						) : (
							<ArrowDown className="h-3 w-3" />
						)}
					</div>
				)}
			</div>
		</TableHead>
	);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="font-bold text-3xl tracking-tight">Debts</h1>
						<p className="text-muted-foreground">
							Manage your debts and track your progress
						</p>
					</div>
				</div>
				<div className="animate-pulse space-y-4">
					<div className="h-10 rounded bg-muted" />
					<div className="h-64 rounded bg-muted" />
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Debts</h1>
					<p className="text-muted-foreground">
						Manage your debts and track your progress
					</p>
				</div>

				<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Add Debt
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Add New Debt</DialogTitle>
							<DialogDescription>
								Enter the details of your new debt to start tracking it.
							</DialogDescription>
						</DialogHeader>
						<DebtForm
							onSubmit={handleCreateDebt}
							isLoading={createDebtMutation.isPending}
						/>
					</DialogContent>
				</Dialog>
			</div>

			{debts.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<CreditCard className="mb-4 h-12 w-12 text-muted-foreground" />
					<h3 className="mb-2 font-semibold text-lg">No debts tracked yet</h3>
					<p className="mb-4 text-muted-foreground">
						Start by adding your first debt to begin tracking your progress.
					</p>
					<Button onClick={() => setIsAddDialogOpen(true)}>
						<Plus className="mr-2 h-4 w-4" />
						Add Your First Debt
					</Button>
				</div>
			) : (
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<SortableHeader field="name">Name</SortableHeader>
								<TableHead>Type</TableHead>
								<SortableHeader field="balance" className="text-right">
									Balance
								</SortableHeader>
								<SortableHeader field="interestRate" className="text-right">
									Interest Rate
								</SortableHeader>
								<SortableHeader field="minimumPayment" className="text-right">
									Min Payment
								</SortableHeader>
								<SortableHeader field="dueDate" className="text-right">
									Due Date
								</SortableHeader>
								<TableHead className="w-[50px]" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{sortedDebts.map((debt) => (
								<TableRow key={debt.id}>
									<TableCell className="font-medium">{debt.name}</TableCell>
									<TableCell className="capitalize">
										{debt.type.replace("_", " ")}
									</TableCell>
									<TableCell className="text-right font-mono">
										{formatCurrency(debt.balance)}
									</TableCell>
									<TableCell className="text-right">
										{formatPercentage(debt.interestRate)}
									</TableCell>
									<TableCell className="text-right font-mono">
										{formatCurrency(debt.minimumPayment)}
									</TableCell>
									<TableCell className="text-right">
										{debt.dueDate?.toLocaleDateString() ?? "N/A"}
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm">
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => setEditingDebt(debt)}>
													<Edit className="mr-2 h-4 w-4" />
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => setDeletingDebtId(debt.id)}
													className="text-destructive"
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			{/* Edit Debt Dialog */}
			<Dialog
				open={editingDebt !== null}
				onOpenChange={(open) => !open && setEditingDebt(null)}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Edit Debt</DialogTitle>
						<DialogDescription>
							Update the details of your debt.
						</DialogDescription>
					</DialogHeader>
					{editingDebt && (
						<DebtForm
							onSubmit={handleUpdateDebt}
							isLoading={updateDebtMutation.isPending}
							defaultValues={{
								name: editingDebt.name,
								type: editingDebt.type as
									| "credit_card"
									| "loan"
									| "mortgage"
									| "other",
								balance: editingDebt.balance,
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
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Debt</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this debt? This action cannot be
							undone and will also delete all associated payment history.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeletingDebtId(null)}
							disabled={deleteDebtMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => deletingDebtId && handleDeleteDebt(deletingDebtId)}
							disabled={deleteDebtMutation.isPending}
						>
							{deleteDebtMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
