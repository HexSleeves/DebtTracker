export interface Payment {
  id: string;
  debtId: string;
  amount: number;
  paymentDate: Date;
  type: "minimum" | "extra" | "full";
  createdAt: Date;
}

export interface CreatePaymentInput {
  debtId: string;
  amount: number;
  paymentDate: Date;
  type: Payment["type"];
}

export interface PaymentPlan {
  id: string;
  userId: string;
  name: string;
  strategy: "avalanche" | "snowball" | "custom";
  monthlyBudget: number;
  extraPayment: number;
  targetDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentPlanInput {
  name: string;
  strategy: PaymentPlan["strategy"];
  monthlyBudget: number;
  extraPayment: number;
  targetDate?: Date;
  isActive?: boolean;
}

export interface UpdatePaymentPlanInput {
  id: string;
  name?: string;
  strategy?: PaymentPlan["strategy"];
  monthlyBudget?: number;
  extraPayment?: number;
  targetDate?: Date | null;
  isActive?: boolean;
}
