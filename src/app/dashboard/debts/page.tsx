"use client";

import {
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Plus,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { StatCard } from "~/components/stats-card";
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
import { formatCurrency } from "~/lib/currency";
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

  // Calculate debt statistics
  const debtStats = useMemo(() => {
    const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const totalAccounts = debts.length;
    const paidDebts = debts.filter((debt) => debt.balance <= 0);
    const overdueDebts = debts.filter(
      (debt) => debt.dueDate && debt.dueDate < new Date() && debt.balance > 0,
    );
    const highInterestDebts = debts.filter(
      (debt) => debt.interestRate >= 15 && debt.balance > 0,
    );
    const totalPaid = paidDebts.reduce(
      (sum, debt) => sum + Math.abs(debt.balance),
      0,
    );
    const totalOverdue = overdueDebts.reduce(
      (sum, debt) => sum + debt.balance,
      0,
    );
    const totalHighInterest = highInterestDebts.reduce(
      (sum, debt) => sum + debt.balance,
      0,
    );

    return {
      totalDebt,
      totalAccounts,
      paidCount: paidDebts.length,
      overdueCount: overdueDebts.length,
      highInterestCount: highInterestDebts.length,
      totalPaid,
      totalOverdue,
      totalHighInterest,
    };
  }, [debts]);

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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Debts</h1>
            <p className="text-muted-foreground">
              Manage your debts and track your progress
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted h-32 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="animate-pulse">
          <div className="bg-muted mb-4 h-10 rounded" />
          <div className="bg-muted h-64 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Debt Overview</h1>
          <p className="text-muted-foreground">
            Track your debts and monitor your financial progress
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="interactive-primary hover-lift" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add New Debt
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

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Debt"
          value={formatCurrency(debtStats.totalDebt)}
          subtitle={`${debtStats.totalAccounts} accounts`}
          icon={<CreditCard className="h-6 w-6" />}
          color="blue"
          trend="neutral"
          className="hover-lift"
        />

        <StatCard
          title="Paid Off"
          value={formatCurrency(Math.abs(debtStats.totalPaid))}
          subtitle={`${debtStats.paidCount} accounts`}
          icon={<CheckCircle className="h-6 w-6" />}
          color="green"
          trend="up"
          className="hover-lift"
        />

        <StatCard
          title="High Interest"
          value={formatCurrency(debtStats.totalHighInterest)}
          subtitle={`${debtStats.highInterestCount} accounts`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="amber"
          trend="down"
          className="hover-lift"
        />

        <StatCard
          title="Overdue"
          value={formatCurrency(debtStats.totalOverdue)}
          subtitle={`${debtStats.overdueCount} payments`}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="red"
          trend={debtStats.overdueCount > 0 ? "up" : "neutral"}
          className="hover-lift"
        />
      </div>

      {/* Debt Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Debts</h2>
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
        <DialogContent className="border-l-warning border-l-4 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-warning flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Edit Debt
            </DialogTitle>
            <DialogDescription>
              Update the details of your debt to keep your tracking accurate.
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
        <DialogContent className="border-l-error border-l-4">
          <DialogHeader>
            <DialogTitle className="text-error flex items-center gap-2">
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
