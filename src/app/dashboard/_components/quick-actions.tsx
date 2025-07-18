"use client";

import { CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { useState } from "react";
import DebtDialog from "~/components/dialogs/debt-dialog";
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
import type { TCreatePayment } from "~/routers/payment/payment.schema";
import { api } from "~/trpc/react";
import { PaymentForm } from "./forms/payment-form";

export function QuickActions() {
  const utils = api.useUtils();
  const [isDebtDialogOpen, setIsDebtDialogOpen] = useState(false);
  const [isLogPaymentDialogOpen, setIsLogPaymentDialogOpen] = useState(false);

  const debts = api.debt.getAll.useQuery();

  const createPayment = api.payment.create.useMutation({
    onSuccess: () => {
      setIsLogPaymentDialogOpen(false);
      void utils.payment.getAll.invalidate();
    },
  });

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
      <DebtDialog
        withTrigger={false}
        isOpen={isDebtDialogOpen}
        onOpenChange={setIsDebtDialogOpen}
      />

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
