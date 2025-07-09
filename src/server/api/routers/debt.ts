import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { Debt, DebtUpdate } from "~/types";

// Zod schemas for validation
const createDebtSchema = z.object({
  name: z.string().min(1, "Debt name is required"),
  type: z.enum(["credit_card", "loan", "mortgage", "other"]),
  balance: z.number().min(0, "Balance must be positive"),
  interestRate: z.number().min(0, "Interest rate must be positive"),
  minimumPayment: z.number().min(0, "Minimum payment must be positive"),
  dueDate: z.date().optional(),
});

const updateDebtSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Debt name is required").optional(),
  type: z.enum(["credit_card", "loan", "mortgage", "other"]).optional(),
  balance: z.number().min(0, "Balance must be positive").optional(),
  interestRate: z.number().min(0, "Interest rate must be positive").optional(),
  minimumPayment: z
    .number()
    .min(0, "Minimum payment must be positive")
    .optional(),
  dueDate: z.date().optional().nullable(),
});

export const debtRouter = createTRPCRouter({
  // Get all debts for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data: user } = await ctx.supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", ctx.userId)
      .single();

    if (!user) {
      throw new Error("User not found");
    }

    const { data: debts, error } = await ctx.supabase
      .from("debts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch debts: ${error.message}`);
    }

    return debts.map((debt) => ({
      id: debt.id,
      userId: debt.user_id,
      name: debt.name,
      type: debt.type as Debt["type"],
      balance: Number(debt.balance),
      interestRate: Number(debt.interest_rate),
      minimumPayment: Number(debt.minimum_payment),
      dueDate: debt.due_date ? new Date(debt.due_date) : null,
      createdAt: new Date(debt.created_at || new Date().toISOString()),
      updatedAt: new Date(debt.updated_at || new Date().toISOString()),
    })) as Debt[];
  }),

  // Get a single debt by ID
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

      const { data: debt, error } = await ctx.supabase
        .from("debts")
        .select("*")
        .eq("id", input.id)
        .eq("user_id", user.id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch debt: ${error.message}`);
      }

      if (!debt) {
        throw new Error("Debt not found");
      }

      return {
        id: debt.id,
        userId: debt.user_id,
        name: debt.name,
        type: debt.type as Debt["type"],
        balance: Number(debt.balance),
        interestRate: Number(debt.interest_rate),
        minimumPayment: Number(debt.minimum_payment),
        dueDate: debt.due_date ? new Date(debt.due_date) : null,
        createdAt: new Date(debt.created_at || new Date().toISOString()),
        updatedAt: new Date(debt.updated_at || new Date().toISOString()),
      } as Debt;
    }),

  // Create a new debt
  create: protectedProcedure
    .input(createDebtSchema)
    .mutation(async ({ ctx, input }) => {
      // First, ensure user exists in our database
      const { data: existingUser } = await ctx.supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", ctx.userId)
        .single();

      let userId: string;

      if (!existingUser) {
        // Create user if doesn't exist
        const { data: newUser, error: userError } = await ctx.supabase
          .from("users")
          .insert({
            clerk_user_id: ctx.userId,
            email: "", // This should be populated from Clerk webhook
          })
          .select("id")
          .single();

        if (userError || !newUser) {
          throw new Error(`Failed to create user: ${userError?.message}`);
        }

        userId = newUser.id;
      } else {
        userId = existingUser.id;
      }

      // Create the debt
      const { data: debt, error } = await ctx.supabase
        .from("debts")
        .insert({
          user_id: userId,
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

      return {
        id: debt.id,
        userId: debt.user_id,
        name: debt.name,
        type: debt.type as Debt["type"],
        balance: Number(debt.balance),
        interestRate: Number(debt.interest_rate),
        minimumPayment: Number(debt.minimum_payment),
        dueDate: debt.due_date ? new Date(debt.due_date) : null,
        createdAt: new Date(debt.created_at || new Date().toISOString()),
        updatedAt: new Date(debt.updated_at || new Date().toISOString()),
      } as Debt;
    }),

  // Update an existing debt
  update: protectedProcedure
    .input(updateDebtSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: user } = await ctx.supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", ctx.userId)
        .single();

      if (!user) {
        throw new Error("User not found");
      }

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
        dbUpdateData.due_date =
          updateData.dueDate?.toISOString().split("T")[0] || null;
      }

      const { data: debt, error } = await ctx.supabase
        .from("debts")
        .update(dbUpdateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select("*")
        .single();

      if (error) {
        throw new Error(`Failed to update debt: ${error.message}`);
      }

      if (!debt) {
        throw new Error(
          "Debt not found or you don't have permission to update it",
        );
      }

      return {
        id: debt.id,
        userId: debt.user_id,
        name: debt.name,
        type: debt.type as Debt["type"],
        balance: Number(debt.balance),
        interestRate: Number(debt.interest_rate),
        minimumPayment: Number(debt.minimum_payment),
        dueDate: debt.due_date ? new Date(debt.due_date) : null,
        createdAt: new Date(debt.created_at || new Date().toISOString()),
        updatedAt: new Date(debt.updated_at || new Date().toISOString()),
      } as Debt;
    }),

  // Delete a debt
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

      const { error } = await ctx.supabase
        .from("debts")
        .delete()
        .eq("id", input.id)
        .eq("user_id", user.id);

      if (error) {
        throw new Error(`Failed to delete debt: ${error.message}`);
      }

      return { success: true };
    }),

  // Get debt statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const { data: user } = await ctx.supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", ctx.userId)
      .single();

    if (!user) {
      throw new Error("User not found");
    }

    const { data: debts, error } = await ctx.supabase
      .from("debts")
      .select("balance, interest_rate, minimum_payment")
      .eq("user_id", user.id);

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
  }),
});
