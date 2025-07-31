import { calculateProgress } from "~/lib/progress/tracker";
import type { ProtectedTRPCContext } from "~/server/api/trpc";
import {
	transformDebtFromDb,
	transformDebtMilestoneFromDb,
	transformPaymentFromDb,
} from "~/types/db.helpers";
import type * as Schema from "./progress.schema";

interface HandlerCtx {
	ctx: ProtectedTRPCContext;
}

interface HandlerInput<T> {
	input: T;
	ctx: ProtectedTRPCContext;
}

export async function getDebtProgress({
	ctx,
	input,
}: HandlerInput<Schema.TGetDebtProgress>) {
	const { data: debt } = await ctx.supabase
		.from("debts")
		.select("*")
		.eq("id", input.debtId)
		.eq("clerk_user_id", ctx.userId)
		.single();

	if (!debt) {
		throw new Error("Debt not found");
	}

	const { data: payments } = await ctx.supabase
		.from("payments")
		.select("*")
		.eq("debt_id", input.debtId)
		.order("payment_date", { ascending: true });

	const { data: milestones } = await ctx.supabase
		.from("debt_milestones")
		.select("*")
		.eq("debt_id", input.debtId)
		.order("achieved_date", { ascending: true });

	const prog = calculateProgress(
		transformDebtFromDb(debt),
		(payments ?? []).map(transformPaymentFromDb),
	);

	return {
		debt: transformDebtFromDb(debt),
		progress: prog,
		milestones: (milestones ?? []).map(transformDebtMilestoneFromDb),
	};
}

export async function getAllProgress({ ctx }: HandlerCtx) {
	const { data: debts } = await ctx.supabase
		.from("debts")
		.select("*")
		.eq("clerk_user_id", ctx.userId);

	if (!debts) return [];

	const results = [] as Array<{
		debt: Debt;
		progress: ReturnType<typeof calculateProgress>;
		milestones: DebtMilestone[];
	}>;

	for (const dbDebt of debts) {
		const { data: payments } = await ctx.supabase
			.from("payments")
			.select("*")
			.eq("debt_id", dbDebt.id)
			.order("payment_date", { ascending: true });
		const { data: milestones } = await ctx.supabase
			.from("debt_milestones")
			.select("*")
			.eq("debt_id", dbDebt.id)
			.order("achieved_date", { ascending: true });
		const debt = transformDebtFromDb(dbDebt);
		results.push({
			debt,
			progress: calculateProgress(
				debt,
				(payments ?? []).map(transformPaymentFromDb),
			),
			milestones: (milestones ?? []).map(transformDebtMilestoneFromDb),
		});
	}

	return results;
}
