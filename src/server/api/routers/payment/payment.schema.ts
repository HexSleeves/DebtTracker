import * as z from "zod/v4";

// Create a payment
export const ZCreatePayment = z.object({
	debtId: z.uuid(),
	amount: z.number().min(0.01, "Payment amount must be greater than 0"),
	paymentDate: z.date(),
	type: z.enum(["minimum", "extra", "full"]),
});
export type TCreatePayment = z.infer<typeof ZCreatePayment>;

// Update a payment
export const ZUpdatePayment = z.object({
	id: z.uuid(),
	amount: z
		.number()
		.min(0.01, "Payment amount must be greater than 0")
		.optional(),
	paymentDate: z.date().optional(),
	type: z.enum(["minimum", "extra", "full"]).optional(),
});

export type TUpdatePayment = z.infer<typeof ZUpdatePayment>;

// Get payments by debt ID
export const ZGetPaymentsByDebtId = z.object({
	debtId: z.uuid(),
});
export type TGetPaymentsByDebtId = z.infer<typeof ZGetPaymentsByDebtId>;

// Delete a payment
export const ZDeletePayment = z.object({
	id: z.uuid(),
});
export type TDeletePayment = z.infer<typeof ZDeletePayment>;
