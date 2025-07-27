import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	debts: defineTable({
		clerk_user_id: v.string(),
		name: v.string(),
		type: v.string(),
		balance: v.number(),
		original_balance: v.number(),
		interest_rate: v.number(),
		minimum_payment: v.number(),
		due_date: v.optional(v.number()),
		created_at: v.optional(v.number()),
	}).index("by_user", ["clerk_user_id"]),

	payments: defineTable({
		clerk_user_id: v.string(),
		debt_id: v.id("debts"),
		amount: v.number(),
		payment_date: v.string(),
		notes: v.optional(v.string()),
		created_at: v.optional(v.number()),
	})
		.index("by_user", ["clerk_user_id"])
		.index("by_debt", ["debt_id"])
		.index("by_user_and_debt", ["clerk_user_id", "debt_id"])
		.index("by_payment_date", ["payment_date"]),

	payment_plans: defineTable({
		clerk_user_id: v.string(),
		name: v.string(),
		strategy_type: v.string(), // "avalanche" | "snowball" | "custom"
		monthly_budget: v.number(),
		extra_payment: v.number(),
		is_active: v.boolean(),
		created_at: v.optional(v.number()),
	})
		.index("by_user", ["clerk_user_id"])
		.index("by_active", ["clerk_user_id", "is_active"])
		.index("by_strategy", ["strategy_type"]),
});
