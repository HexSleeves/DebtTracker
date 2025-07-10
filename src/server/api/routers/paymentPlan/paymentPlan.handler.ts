import type { ProtectedTRPCContext } from "~/server/api/trpc";
import {
	type PaymentPlanUpdate,
	transformPaymentPlanFromDb,
} from "~/types/db.helpers";
import type * as Schema from "./paymentPlan.schema";

type HandlerCtx = {
	ctx: ProtectedTRPCContext;
};

type HandlerInput<T> = {
	input: T;
	ctx: ProtectedTRPCContext;
};

// Get all payment plans
export async function getAllPaymentPlans({ ctx }: HandlerCtx) {
	const { data: user } = await ctx.supabase
		.from("users")
		.select("id")
		.eq("clerk_user_id", ctx.userId)
		.single();

	if (!user) {
		throw new Error("User not found");
	}

	const { data: plans, error } = await ctx.supabase
		.from("payment_plans")
		.select("*")
		.eq("user_id", user.id)
		.order("created_at", { ascending: false });

	if (error) {
		throw new Error(`Failed to fetch payment plans: ${error.message}`);
	}

	return plans.map(transformPaymentPlanFromDb);
}

// Get a payment plan by ID
export async function getPaymentPlanById({
	ctx,
	input,
}: HandlerInput<Schema.TGetPaymentPlanById>) {
	const { data: user } = await ctx.supabase
		.from("users")
		.select("id")
		.eq("clerk_user_id", ctx.userId)
		.single();

	if (!user) {
		throw new Error("User not found");
	}

	const { data: plan, error } = await ctx.supabase
		.from("payment_plans")
		.select("*")
		.eq("id", input.id)
		.eq("user_id", user.id)
		.single();

	if (error) {
		throw new Error(`Failed to fetch payment plan: ${error.message}`);
	}

	if (!plan) {
		throw new Error(
			"Payment plan not found or you don't have permission to access it",
		);
	}

	return transformPaymentPlanFromDb(plan);
}

// Get the active payment plan
export async function getActivePaymentPlan({ ctx }: HandlerCtx) {
	const { data: user } = await ctx.supabase
		.from("users")
		.select("id")
		.eq("clerk_user_id", ctx.userId)
		.single();

	if (!user) {
		throw new Error("User not found");
	}

	const { data: plan, error } = await ctx.supabase
		.from("payment_plans")
		.select("*")
		.eq("user_id", user.id)
		.eq("is_active", true)
		.single();

	if (error && error.code !== "PGRST116") {
		throw new Error(`Failed to fetch active payment plan: ${error.message}`);
	}

	return plan ? transformPaymentPlanFromDb(plan) : null;
}

export async function createPaymentPlan({
	ctx,
	input,
}: HandlerInput<Schema.TCreatePaymentPlan>) {
	const { data: user } = await ctx.supabase
		.from("users")
		.select("id")
		.eq("clerk_user_id", ctx.userId)
		.single();

	if (!user) {
		throw new Error("User not found");
	}

	// If this plan is being set as active, deactivate all other plans
	if (input.isActive) {
		await ctx.supabase
			.from("payment_plans")
			.update({ is_active: false })
			.eq("user_id", user.id);
	}

	const insertData = {
		user_id: user.id,
		name: input.name,
		strategy: input.strategy,
		monthly_budget: input.monthlyBudget,
		extra_payment: input.extraPayment,
		target_date: input.targetDate?.toISOString().split("T")[0] || null,
		is_active: input.isActive ?? false,
	};

	const { data: plan, error } = await ctx.supabase
		.from("payment_plans")
		.insert(insertData)
		.select("*")
		.single();

	if (error) {
		throw new Error(`Failed to create payment plan: ${error.message}`);
	}

	return transformPaymentPlanFromDb(plan);
}

export async function updatePaymentPlan({
	ctx,
	input,
}: HandlerInput<Schema.TUpdatePaymentPlan>) {
	const { data: user } = await ctx.supabase
		.from("users")
		.select("id")
		.eq("clerk_user_id", ctx.userId)
		.single();

	if (!user) {
		throw new Error("User not found");
	}

	const { id, ...updateData } = input;

	// If setting this plan as active, deactivate all other plans first
	if (updateData.isActive === true) {
		await ctx.supabase
			.from("payment_plans")
			.update({ is_active: false })
			.eq("user_id", user.id);
	}

	const dbUpdateData: PaymentPlanUpdate = {};
	if (updateData.name !== undefined) dbUpdateData.name = updateData.name;
	if (updateData.strategy !== undefined) {
		dbUpdateData.strategy = updateData.strategy;
	}
	if (updateData.monthlyBudget !== undefined) {
		dbUpdateData.monthly_budget = updateData.monthlyBudget;
	}
	if (updateData.extraPayment !== undefined) {
		dbUpdateData.extra_payment = updateData.extraPayment;
	}
	if (updateData.targetDate !== undefined) {
		dbUpdateData.target_date =
			updateData.targetDate?.toISOString().split("T")[0] || null;
	}
	if (updateData.isActive !== undefined) {
		dbUpdateData.is_active = updateData.isActive;
	}

	const { data: plan, error } = await ctx.supabase
		.from("payment_plans")
		.update(dbUpdateData)
		.eq("id", id)
		.eq("user_id", user.id)
		.select("*")
		.single();

	if (error) {
		throw new Error(`Failed to update payment plan: ${error.message}`);
	}

	if (!plan) {
		throw new Error(
			"Payment plan not found or you don't have permission to update it",
		);
	}

	return transformPaymentPlanFromDb(plan);
}

export async function deletePaymentPlan({
	ctx,
	input,
}: HandlerInput<Schema.TDeletePaymentPlan>) {
	const { data: user } = await ctx.supabase
		.from("users")
		.select("id")
		.eq("clerk_user_id", ctx.userId)
		.single();

	if (!user) {
		throw new Error("User not found");
	}

	// Verify the plan belongs to the user
	const { data: plan } = await ctx.supabase
		.from("payment_plans")
		.select("id, is_active")
		.eq("id", input.id)
		.eq("user_id", user.id)
		.single();

	if (!plan) {
		throw new Error(
			"Payment plan not found or you don't have permission to delete it",
		);
	}

	// Prevent deletion of active plan without confirmation
	if (plan.is_active) {
		throw new Error(
			"Cannot delete an active payment plan. Please deactivate it first.",
		);
	}

	const { error } = await ctx.supabase
		.from("payment_plans")
		.delete()
		.eq("id", input.id);

	if (error) {
		throw new Error(`Failed to delete payment plan: ${error.message}`);
	}

	return { success: true };
}

export async function activatePaymentPlan({
	ctx,
	input,
}: HandlerInput<Schema.TActivatePaymentPlan>) {
	const { data: user } = await ctx.supabase
		.from("users")
		.select("id")
		.eq("clerk_user_id", ctx.userId)
		.single();

	if (!user) {
		throw new Error("User not found");
	}

	// Verify the plan belongs to the user
	const { data: plan } = await ctx.supabase
		.from("payment_plans")
		.select("id")
		.eq("id", input.id)
		.eq("user_id", user.id)
		.single();

	if (!plan) {
		throw new Error(
			"Payment plan not found or you don't have permission to activate it",
		);
	}

	// Deactivate all plans for this user
	await ctx.supabase
		.from("payment_plans")
		.update({ is_active: false })
		.eq("user_id", user.id);

	// Activate the selected plan
	const { data: activatedPlan, error } = await ctx.supabase
		.from("payment_plans")
		.update({ is_active: true })
		.eq("id", input.id)
		.select("*")
		.single();

	if (error) {
		throw new Error(`Failed to activate payment plan: ${error.message}`);
	}

	return transformPaymentPlanFromDb(activatedPlan);
}
