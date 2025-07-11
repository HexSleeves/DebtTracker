"use client";

import { CreditCard, DollarSign, Plus, TrendingUp } from "lucide-react";
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
      color: "interactive-primary hover-lift",
    },
    {
      icon: <DollarSign size={20} />,
      label: "Log Payment",
      onClick: (ctx) => {
        ctx.setIsOpen(false);
        setIsLogPaymentDialogOpen(true);
      },
      color: "interactive-success hover-lift",
    },
    {
      icon: <TrendingUp size={20} />,
      label: "View Strategies",
      href: "/dashboard/strategies",
      color: "interactive-warning hover-lift",
    },
  ];

  return (
    <>
      <FloatingActionButton actionItems={actionItems} />

      {/* Add Debt Dialog */}
      <Dialog open={isDebtDialogOpen} onOpenChange={setIsDebtDialogOpen}>
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
      </Dialog>

      {/* Log Payment Dialog */}
      <Dialog
        open={isLogPaymentDialogOpen}
        onOpenChange={setIsLogPaymentDialogOpen}
      >
        <DialogContent className="border-l-success from-success-50/20 max-w-md border-l-4 bg-gradient-to-br to-transparent">
          <DialogHeader>
            <DialogTitle className="text-success flex items-center gap-2">
              <div className="bg-success/10 rounded-full p-2">
                <DollarSign className="h-5 w-5" />
              </div>
              Log Payment
            </DialogTitle>
            <DialogDescription>
              Record a payment you've made to track your debt reduction
              progress.
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
