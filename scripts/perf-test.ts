import { calculateDebtAvalanche } from "../src/lib/algorithms/debt-avalanche";
import type { Debt } from "../src/types";

const debts: Debt[] = Array.from({ length: 100 }, (_, i) => ({
	id: `d${i}`,
	userId: "u1",
	name: `Debt ${i}`,
	type: "loan",
	balance: 1000 + i * 10,
	originalBalance: 1000 + i * 10,
	interestRate: 5 + (i % 5),
	minimumPayment: 50,
	dueDate: null,
	status: "active",
	paidOffDate: null,
	totalInterestPaid: 0,
	totalPaymentsMade: 0,
	createdAt: new Date(),
	updatedAt: new Date(),
}));

console.time("perf");
calculateDebtAvalanche(debts, 5000);
console.timeEnd("perf");
