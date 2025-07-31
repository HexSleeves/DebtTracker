import { describe, expect, it } from "bun:test";
import type { Debt, Payment } from "~/types";
import { applyPayment, calculatePaymentBreakdown } from "../processor";

describe("PaymentProcessor", () => {
	const debt: Debt = {
		id: "d1",
		userId: "u1",
		name: "Test",
		type: "loan",
		balance: 1000,
		originalBalance: 1000,
		interestRate: 12,
		minimumPayment: 50,
		dueDate: null,
		status: "active",
		paidOffDate: null,
		totalInterestPaid: 0,
		totalPaymentsMade: 0,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	it("calculates breakdown", () => {
		const { interestPortion, principalPortion } = calculatePaymentBreakdown(
			debt,
			100,
			{
				paymentDate: new Date("2025-07-31"),
				lastPaymentDate: new Date("2025-06-30"),
			},
		);
		expect(interestPortion).toBeGreaterThan(0);
		expect(principalPortion).toBeCloseTo(100 - interestPortion);
	});

	it("applies payment and updates balance", () => {
		const payment: Payment = {
			id: "p1",
			debtId: "d1",
			amount: 100,
			paymentDate: new Date("2025-07-31"),
			type: "manual",
			balanceAfterPayment: null,
			interestPortion: 0,
			principalPortion: 0,
			paymentMethod: "manual",
			notes: null,
			createdAt: new Date(),
		};
		const { newBalance, breakdown } = applyPayment(debt, payment, {
			lastPaymentDate: new Date("2025-06-30"),
		});
		expect(newBalance).toBeLessThan(debt.balance);
		expect(breakdown.principalPortion + breakdown.interestPortion).toBeCloseTo(
			100,
		);
	});
});
