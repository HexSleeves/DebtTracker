"use client";

import { Plus } from "lucide-react";
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
import { useAuthGuard } from "~/lib/hooks/use-auth-guard";
import type {
  TCreateDebt,
  TUpdateDebt,
} from "~/server/api/routers/debt/debt.schema";
import { api } from "~/trpc/react";
import type { Debt } from "~/types/db.helpers";
import { DebtTable } from "../_components/debt-table";
import { DebtForm } from "../_components/forms/debt-form";

export default function DebtsPage() {
  const { user } = useAuthGuard();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [deletingDebtId, setDeletingDebtId] = useState<string | null>(null);

  const utils = api.useUtils();
  const { data: debts = [], isLoading } = api.debt.getAll.useQuery();

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Debts</h1>
            <p className="text-muted-foreground">
              Manage your debts and track your progress
            </p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="bg-muted h-10 rounded" />
          <div className="bg-muted h-64 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Debts</h1>
          <p className="text-muted-foreground">
            Manage your debts and track your progress
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="interactive-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Debt
            </Button>
          </DialogTrigger>
          <DialogContent className="border-l-primary border-l-4 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-primary flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Debt
              </DialogTitle>
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

      <DebtTable
        debts={debts}
        setIsAddDialogOpen={setIsAddDialogOpen}
        setEditingDebt={setEditingDebt}
        setDeletingDebtId={setDeletingDebtId}
      />

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
              className="interactive-error"
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
