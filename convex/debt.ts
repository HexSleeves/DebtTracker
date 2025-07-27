import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
	args: { userId: v.string() },
	handler: async (ctx, { userId }) => {
		return await ctx.db
			.query("debts")
			.withIndex("by_user", (q) => q.eq("clerk_user_id", userId))
			.collect();
	},
});

export const create = mutation({
	args: {
		userId: v.string(),
		name: v.string(),
		type: v.string(),
		balance: v.number(),
		originalBalance: v.number(),
		interestRate: v.number(),
		minimumPayment: v.number(),
		dueDate: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { userId, originalBalance, interestRate, minimumPayment, ...rest } =
			args;
		await ctx.db.insert("debts", {
			clerk_user_id: userId,
			original_balance: originalBalance,
			interest_rate: interestRate,
			minimum_payment: minimumPayment,
			...rest,
		});
	},
});
