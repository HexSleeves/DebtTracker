import { describe, expect, it } from "bun:test";
import type { Debt } from "~/types";
import { generateRecommendations } from "../engine";

const debts: Debt[] = [
	{
		id: "d1",
		userId: "u1",
		name: "Card A",
		type: "credit_card",
		balance: 500,
		originalBalance: 500,
		interestRate: 20,
		minimumPayment: 50,
		dueDate: null,
		status: "active",
		paidOffDate: null,
		totalInterestPaid: 0,
		totalPaymentsMade: 0,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: "d2",
		userId: "u1",
		name: "Loan B",
		type: "loan",
		balance: 1000,
		originalBalance: 1000,
		interestRate: 5,
		minimumPayment: 75,
		dueDate: null,
		status: "active",
		paidOffDate: null,
		totalInterestPaid: 0,
		totalPaymentsMade: 0,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

describe("RecommendationEngine", () => {
	it("generates avalanche recommendations", () => {
		const recs = generateRecommendations(debts, 200, "avalanche");
		expect(recs.length).toBe(2);
		expect(recs[0].amount).toBeGreaterThan(debts[0].minimumPayment);
	});

	it("generates snowball recommendations", () => {
		const recs = generateRecommendations(debts, 200, "snowball");
		expect(recs.length).toBe(2);
		expect(recs[0].amount).toBeGreaterThan(0);
	});
});
