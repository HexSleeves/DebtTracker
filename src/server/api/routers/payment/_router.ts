import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import * as handler from "./payment.handler";
import * as schema from "./payment.schema";

export const paymentRouter = createTRPCRouter({
	// Get all payments for the current user
	getAll: protectedProcedure.query(handler.getAllPayments),

	// Get payments for a specific debt
	getByDebtId: protectedProcedure
		.input(schema.ZGetPaymentsByDebtId)
		.query(handler.getPaymentsByDebtId),

	// Create a new payment
	create: protectedProcedure
		.input(schema.ZCreatePayment)
		.mutation(handler.createPayment),

	// Update an existing payment
	update: protectedProcedure
		.input(schema.ZUpdatePayment)
		.mutation(handler.updatePayment),

	// Delete a payment
	delete: protectedProcedure
		.input(schema.ZDeletePayment)
		.mutation(handler.deletePayment),
});
