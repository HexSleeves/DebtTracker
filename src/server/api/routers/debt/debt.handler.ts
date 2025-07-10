import type { ProtectedTRPCContext } from "~/server/api/trpc";
import type { DebtUpdate } from "~/types";
import { transformDebtFromDb } from "~/types/db.helpers";
import type * as Schema from "./debt.schema";

type HandlerCtx = {
	ctx: ProtectedTRPCContext;
};

type HandlerInput<T> = {
	input: T;
	ctx: ProtectedTRPCContext;
};

export async function getDebts({ ctx }: HandlerCtx) {
	const { data: debts, error } = await ctx.supabase
		.from("debts")
		.select("*")
		.eq("clerk_user_id", ctx.userId)
		.order("created_at", { ascending: false });

	if (error) {
		throw new Error(`Failed to fetch debts: ${error.message}`);
	}

	return debts.map(transformDebtFromDb);
}

export async function getDebtById({
	ctx,
	input,
}: HandlerInput<Schema.TGetDebtById>) {
	const { data: debt, error } = await ctx.supabase
		.from("debts")
		.select("*")
		.eq("id", input.id)
		.eq("clerk_user_id", ctx.userId)
		.single();

	if (error) {
		throw new Error(`Failed to fetch debt: ${error.message}`);
	}

	if (!debt) {
		throw new Error("Debt not found");
	}

	return transformDebtFromDb(debt);
}

export async function createDebt({
	ctx,
	input,
}: HandlerInput<Schema.TCreateDebt>) {
	const { data: debt, error } = await ctx.supabase
		.from("debts")
		.insert({
			clerk_user_id: ctx.userId,
			name: input.name,
			type: input.type,
			balance: input.balance,
			interest_rate: input.interestRate,
			minimum_payment: input.minimumPayment,
			due_date: input.dueDate?.toISOString().split("T")[0] || null,
		})
		.select("*")
		.single();

	if (error) {
		throw new Error(`Failed to create debt: ${error.message}`);
	}

	return transformDebtFromDb(debt);
}

export async function updateDebt({
	ctx,
	input,
}: HandlerInput<Schema.TUpdateDebt>) {
	const { id, ...updateData } = input;

	// Convert camelCase to snake_case for database
	const dbUpdateData: DebtUpdate = {};
	if (updateData.name !== undefined) dbUpdateData.name = updateData.name;
	if (updateData.type !== undefined) dbUpdateData.type = updateData.type;
	if (updateData.balance !== undefined) {
		dbUpdateData.balance = updateData.balance;
	}
	if (updateData.interestRate !== undefined) {
		dbUpdateData.interest_rate = updateData.interestRate;
	}
	if (updateData.minimumPayment !== undefined) {
		dbUpdateData.minimum_payment = updateData.minimumPayment;
	}
	if (updateData.dueDate !== undefined) {
		dbUpdateData.due_date = updateData.dueDate?.toISOString().split("T")[0] ||
			null;
	}

	const { data: debt, error } = await ctx.supabase
		.from("debts")
		.update(dbUpdateData)
		.eq("id", id)
		.eq("clerk_user_id", ctx.userId)
		.select("*")
		.single();

	if (error) {
		throw new Error(`Failed to update debt: ${error.message}`);
	}

	if (!debt) {
		throw new Error("Debt not found or you don't have permission to update it");
	}

	return transformDebtFromDb(debt);
}

export async function deleteDebt({
	ctx,
	input,
}: HandlerInput<Schema.TDeleteDebt>) {
	const { error } = await ctx.supabase
		.from("debts")
		.delete()
		.eq("id", input.id)
		.eq("clerk_user_id", ctx.userId);

	if (error) {
		throw new Error(`Failed to delete debt: ${error.message}`);
	}

	return { success: true };
}

export async function getDebtStats({ ctx }: HandlerCtx) {
	const { data: debts, error } = await ctx.supabase
		.from("debts")
		.select("balance, interest_rate, minimum_payment")
		.eq("clerk_user_id", ctx.userId);

	if (error) {
		throw new Error(`Failed to fetch debt statistics: ${error.message}`);
	}

	const totalBalance = debts.reduce(
		(sum, debt) => sum + Number(debt.balance),
		0,
	);
	const totalMinimumPayments = debts.reduce(
		(sum, debt) => sum + Number(debt.minimum_payment),
		0,
	);
	const averageInterestRate = debts.length > 0
		? debts.reduce((sum, debt) => sum + Number(debt.interest_rate), 0) /
			debts.length
		: 0;
	const highestInterestRate = debts.length > 0
		? Math.max(...debts.map((debt) => Number(debt.interest_rate)))
		: 0;

	return {
		totalDebts: debts.length,
		totalBalance,
		totalMinimumPayments,
		averageInterestRate,
		highestInterestRate,
	};
}
