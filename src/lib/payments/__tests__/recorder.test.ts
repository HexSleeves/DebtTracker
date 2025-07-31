import { describe, expect, it } from "bun:test";
import type { Debt } from "~/types";
import { editPayment, recordPayment, reversePayment } from "../recorder";

const baseDebt: Debt = {
	id: "d1",
	userId: "u1",
	name: "Test Debt",
	type: "loan",
	balance: 1000,
	originalBalance: 1000,
	interestRate: 10,
	minimumPayment: 50,
	dueDate: null,
	status: "active",
	paidOffDate: null,
	totalInterestPaid: 0,
	totalPaymentsMade: 0,
	createdAt: new Date(),
	updatedAt: new Date(),
};

describe("PaymentRecorder", () => {
	it("records a payment and updates debt", () => {
		const { updatedDebt, payment } = recordPayment(baseDebt, {
			amount: 100,
			paymentDate: new Date("2025-07-31"),
			type: "manual",
			paymentMethod: "manual",
			notes: "",
		});
		expect(updatedDebt.balance).toBeLessThan(baseDebt.balance);
		expect(payment.interestPortion + payment.principalPortion).toBeCloseTo(100);
	});

	it("edits a payment", () => {
		const { updatedDebt, payment } = recordPayment(baseDebt, {
			amount: 100,
			paymentDate: new Date("2025-07-31"),
			type: "manual",
			paymentMethod: "manual",
			notes: "",
		});
		const { updatedDebt: debt2, payment: edited } = editPayment(
			updatedDebt,
			payment,
			{
				amount: 150,
			},
		);
		expect(debt2.balance).toBeLessThan(updatedDebt.balance);
		expect(edited.amount).toBe(150);
	});

	it("reverses a payment", () => {
		const { updatedDebt, payment } = recordPayment(baseDebt, {
			amount: 100,
			paymentDate: new Date("2025-07-31"),
			type: "manual",
			paymentMethod: "manual",
			notes: "",
		});
		const reversed = reversePayment(updatedDebt, payment);
		expect(reversed.balance).toBeCloseTo(baseDebt.balance);
	});
});
