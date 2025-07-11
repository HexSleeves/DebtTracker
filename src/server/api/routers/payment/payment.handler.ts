import type { ProtectedTRPCContext } from "~/server/api/trpc";
import type { PaymentInsert, PaymentUpdate } from "~/types";
import { transformPaymentFromDb } from "~/types/db.helpers";
import type * as Schema from "./payment.schema";

type HandlerCtx = {
	ctx: ProtectedTRPCContext;
};

type HandlerInput<T> = {
	input: T;
	ctx: ProtectedTRPCContext;
};

export async function getAllPayments({ ctx }: HandlerCtx) {
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
      `,
		)
		.eq("debts.user_id", user.id)
		.order("payment_date", { ascending: false });

	if (error) {
		throw new Error(`Failed to fetch payments: ${error.message}`);
	}

	return payments.map(transformPaymentFromDb);
}

export async function getPaymentsByDebtId({
	ctx,
	input,
}: HandlerInput<Schema.TGetPaymentsByDebtId>) {
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
		throw new Error("Debt not found or you don't have permission to access it");
	}

	const { data: payments, error } = await ctx.supabase
		.from("payments")
		.select("*")
		.eq("debt_id", input.debtId)
		.order("payment_date", { ascending: false });

	if (error) {
		throw new Error(`Failed to fetch payments: ${error.message}`);
	}

	return payments.map(transformPaymentFromDb);
}

export async function createPayment({
	ctx,
	input,
}: HandlerInput<Schema.TCreatePayment>) {
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
		throw new Error("Debt not found or you don't have permission to access it");
	}

	// Validate payment amount doesn't exceed debt balance for full payments
	if (input.type === "full" && input.amount > Number(debt.balance)) {
		throw new Error("Payment amount cannot exceed debt balance");
	}

	const paymentDateString = input.paymentDate.toISOString();
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

	return transformPaymentFromDb(payment);
}

export async function updatePayment({
	ctx,
	input,
}: HandlerInput<Schema.TUpdatePayment>) {
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
      `,
		)
		.eq("id", input.id)
		.eq("debts.user_id", user.id)
		.single();

	if (!existingPayment) {
		throw new Error(
			"Payment not found or you don't have permission to update it",
		);
	}

	const { id, ...updateData } = input;
	const dbUpdateData: PaymentUpdate = {};

	if (updateData.amount !== undefined) {
		dbUpdateData.amount = updateData.amount;
	}
	if (updateData.paymentDate !== undefined) {
		dbUpdateData.payment_date = updateData.paymentDate.toISOString();
	}
	if (updateData.type !== undefined) {
		dbUpdateData.type = updateData.type;
	}

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
		const amountDifference = updateData.amount - Number(existingPayment.amount);
		const currentBalance = Number(existingPayment.debts.balance);
		const newBalance = Math.max(0, currentBalance + amountDifference);

		if (existingPayment.debt_id) {
			await ctx.supabase
				.from("debts")
				.update({ balance: newBalance })
				.eq("id", existingPayment.debt_id);
		}
	}

	return transformPaymentFromDb(payment);
}

export async function deletePayment({
	ctx,
	input,
}: HandlerInput<Schema.TDeletePayment>) {
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
      `,
		)
		.eq("id", input.id)
		.eq("debts.user_id", user.id)
		.single();

	if (!payment) {
		throw new Error(
			"Payment not found or you don't have permission to delete it",
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
}
