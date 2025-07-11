import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import * as handler from "./debt.handler";
import * as schema from "./debt.schema";

export const debtRouter = createTRPCRouter({
  // Get all debts for the current user
  getAll: protectedProcedure.query(handler.getDebts),

  // Get a single debt by ID
  getById: protectedProcedure
    .input(schema.ZGetDebtById)
    .query(handler.getDebtById),

  // Create a new debt
  create: protectedProcedure
    .input(schema.ZCreateDebt)
    .mutation(handler.createDebt),

  // Update an existing debt
  update: protectedProcedure
    .input(schema.ZUpdateDebt)
    .mutation(handler.updateDebt),

  // Delete a debt
  delete: protectedProcedure
    .input(schema.ZDeleteDebt)
    .mutation(handler.deleteDebt),

  // Get debt statistics
  getStats: protectedProcedure.query(handler.getDebtStats),
});
