import { generateRecommendations } from "~/lib/recommendations/engine";
import type { ProtectedTRPCContext } from "~/server/api/trpc";
import { transformDebtFromDb } from "~/types/db.helpers";
import type * as Schema from "./recommendation.schema";

interface HandlerInput<T> {
	input: T;
	ctx: ProtectedTRPCContext;
}

export async function getRecommendations({
	ctx,
	input,
}: HandlerInput<Schema.TGetRecommendations>) {
	const { data: debts } = await ctx.supabase
		.from("debts")
		.select("*")
		.eq("clerk_user_id", ctx.userId)
		.eq("status", "active");

	if (!debts) return [];
	const debtList = debts.map(transformDebtFromDb);
	return generateRecommendations(debtList, input.monthlyBudget, input.strategy);
}
