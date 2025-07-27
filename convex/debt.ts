import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
	args: { userId: v.string() },
	handler: async (ctx, { userId }) => {
		return await ctx.db
			.query("debts")
			.withIndex("by_user", (q) => q.eq("clerk_user_id", userId))
			.collect();
	},
});

export const create = mutation({
	args: {
		userId: v.string(),
		name: v.string(),
		type: v.string(),
		balance: v.number(),
		originalBalance: v.number(),
		interestRate: v.number(),
		minimumPayment: v.number(),
		dueDate: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		// Validate business rules
		if (
			args.balance < 0 ||
			args.originalBalance < 0 ||
			args.minimumPayment < 0
		) {
			throw new Error("Financial amounts must be non-negative");
		}

		if (args.interestRate < 0 || args.interestRate > 100) {
			throw new Error("Interest rate must be between 0 and 1");
		}

		const { userId, originalBalance, interestRate, minimumPayment, ...rest } =
			args;

		const debtId = await ctx.db.insert("debts", {
			clerk_user_id: userId,
			original_balance: originalBalance,
			interest_rate: interestRate,
			minimum_payment: minimumPayment,
			...rest,
		});

		return debtId;
	},
});

export const getStats = query({
	args: { userId: v.string() },
	handler: async (ctx, { userId }) => {
		const debts = await ctx.db
			.query("debts")
			.withIndex("by_user", (q) => q.eq("clerk_user_id", userId))
			.collect();

		if (debts.length === 0) {
			return {
				totalDebts: 0,
				totalBalance: 0,
				totalOriginalBalance: 0,
				totalMinimumPayment: 0,
				averageInterestRate: 0,
				highestInterestRate: 0,
				lowestInterestRate: 0,
				totalPaidOff: 0,
				payoffPercentage: 0,
				debtsByType: {},
			};
		}

		const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
		const totalOriginalBalance = debts.reduce(
			(sum, debt) => sum + debt.original_balance,
			0,
		);
		const totalMinimumPayment = debts.reduce(
			(sum, debt) => sum + debt.minimum_payment,
			0,
		);
		const totalPaidOff = totalOriginalBalance - totalBalance;
		const payoffPercentage =
			totalOriginalBalance > 0
				? (totalPaidOff / totalOriginalBalance) * 100
				: 0;

		// Calculate interest rate statistics
		const interestRates = debts.map((debt) => debt.interest_rate);
		const averageInterestRate =
			interestRates.reduce((sum, rate) => sum + rate, 0) / debts.length;
		const highestInterestRate = Math.max(...interestRates);
		const lowestInterestRate = Math.min(...interestRates);

		// Group debts by type
		const debtsByType = debts.reduce(
			(acc, debt) => {
				if (!acc[debt.type]) {
					acc[debt.type] = {
						count: 0,
						totalBalance: 0,
						totalOriginalBalance: 0,
						averageInterestRate: 0,
					};
				}
				acc[debt.type].count += 1;
				acc[debt.type].totalBalance += debt.balance;
				acc[debt.type].totalOriginalBalance += debt.original_balance;
				acc[debt.type].averageInterestRate += debt.interest_rate;
				return acc;
			},
			{} as Record<
				string,
				{
					count: number;
					totalBalance: number;
					totalOriginalBalance: number;
					averageInterestRate: number;
				}
			>,
		);

		// Calculate average interest rate for each debt type
		Object.keys(debtsByType).forEach((type) => {
			debtsByType[type].averageInterestRate =
				debtsByType[type].averageInterestRate / debtsByType[type].count;
		});

		return {
			totalDebts: debts.length,
			totalBalance,
			totalOriginalBalance,
			totalMinimumPayment,
			averageInterestRate,
			highestInterestRate,
			lowestInterestRate,
			totalPaidOff,
			payoffPercentage,
			debtsByType,
		};
	},
});
