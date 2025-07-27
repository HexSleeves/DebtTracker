"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { useAuthGuard } from "~/lib/hooks/use-auth-guard";
import type { TCreateDebt } from "~/server/api/routers/debt/debt.schema";
import { api } from "~/trpc/react";
import { DebtForm } from "../forms/debt-form";

export type DebtDialogProps = {
	isOpen: boolean;
	withTrigger?: boolean;
	onOpenChangeAction: (open: boolean) => void;
};

export default function DebtDialog({
	isOpen,
	onOpenChangeAction,
	withTrigger = true,
}: DebtDialogProps) {
	const utils = api.useUtils();
	const { user } = useAuthGuard();

	const createDebtMutation = api.debt.create.useMutation({
		onMutate: async (newDebt) => {
			await utils.debt.getAll.cancel();

			const optimisticDebt = {
				id: `temp-${Date.now()}`,
				...newDebt,
				userId: user.id,
				createdAt: new Date(),
				updatedAt: new Date(),
				dueDate: newDebt.dueDate ?? null,
				originalBalance: newDebt.originalBalance ?? newDebt.balance,
			};

			return { optimisticDebt };
		},
		onSuccess: (_data, _variables, { optimisticDebt }) => {
			utils.debt.getAll.setData(undefined, (old = []) => [
				...old,
				optimisticDebt,
			]);

			toast.success("Debt added successfully");
			onOpenChangeAction(false);
		},
		onError: (error) => {
			toast.error(`Failed to add debt: ${error.message}`);
		},
		onSettled: () => {
			void utils.debt.getAll.invalidate();
		},
	});

	const handleCreateDebt = (data: TCreateDebt) => {
		createDebtMutation.mutate(data);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChangeAction}>
			{withTrigger && (
				<DialogTrigger asChild>
					<Button
						size="lg"
						className="interactive-primary hover-lift text-foreground"
					>
						<Plus className="mr-2 h-5 w-5" />
						Add New Debt
					</Button>
				</DialogTrigger>
			)}
			<DialogContent className="border-l-4 border-l-primary sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-primary">
						<Plus className="h-5 w-5" />
						Add New Debt
					</DialogTitle>
					<DialogDescription>
						Enter the details of your new debt to start tracking it.
					</DialogDescription>
				</DialogHeader>
				<DebtForm
					onSubmitAction={handleCreateDebt}
					isLoading={createDebtMutation.isPending}
				/>
			</DialogContent>
		</Dialog>
	);
}
