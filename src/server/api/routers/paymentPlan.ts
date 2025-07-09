import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { PaymentPlan, PaymentPlanUpdate } from "~/types";

// Zod schemas for validation
const createPaymentPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required").max(100),
  strategy: z.enum(["avalanche", "snowball", "custom"]),
  monthlyBudget: z.number().min(0, "Monthly budget must be non-negative"),
  extraPayment: z.number().min(0, "Extra payment must be non-negative"),
  targetDate: z.date().optional(),
  isActive: z.boolean().default(false),
});

const updatePaymentPlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Plan name is required").max(100).optional(),
  strategy: z.enum(["avalanche", "snowball", "custom"]).optional(),
  monthlyBudget: z
    .number()
    .min(0, "Monthly budget must be non-negative")
    .optional(),
  extraPayment: z
    .number()
    .min(0, "Extra payment must be non-negative")
    .optional(),
  targetDate: z.date().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const paymentPlanRouter = createTRPCRouter({
  // Get all payment plans for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
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

    return plans.map((plan) => ({
      id: plan.id,
      userId: plan.user_id,
      name: plan.name,
      strategy: plan.strategy as PaymentPlan["strategy"],
      monthlyBudget: Number(plan.monthly_budget),
      extraPayment: Number(plan.extra_payment),
      targetDate: plan.target_date ? new Date(plan.target_date) : null,
      isActive: plan.is_active,
      createdAt: new Date(plan.created_at || new Date().toISOString()),
      updatedAt: new Date(plan.updated_at || new Date().toISOString()),
    })) as PaymentPlan[];
  }),

  // Get a specific payment plan by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
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

      return {
        id: plan.id,
        userId: plan.user_id,
        name: plan.name,
        strategy: plan.strategy as PaymentPlan["strategy"],
        monthlyBudget: Number(plan.monthly_budget),
        extraPayment: Number(plan.extra_payment),
        targetDate: plan.target_date ? new Date(plan.target_date) : null,
        isActive: plan.is_active,
        createdAt: new Date(plan.created_at || new Date().toISOString()),
        updatedAt: new Date(plan.updated_at || new Date().toISOString()),
      } as PaymentPlan;
    }),

  // Get the currently active payment plan
  getActive: protectedProcedure.query(async ({ ctx }) => {
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
      // PGRST116 is "not found"
      throw new Error(`Failed to fetch active payment plan: ${error.message}`);
    }

    if (!plan) {
      return null;
    }

    return {
      id: plan.id,
      userId: plan.user_id,
      name: plan.name,
      strategy: plan.strategy as PaymentPlan["strategy"],
      monthlyBudget: Number(plan.monthly_budget),
      extraPayment: Number(plan.extra_payment),
      targetDate: plan.target_date ? new Date(plan.target_date) : null,
      isActive: plan.is_active,
      createdAt: new Date(plan.created_at || new Date().toISOString()),
      updatedAt: new Date(plan.updated_at || new Date().toISOString()),
    } as PaymentPlan;
  }),

  // Create a new payment plan
  create: protectedProcedure
    .input(createPaymentPlanSchema)
    .mutation(async ({ ctx, input }) => {
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

      const { data: plan, error } = await ctx.supabase
        .from("payment_plans")
        .insert({
          user_id: user.id,
          name: input.name,
          strategy: input.strategy,
          monthly_budget: input.monthlyBudget,
          extra_payment: input.extraPayment,
          target_date: input.targetDate?.toISOString().split("T")[0] || null,
          is_active: input.isActive,
        })
        .select("*")
        .single();

      if (error) {
        throw new Error(`Failed to create payment plan: ${error.message}`);
      }

      return {
        id: plan.id,
        userId: plan.user_id,
        name: plan.name,
        strategy: plan.strategy as PaymentPlan["strategy"],
        monthlyBudget: Number(plan.monthly_budget),
        extraPayment: Number(plan.extra_payment),
        targetDate: plan.target_date ? new Date(plan.target_date) : null,
        isActive: plan.is_active,
        createdAt: new Date(plan.created_at || new Date().toISOString()),
        updatedAt: new Date(plan.updated_at || new Date().toISOString()),
      } as PaymentPlan;
    }),

  // Update an existing payment plan
  update: protectedProcedure
    .input(updatePaymentPlanSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: user } = await ctx.supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", ctx.userId)
        .single();

      if (!user) {
        throw new Error("User not found");
      }

      // Verify the plan belongs to the user
      const { data: existingPlan } = await ctx.supabase
        .from("payment_plans")
        .select("id")
        .eq("id", input.id)
        .eq("user_id", user.id)
        .single();

      if (!existingPlan) {
        throw new Error(
          "Payment plan not found or you don't have permission to update it",
        );
      }

      // If this plan is being set as active, deactivate all other plans
      if (input.isActive) {
        await ctx.supabase
          .from("payment_plans")
          .update({ is_active: false })
          .eq("user_id", user.id)
          .neq("id", input.id);
      }

      const { id, ...updateData } = input;

      // Convert camelCase to snake_case for database
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
        .select("*")
        .single();

      if (error) {
        throw new Error(`Failed to update payment plan: ${error.message}`);
      }

      return {
        id: plan.id,
        userId: plan.user_id,
        name: plan.name,
        strategy: plan.strategy as PaymentPlan["strategy"],
        monthlyBudget: Number(plan.monthly_budget),
        extraPayment: Number(plan.extra_payment),
        targetDate: plan.target_date ? new Date(plan.target_date) : null,
        isActive: plan.is_active,
        createdAt: new Date(plan.created_at || new Date().toISOString()),
        updatedAt: new Date(plan.updated_at || new Date().toISOString()),
      } as PaymentPlan;
    }),

  // Delete a payment plan
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
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
    }),

  // Activate a payment plan (deactivates all others)
  activate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
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

      // Activate the specified plan
      const { data: activatedPlan, error } = await ctx.supabase
        .from("payment_plans")
        .update({ is_active: true })
        .eq("id", input.id)
        .select("*")
        .single();

      if (error) {
        throw new Error(`Failed to activate payment plan: ${error.message}`);
      }

      return {
        id: activatedPlan.id,
        userId: activatedPlan.user_id,
        name: activatedPlan.name,
        strategy: activatedPlan.strategy as PaymentPlan["strategy"],
        monthlyBudget: Number(activatedPlan.monthly_budget),
        extraPayment: Number(activatedPlan.extra_payment),
        targetDate: activatedPlan.target_date
          ? new Date(activatedPlan.target_date)
          : null,
        isActive: activatedPlan.is_active,
        createdAt: new Date(
          activatedPlan.created_at || new Date().toISOString(),
        ),
        updatedAt: new Date(
          activatedPlan.updated_at || new Date().toISOString(),
        ),
      } as PaymentPlan;
    }),

  // Deactivate the currently active payment plan
  deactivate: protectedProcedure.mutation(async ({ ctx }) => {
    const { data: user } = await ctx.supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", ctx.userId)
      .single();

    if (!user) {
      throw new Error("User not found");
    }

    const { error } = await ctx.supabase
      .from("payment_plans")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (error) {
      throw new Error(`Failed to deactivate payment plan: ${error.message}`);
    }

    return { success: true };
  }),

  // Get payment plan statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
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
      .select("strategy, monthly_budget, extra_payment, is_active")
      .eq("user_id", user.id);

    if (error) {
      throw new Error(
        `Failed to fetch payment plan statistics: ${error.message}`,
      );
    }

    const totalPlans = plans.length;
    const activePlans = plans.filter((p) => p.is_active).length;

    const totalMonthlyBudget = plans
      .filter((p) => p.is_active)
      .reduce((sum, plan) => sum + Number(plan.monthly_budget), 0);

    const totalExtraPayment = plans
      .filter((p) => p.is_active)
      .reduce((sum, plan) => sum + Number(plan.extra_payment), 0);

    // Strategy breakdown
    const strategyCounts = {
      avalanche: plans.filter((p) => p.strategy === "avalanche").length,
      snowball: plans.filter((p) => p.strategy === "snowball").length,
      custom: plans.filter((p) => p.strategy === "custom").length,
    };

    return {
      totalPlans,
      activePlans,
      totalMonthlyBudget,
      totalExtraPayment,
      strategyCounts,
    };
  }),
});
