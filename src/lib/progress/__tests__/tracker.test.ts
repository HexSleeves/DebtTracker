import type { Debt, Payment } from "~/types";
import { calculateProgress, detectMilestones } from "../tracker";

describe("ProgressTracker", () => {
	const baseDebt: Debt = {
		id: "d1",
		userId: "u1",
		name: "Test Debt",
		type: "loan",
		balance: 750,
		originalBalance: 1000,
		interestRate: 5,
		minimumPayment: 100,
		dueDate: null,
		status: "active",
		paidOffDate: null,
		totalInterestPaid: 0,
		totalPaymentsMade: 0,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	const payment: Payment = {
		id: "p1",
		debtId: "d1",
		amount: 250,
		paymentDate: new Date(),
		type: "manual",
		balanceAfterPayment: null,
		interestPortion: 0,
		principalPortion: 250,
		paymentMethod: "manual",
		notes: null,
		createdAt: new Date(),
	};

	it("detects milestone thresholds", () => {
		const milestones = detectMilestones(baseDebt, payment);
		const types = milestones.map((m) => m.milestoneType);
		expect(types).toContain("25_percent_paid");
		expect(types).toContain("50_percent_paid");
	});

	it("calculates progress", () => {
		const progress = calculateProgress(baseDebt, [payment]);
		expect(progress.percentagePaid).toBeCloseTo(25);
		expect(progress.remainingBalance).toBe(750);
	});
});
