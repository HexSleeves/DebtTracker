import * as z from "zod/v4";

// Debt calculation input schema (simplified, only fields needed for algorithms)
const ZDebtCalculationInput = z.object({
  id: z.string(),
  name: z.string(),
  balance: z.number().min(0),
  interestRate: z.number().min(0),
  minimumPayment: z.number().min(0),
});

// Calculate debt strategies
export const ZCalculateStrategies = z.object({
  debts: z.array(ZDebtCalculationInput).min(1, "At least one debt is required"),
  monthlyBudget: z.number().min(0, "Monthly budget must be non-negative"),
  monthlyIncome: z.number().min(0).optional(),
});
export type TCalculateStrategies = z.infer<typeof ZCalculateStrategies>;

// Calculate debt metrics
export const ZCalculateMetrics = z.object({
  debts: z.array(ZDebtCalculationInput).min(1, "At least one debt is required"),
  monthlyIncome: z.number().min(0).optional(),
});
export type TCalculateMetrics = z.infer<typeof ZCalculateMetrics>;

// Calculate budget impact
export const ZCalculateBudgetImpact = z.object({
  debts: z.array(ZDebtCalculationInput).min(1, "At least one debt is required"),
  currentBudget: z.number().min(0, "Current budget must be non-negative"),
  increasedBudget: z.number().min(0, "Increased budget must be non-negative"),
});
export type TCalculateBudgetImpact = z.infer<typeof ZCalculateBudgetImpact>;

// Create a payment plan
export const ZCreatePaymentPlan = z.object({
  name: z.string().min(1, "Plan name is required").max(100),
  strategy: z.enum(["avalanche", "snowball", "custom"]),
  monthlyBudget: z.number().min(0, "Monthly budget must be non-negative"),
  extraPayment: z.number().min(0, "Extra payment must be non-negative"),
  targetDate: z.date().optional(),
  isActive: z.boolean().default(false),
});
export type TCreatePaymentPlan = z.infer<typeof ZCreatePaymentPlan>;

// Update a payment plan
export const ZUpdatePaymentPlan = z.object({
  id: z.uuid(),
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

export type TUpdatePaymentPlan = z.infer<typeof ZUpdatePaymentPlan>;

// Get a payment plan by ID
export const ZGetPaymentPlanById = z.object({
  id: z.uuid(),
});
export type TGetPaymentPlanById = z.infer<typeof ZGetPaymentPlanById>;

// Delete a payment plan
export const ZDeletePaymentPlan = z.object({
  id: z.uuid(),
});
export type TDeletePaymentPlan = z.infer<typeof ZDeletePaymentPlan>;

// Activate a payment plan
export const ZActivatePaymentPlan = z.object({
  id: z.uuid(),
});
export type TActivatePaymentPlan = z.infer<typeof ZActivatePaymentPlan>;
