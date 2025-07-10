import * as z from "zod/v4";

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
