import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import * as handler from "./paymentPlan.handler";
import * as schema from "./paymentPlan.schema";

export const paymentPlanRouter = createTRPCRouter({
  // Get all payment plans for the current user
  getAll: protectedProcedure
    .query(handler.getAllPaymentPlans),

  // Get a specific payment plan by ID
  getById: protectedProcedure
    .input(schema.ZGetPaymentPlanById)
    .query(handler.getPaymentPlanById),

  // Get the active payment plan
  getActive: protectedProcedure
    .query(handler.getActivePaymentPlan),

  // Create a new payment plan
  create: protectedProcedure
    .input(schema.ZCreatePaymentPlan)
    .mutation(handler.createPaymentPlan),

  // Update an existing payment plan
  update: protectedProcedure
    .input(schema.ZUpdatePaymentPlan)
    .mutation(handler.updatePaymentPlan),

  // Delete a payment plan
  delete: protectedProcedure
    .input(schema.ZDeletePaymentPlan)
    .mutation(handler.deletePaymentPlan),

  // Activate a payment plan (deactivates all others)
  activate: protectedProcedure
    .input(schema.ZActivatePaymentPlan)
    .mutation(handler.activatePaymentPlan),
});
