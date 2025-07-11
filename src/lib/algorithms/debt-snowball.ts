import type { Debt } from "~/types/db.helpers";
import type {
  DebtPayoffProjection,
  PaymentRecommendation,
} from "./debt-avalanche";

export interface SnowballResult {
  paymentRecommendations: PaymentRecommendation[];
  projections: DebtPayoffProjection[];
  totalMonthsToDebtFree: number;
  totalInterestPaid: number;
  debtFreeDate: Date;
  debtsEliminatedByMonth: Array<{
    month: number;
    date: Date;
    debtName: string;
    debtId: string;
  }>;
  monthlyBreakdown: Array<{
    month: number;
    date: Date;
    payments: Array<{
      debtId: string;
      debtName: string;
      payment: number;
      remainingBalance: number;
    }>;
    totalPayment: number;
    debtsRemaining: number;
  }>;
}

/**
 * Implements the Debt Snowball strategy
 * Prioritizes debts by smallest balance first for psychological motivation
 */
export function calculateDebtSnowball(
  debts: Debt[],
  monthlyBudget: number,
): SnowballResult {
  if (debts.length === 0) {
    return {
      paymentRecommendations: [],
      projections: [],
      totalMonthsToDebtFree: 0,
      totalInterestPaid: 0,
      debtFreeDate: new Date(),
      debtsEliminatedByMonth: [],
      monthlyBreakdown: [],
    };
  }

  // Sort debts by balance (smallest first)
  const sortedDebts = [...debts].sort((a, b) => a.balance - b.balance);

  // Calculate total minimum payments
  const totalMinimumPayments = sortedDebts.reduce(
    (sum, debt) => sum + debt.minimumPayment,
    0,
  );

  if (monthlyBudget < totalMinimumPayments) {
    throw new Error(
      `Monthly budget ($${monthlyBudget.toFixed(
        2,
      )}) is less than total minimum payments ($${totalMinimumPayments.toFixed(
        2,
      )})`,
    );
  }

  const extraPayment = monthlyBudget - totalMinimumPayments;

  // Generate payment recommendations
  const paymentRecommendations: PaymentRecommendation[] = sortedDebts.map(
    (debt, index) => ({
      debtId: debt.id,
      debtName: debt.name,
      recommendedPayment:
        debt.minimumPayment + (index === 0 ? extraPayment : 0),
      isMinimumPayment: index !== 0,
      priorityRank: index + 1,
    }),
  );

  // Calculate detailed projections with month-by-month breakdown
  const {
    projections,
    monthlyBreakdown,
    totalMonthsToDebtFree,
    debtsEliminatedByMonth,
    totalInterestPaid,
  } = simulateSnowballPayments(sortedDebts, monthlyBudget);

  // Calculate debt-free date
  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + totalMonthsToDebtFree);

  return {
    paymentRecommendations,
    projections,
    totalMonthsToDebtFree,
    totalInterestPaid,
    debtFreeDate,
    debtsEliminatedByMonth,
    monthlyBreakdown,
  };
}

function simulateSnowballPayments(sortedDebts: Debt[], monthlyBudget: number) {
  // Create working copies of debts
  const workingDebts = sortedDebts.map((debt) => ({
    ...debt,
    remainingBalance: debt.balance,
    totalInterestPaid: 0,
    monthsPaid: 0,
    isEliminated: false,
  }));

  const monthlyBreakdown: SnowballResult["monthlyBreakdown"] = [];
  const debtsEliminatedByMonth: SnowballResult["debtsEliminatedByMonth"] = [];
  let currentMonth = 0;
  const currentDate = new Date();

  while (workingDebts.some((debt) => debt.remainingBalance > 0)) {
    currentMonth++;
    const monthDate = new Date(currentDate);
    monthDate.setMonth(monthDate.getMonth() + currentMonth);

    const monthPayments: Array<{
      debtId: string;
      debtName: string;
      payment: number;
      remainingBalance: number;
    }> = [];

    let remainingBudget = monthlyBudget;

    // First, pay minimum payments on all remaining debts
    for (const debt of workingDebts) {
      if (debt.remainingBalance > 0) {
        const interestCharge =
          (debt.remainingBalance * debt.interestRate) / 100 / 12;
        const minimumPayment = Math.min(
          debt.minimumPayment,
          debt.remainingBalance + interestCharge,
        );

        debt.totalInterestPaid += interestCharge;
        debt.remainingBalance = Math.max(
          0,
          debt.remainingBalance + interestCharge - minimumPayment,
        );
        remainingBudget -= minimumPayment;

        monthPayments.push({
          debtId: debt.id,
          debtName: debt.name,
          payment: minimumPayment,
          remainingBalance: debt.remainingBalance,
        });

        // Check if debt is eliminated
        if (debt.remainingBalance === 0 && !debt.isEliminated) {
          debt.isEliminated = true;
          debt.monthsPaid = currentMonth;
          debtsEliminatedByMonth.push({
            month: currentMonth,
            date: monthDate,
            debtName: debt.name,
            debtId: debt.id,
          });
        }
      }
    }

    // Then, apply extra payment to smallest remaining balance
    if (remainingBudget > 0) {
      const targetDebt = workingDebts.find((debt) => debt.remainingBalance > 0);
      if (targetDebt) {
        const extraPayment = Math.min(
          remainingBudget,
          targetDebt.remainingBalance,
        );
        targetDebt.remainingBalance -= extraPayment;

        // Update the payment in monthPayments
        const paymentRecord = monthPayments.find(
          (p) => p.debtId === targetDebt.id,
        );
        if (paymentRecord) {
          paymentRecord.payment += extraPayment;
          paymentRecord.remainingBalance = targetDebt.remainingBalance;
        }

        // Check if this extra payment eliminates the debt
        if (targetDebt.remainingBalance === 0 && !targetDebt.isEliminated) {
          targetDebt.isEliminated = true;
          targetDebt.monthsPaid = currentMonth;
          debtsEliminatedByMonth.push({
            month: currentMonth,
            date: monthDate,
            debtName: targetDebt.name,
            debtId: targetDebt.id,
          });
        }
      }
    }

    const debtsRemaining = workingDebts.filter(
      (debt) => debt.remainingBalance > 0,
    ).length;

    monthlyBreakdown.push({
      month: currentMonth,
      date: monthDate,
      payments: monthPayments,
      totalPayment: monthlyBudget,
      debtsRemaining,
    });

    // Safety check to prevent infinite loops
    if (currentMonth > 600) {
      // 50 years max
      break;
    }
  }

  // Generate projections
  const projections: DebtPayoffProjection[] = workingDebts.map((debt) => {
    const payoffDate = new Date(currentDate);
    payoffDate.setMonth(payoffDate.getMonth() + debt.monthsPaid);

    return {
      debtId: debt.id,
      debtName: debt.name,
      currentBalance: debt.balance,
      monthsToPayoff: debt.monthsPaid,
      totalInterestPaid: debt.totalInterestPaid,
      payoffDate,
    };
  });

  const totalInterestPaid = workingDebts.reduce(
    (sum, debt) => sum + debt.totalInterestPaid,
    0,
  );

  return {
    projections,
    monthlyBreakdown,
    totalMonthsToDebtFree: currentMonth,
    debtsEliminatedByMonth,
    totalInterestPaid,
  };
}
