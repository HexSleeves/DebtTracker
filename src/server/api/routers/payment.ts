import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { Payment, PaymentInsert, PaymentUpdate } from "~/types";

// Zod schemas for validation
const createPaymentSchema = z.object({
  debtId: z.string().uuid(),
  amount: z.number().min(0.01, "Payment amount must be greater than 0"),
  paymentDate: z.date(),
  type: z.enum(["minimum", "extra", "full"]),
});

const updatePaymentSchema = z.object({
  id: z.string().uuid(),
  amount: z
    .number()
    .min(0.01, "Payment amount must be greater than 0")
    .optional(),
  paymentDate: z.date().optional(),
  type: z.enum(["minimum", "extra", "full"]).optional(),
});

export const paymentRouter = createTRPCRouter({
  // Get all payments for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data: user } = await ctx.supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", ctx.userId)
      .single();

    if (!user) {
      throw new Error("User not found");
    }

    const { data: payments, error } = await ctx.supabase
      .from("payments")
      .select(
        `
        *,
        debts!inner(
          id,
          name,
          user_id
        )
      `
      )
      .eq("debts.user_id", user.id)
      .order("payment_date", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }

    return payments.map((payment) => ({
      id: payment.id,
      debtId: payment.debt_id,
      amount: Number(payment.amount),
      paymentDate: new Date(payment.payment_date),
      type: payment.type as Payment["type"],
      createdAt: new Date(payment.created_at || new Date().toISOString()),
    })) as Payment[];
  }),

  // Get payments for a specific debt
  getByDebtId: protectedProcedure
    .input(z.object({ debtId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: user } = await ctx.supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", ctx.userId)
        .single();

      if (!user) {
        throw new Error("User not found");
      }

      // Verify the debt belongs to the user
      const { data: debt } = await ctx.supabase
        .from("debts")
        .select("id")
        .eq("id", input.debtId)
        .eq("user_id", user.id)
        .single();

      if (!debt) {
        throw new Error(
          "Debt not found or you don't have permission to access it"
        );
      }

      const { data: payments, error } = await ctx.supabase
        .from("payments")
        .select("*")
        .eq("debt_id", input.debtId)
        .order("payment_date", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch payments: ${error.message}`);
      }

      return payments.map((payment) => ({
        id: payment.id,
        debtId: payment.debt_id,
        amount: Number(payment.amount),
        paymentDate: new Date(payment.payment_date),
        type: payment.type as Payment["type"],
        createdAt: new Date(payment.created_at || new Date().toISOString()),
      })) as Payment[];
    }),

  // Create a new payment
  create: protectedProcedure
    .input(createPaymentSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: user } = await ctx.supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", ctx.userId)
        .single();

      if (!user) {
        throw new Error("User not found");
      }

      // Verify the debt belongs to the user
      const { data: debt } = await ctx.supabase
        .from("debts")
        .select("id, balance")
        .eq("id", input.debtId)
        .eq("user_id", user.id)
        .single();

      if (!debt) {
        throw new Error(
          "Debt not found or you don't have permission to access it"
        );
      }

      // Validate payment amount doesn't exceed debt balance for full payments
      if (input.type === "full" && input.amount > Number(debt.balance)) {
        throw new Error("Payment amount cannot exceed debt balance");
      }

      const paymentDateString = input.paymentDate.toISOString().split("T")[0];
      if (!paymentDateString) {
        throw new Error("Invalid payment date");
      }

      const insertData: PaymentInsert = {
        debt_id: input.debtId,
        amount: input.amount,
        payment_date: paymentDateString,
        type: input.type,
      };

      const { data: payment, error } = await ctx.supabase
        .from("payments")
        .insert(insertData)
        .select("*")
        .single();

      if (error) {
        throw new Error(`Failed to create payment: ${error.message}`);
      }

      // Update debt balance if this is a payment
      const newBalance = Math.max(0, Number(debt.balance) - input.amount);
      await ctx.supabase
        .from("debts")
        .update({ balance: newBalance })
        .eq("id", input.debtId);

      return {
        id: payment.id,
        debtId: payment.debt_id,
        amount: Number(payment.amount),
        paymentDate: new Date(payment.payment_date),
        type: payment.type as Payment["type"],
        createdAt: new Date(payment.created_at || new Date().toISOString()),
      } as Payment;
    }),

  // Update an existing payment
  update: protectedProcedure
    .input(updatePaymentSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: user } = await ctx.supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", ctx.userId)
        .single();

      if (!user) {
        throw new Error("User not found");
      }

      // Get the existing payment and verify ownership
      const { data: existingPayment } = await ctx.supabase
        .from("payments")
        .select(
          `
          *,
          debts!inner(
            id,
            balance,
            user_id
          )
        `
        )
        .eq("id", input.id)
        .eq("debts.user_id", user.id)
        .single();

      if (!existingPayment) {
        throw new Error(
          "Payment not found or you don't have permission to update it"
        );
      }

      const { id, ...updateData } = input;

      // Convert camelCase to snake_case for database
      const dbUpdateData: PaymentUpdate = {};
      if (updateData.amount !== undefined)
        dbUpdateData.amount = updateData.amount;
      if (updateData.paymentDate !== undefined) {
        dbUpdateData.payment_date = updateData.paymentDate
          .toISOString()
          .split("T")[0];
      }
      if (updateData.type !== undefined) dbUpdateData.type = updateData.type;

      const { data: payment, error } = await ctx.supabase
        .from("payments")
        .update(dbUpdateData)
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        throw new Error(`Failed to update payment: ${error.message}`);
      }

      // If amount changed, update debt balance
      if (updateData.amount !== undefined) {
        const amountDifference =
          updateData.amount - Number(existingPayment.amount);
        const currentBalance = Number(existingPayment.debts.balance);
        const newBalance = Math.max(0, currentBalance + amountDifference);

        if (existingPayment.debt_id) {
          await ctx.supabase
            .from("debts")
            .update({ balance: newBalance })
            .eq("id", existingPayment.debt_id);
        }
      }

      return {
        id: payment.id,
        debtId: payment.debt_id,
        amount: Number(payment.amount),
        paymentDate: new Date(payment.payment_date),
        type: payment.type as Payment["type"],
        createdAt: new Date(payment.created_at || new Date().toISOString()),
      } as Payment;
    }),

  // Delete a payment
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data: user } = await ctx.supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", ctx.userId)
        .single();

      if (!user) {
        throw new Error("User not found");
      }

      // Get the payment and verify ownership before deletion
      const { data: payment } = await ctx.supabase
        .from("payments")
        .select(
          `
          *,
          debts!inner(
            id,
            balance,
            user_id
          )
        `
        )
        .eq("id", input.id)
        .eq("debts.user_id", user.id)
        .single();

      if (!payment) {
        throw new Error(
          "Payment not found or you don't have permission to delete it"
        );
      }

      // Delete the payment
      const { error } = await ctx.supabase
        .from("payments")
        .delete()
        .eq("id", input.id);

      if (error) {
        throw new Error(`Failed to delete payment: ${error.message}`);
      }

      // Restore the debt balance
      const restoredBalance =
        Number(payment.debts.balance) + Number(payment.amount);
      if (payment.debt_id) {
        await ctx.supabase
          .from("debts")
          .update({ balance: restoredBalance })
          .eq("id", payment.debt_id);
      }

      return { success: true };
    }),

  // Get payment statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const { data: user } = await ctx.supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", ctx.userId)
      .single();

    if (!user) {
      throw new Error("User not found");
    }

    const { data: payments, error } = await ctx.supabase
      .from("payments")
      .select(
        `
        amount,
        payment_date,
        type,
        debts!inner(
          user_id
        )
      `
      )
      .eq("debts.user_id", user.id);

    if (error) {
      throw new Error(`Failed to fetch payment statistics: ${error.message}`);
    }

    const totalPayments = payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );
    const paymentCount = payments.length;
    const averagePayment = paymentCount > 0 ? totalPayments / paymentCount : 0;

    // Get payments from current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const currentMonthPayments = payments.filter(
      (payment) => new Date(payment.payment_date) >= currentMonth
    );
    const currentMonthTotal = currentMonthPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );

    // Payment type breakdown
    const paymentsByType = {
      minimum: payments.filter((p) => p.type === "minimum").length,
      extra: payments.filter((p) => p.type === "extra").length,
      full: payments.filter((p) => p.type === "full").length,
    };

    return {
      totalPayments,
      paymentCount,
      averagePayment,
      currentMonthTotal,
      currentMonthCount: currentMonthPayments.length,
      paymentsByType,
    };
  }),
});
