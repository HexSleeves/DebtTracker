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
		due_date: v.optional(v.string()),
		created_at: v.optional(v.string()),
	}).index("by_user", ["clerk_user_id"]),
});
