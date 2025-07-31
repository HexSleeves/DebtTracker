import { applyPayment } from "~/lib/payments/processor";
import { detectMilestones } from "~/lib/progress/tracker";
import type { ProtectedTRPCContext } from "~/server/api/trpc";
import type { PaymentInsert, PaymentUpdate } from "~/types";
import {
	transformDebtFromDb,
	transformPaymentFromDb,
} from "~/types/db.helpers";
import type * as Schema from "./payment.schema";

type HandlerCtx = {
	ctx: ProtectedTRPCContext;
};

type HandlerInput<T> = {
	input: T;
	ctx: ProtectedTRPCContext;
};

export async function getAllPayments({ ctx }: HandlerCtx) {
	const { data: payments, error } = await ctx.supabase
		.from("payments")
		.select(
			`
        *,
        debts!inner(
          id,
          name,
          clerk_user_id
        )
      `,
		)
		.eq("debts.clerk_user_id", ctx.userId)
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
	// Verify the debt belongs to the user
	const { data: debt } = await ctx.supabase
		.from("debts")
		.select("id")
		.eq("id", input.debtId)
		.eq("clerk_user_id", ctx.userId)
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
	// Verify the debt belongs to the user
	const { data: debt } = await ctx.supabase
		.from("debts")
		.select("*")
		.eq("id", input.debtId)
		.eq("clerk_user_id", ctx.userId)
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

	// Calculate breakdown and new balance
	const lastPayment = await ctx.supabase
		.from("payments")
		.select("payment_date")
		.eq("debt_id", input.debtId)
		.order("payment_date", { ascending: false })
		.limit(1)
		.maybeSingle();

	const { newBalance, breakdown } = applyPayment(
		transformDebtFromDb(debt),
		{ amount: input.amount, paymentDate: input.paymentDate },
		{
			lastPaymentDate: lastPayment.data?.payment_date
				? new Date(lastPayment.data.payment_date)
				: undefined,
		},
	);

	const insertData: PaymentInsert = {
		debt_id: input.debtId,
		amount: input.amount,
		payment_date: paymentDateString,
		type: input.type,
		balance_after_payment: newBalance,
		interest_portion: breakdown.interestPortion,
		principal_portion: breakdown.principalPortion,
		payment_method: input.paymentMethod ?? "manual",
		notes: input.notes ?? null,
	};

	const { data: payment, error } = await ctx.supabase
		.from("payments")
		.insert(insertData)
		.select("*")
		.single();

	if (error || !payment) {
		throw new Error(`Failed to create payment: ${error?.message}`);
	}

	await ctx.supabase
		.from("debts")
		.update({
			balance: newBalance,
			total_interest_paid:
				Number(debt.total_interest_paid) + breakdown.interestPortion,
			total_payments_made: Number(debt.total_payments_made) + input.amount,
			status: newBalance === 0 ? "paid_off" : debt.status,
			paid_off_date:
				newBalance === 0 ? new Date().toISOString() : debt.paid_off_date,
		})
		.eq("id", input.debtId);

	const triggered = detectMilestones(
		transformDebtFromDb(debt),
		transformPaymentFromDb(payment),
	);
	for (const m of triggered) {
		await ctx.supabase.from("debt_milestones").insert({
			debt_id: m.debtId,
			milestone_type: m.milestoneType,
			achieved_date: m.achievedDate.toISOString(),
			milestone_value: m.milestoneValue,
			description: m.description,
		});
	}

	return transformPaymentFromDb(payment);
}

export async function updatePayment({
	ctx,
	input,
}: HandlerInput<Schema.TUpdatePayment>) {
	// Get the existing payment and verify ownership
	const { data: existingPayment } = await ctx.supabase
		.from("payments")
		.select(
			`
        *,
        debts!inner(
          *,
          clerk_user_id
        )
      `,
		)
		.eq("id", input.id)
		.eq("debts.clerk_user_id", ctx.userId)
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
	if (updateData.paymentMethod !== undefined) {
		dbUpdateData.payment_method = updateData.paymentMethod;
	}
	if (updateData.notes !== undefined) {
		dbUpdateData.notes = updateData.notes;
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

	// If amount changed, recalc breakdown and update debt
	if (updateData.amount !== undefined) {
		const debt = transformDebtFromDb(existingPayment.debts);

		const { newBalance, breakdown } = applyPayment(debt, {
			amount: updateData.amount,
			paymentDate: updateData.paymentDate ?? new Date(),
		});

		await ctx.supabase
			.from("payments")
			.update({
				balance_after_payment: newBalance,
				interest_portion: breakdown.interestPortion,
				principal_portion: breakdown.principalPortion,
			})
			.eq("id", id);

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
	// Get the payment and verify ownership before deletion
	const { data: payment } = await ctx.supabase
		.from("payments")
		.select(
			`
        *,
        debts!inner(
          id,
          balance,
          clerk_user_id
        )
      `,
		)
		.eq("id", input.id)
		.eq("debts.clerk_user_id", ctx.userId)
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

	// Restore the debt balance and totals
	const restoredBalance =
		Number(payment.debts.balance) + Number(payment.amount);
	if (payment.debt_id) {
		await ctx.supabase
			.from("debts")
			.update({
				balance: restoredBalance,
				total_interest_paid:
					Number(payment.debts.total_interest_paid ?? 0) -
					Number(payment.interest_portion ?? 0),
				total_payments_made:
					Number(payment.debts.total_payments_made ?? 0) -
					Number(payment.amount),
			})
			.eq("id", payment.debt_id);
	}

	return { success: true };
}
