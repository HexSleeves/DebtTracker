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
import { type TCreateDebt } from "~/server/api/routers/debt/debt.schema";
import { api } from "~/trpc/react";
import { DebtForm } from "../forms/debt-form";

export default function DebtDialog({
  isOpen,
  onOpenChange,
  withTrigger = true,
}: {
  isOpen: boolean;
  withTrigger?: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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
      };

      return { optimisticDebt };
    },
    onSuccess: (_data, _variables, { optimisticDebt }) => {
      utils.debt.getAll.setData(undefined, (old = []) => [
        ...old,
        optimisticDebt,
      ]);

      toast.success("Debt added successfully");
      onOpenChange(false);
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {withTrigger && (
        <DialogTrigger asChild>
          <Button
            className="interactive-primary hover-lift text-foreground"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Debt
          </Button>
        </DialogTrigger>
      )}
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
  );
}

{
  /* <Dialog open={isDebtDialogOpen} onOpenChange={setIsDebtDialogOpen}>
        <DialogContent className="border-l-primary from-primary-50/20 max-w-md border-l-4 bg-gradient-to-br to-transparent">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <div className="bg-primary/10 rounded-full p-2">
                <Plus className="h-5 w-5" />
              </div>
              Add New Debt
            </DialogTitle>
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
      </Dialog> */
}
