import type { ProtectedTRPCContext } from "~/server/api/trpc";
import {
  calculateBudgetImpact,
  calculateDebtToIncomeRatio,
  calculateExtraPayment,
  calculateTotalMinimumPayments,
  calculateWeightedAverageInterestRate,
  compareStrategies,
  estimateMinimumPaymentTimeline,
} from "~/server/lib/algorithms/calculator";
import { calculateDebtAvalanche } from "~/server/lib/algorithms/debt-avalanche";
import { calculateDebtSnowball } from "~/server/lib/algorithms/debt-snowball";
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
  const { data: plans, error } = await ctx.supabase
    .from("payment_plans")
    .select("*")
    .eq("clerk_user_id", ctx.userId)
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
  const { data: plan, error } = await ctx.supabase
    .from("payment_plans")
    .select("*")
    .eq("id", input.id)
    .eq("clerk_user_id", ctx.userId)
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
  const { data: plan, error } = await ctx.supabase
    .from("payment_plans")
    .select("*")
    .eq("clerk_user_id", ctx.userId)
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
  // If this plan is being set as active, deactivate all other plans
  if (input.isActive) {
    await ctx.supabase
      .from("payment_plans")
      .update({ is_active: false })
      .eq("clerk_user_id", ctx.userId);
  }

  const insertData = {
    clerk_user_id: ctx.userId,
    name: input.name,
    strategy: input.strategy,
    monthly_budget: input.monthlyBudget,
    extra_payment: input.extraPayment,
    target_date: input.targetDate?.toISOString() ?? null,
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
  const { id, ...updateData } = input;

  // If setting this plan as active, deactivate all other plans first
  if (updateData.isActive === true) {
    await ctx.supabase
      .from("payment_plans")
      .update({ is_active: false })
      .eq("clerk_user_id", ctx.userId);
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
    dbUpdateData.target_date = updateData.targetDate?.toISOString() ?? null;
  }
  if (updateData.isActive !== undefined) {
    dbUpdateData.is_active = updateData.isActive;
  }

  const { data: plan, error } = await ctx.supabase
    .from("payment_plans")
    .update(dbUpdateData)
    .eq("id", id)
    .eq("clerk_user_id", ctx.userId)
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
  const { error } = await ctx.supabase
    .from("payment_plans")
    .delete()
    .eq("id", input.id)
    .eq("clerk_user_id", ctx.userId);

  if (error) {
    throw new Error(`Failed to delete payment plan: ${error.message}`);
  }

  return { success: true };
}

export async function activatePaymentPlan({
  ctx,
  input,
}: HandlerInput<Schema.TActivatePaymentPlan>) {
  // First, deactivate all existing plans
  await ctx.supabase
    .from("payment_plans")
    .update({ is_active: false })
    .eq("clerk_user_id", ctx.userId);

  // Then activate the specified plan
  const { data: plan, error } = await ctx.supabase
    .from("payment_plans")
    .update({ is_active: true })
    .eq("id", input.id)
    .eq("clerk_user_id", ctx.userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to activate payment plan: ${error.message}`);
  }

  if (!plan) {
    throw new Error(
      "Payment plan not found or you don't have permission to activate it",
    );
  }

  return transformPaymentPlanFromDb(plan);
}

// Algorithm calculation handlers
export async function calculateStrategies({
  input,
}: HandlerInput<Schema.TCalculateStrategies>) {
  const { debts, monthlyBudget, monthlyIncome } = input;

  try {
    const avalanche = calculateDebtAvalanche(debts, monthlyBudget);
    const snowball = calculateDebtSnowball(debts, monthlyBudget);
    const comparison = compareStrategies(debts, monthlyBudget);

    // Calculate metrics
    const totalMinimumPayments = calculateTotalMinimumPayments(debts);
    const debtToIncomeRatio = monthlyIncome
      ? calculateDebtToIncomeRatio(debts, monthlyIncome)
      : null;
    const weightedAverageInterestRate =
      calculateWeightedAverageInterestRate(debts);
    const extraPayment = calculateExtraPayment(debts, monthlyBudget);
    const minimumPaymentTimeline = estimateMinimumPaymentTimeline(debts);

    return {
      avalanche,
      snowball,
      comparison,
      metrics: {
        totalMinimumPayments,
        debtToIncomeRatio,
        weightedAverageInterestRate,
        extraPayment,
        minimumPaymentTimeline,
      },
    };
  } catch (error) {
    throw new Error(
      `Failed to calculate strategies: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function calculateMetrics({
  input,
}: HandlerInput<Schema.TCalculateMetrics>) {
  const { debts, monthlyIncome } = input ?? {
    debts: [],
    monthlyIncome: 0,
  };

  try {
    if (debts.length === 0) {
      return {
        totalDebt: 0,
        totalMinimumPayments: 0,
        debtToIncomeRatio: null,
        weightedAverageInterestRate: 0,
        highestInterestRate: 0,
        lowestInterestRate: 0,
        averageBalance: 0,
      };
    }

    const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const totalMinimumPayments = calculateTotalMinimumPayments(debts);
    const debtToIncomeRatio = monthlyIncome
      ? calculateDebtToIncomeRatio(debts, monthlyIncome)
      : null;
    const weightedAverageInterestRate =
      calculateWeightedAverageInterestRate(debts);
    const interestRates = debts.map((debt) => debt.interestRate);
    const highestInterestRate = Math.max(...interestRates);
    const lowestInterestRate = Math.min(...interestRates);
    const averageBalance = totalDebt / debts.length;

    return {
      totalDebt,
      totalMinimumPayments,
      debtToIncomeRatio,
      weightedAverageInterestRate,
      highestInterestRate,
      lowestInterestRate,
      averageBalance,
    };
  } catch (error) {
    throw new Error(
      `Failed to calculate metrics: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function calculateBudgetImpactHandler({
  input,
}: HandlerInput<Schema.TCalculateBudgetImpact>) {
  const { debts, currentBudget, increasedBudget } = input;

  try {
    const impact = calculateBudgetImpact(debts, currentBudget, increasedBudget);
    return impact;
  } catch (error) {
    throw new Error(
      `Failed to calculate budget impact: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
