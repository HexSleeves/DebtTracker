import type { Debt } from "~/types/db.helpers";

export interface PaymentRecommendation {
  debtId: string;
  debtName: string;
  recommendedPayment: number;
  isMinimumPayment: boolean;
  priorityRank: number;
}

export interface DebtPayoffProjection {
  debtId: string;
  debtName: string;
  currentBalance: number;
  monthsToPayoff: number;
  totalInterestPaid: number;
  payoffDate: Date;
}

export interface AvalancheResult {
  paymentRecommendations: PaymentRecommendation[];
  projections: DebtPayoffProjection[];
  totalMonthsToDebtFree: number;
  totalInterestSaved: number;
  debtFreeDate: Date;
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
  }>;
}

/**
 * Implements the Debt Avalanche strategy
 * Prioritizes debts by highest interest rate first
 */
export function calculateDebtAvalanche(
  debts: Debt[],
  monthlyBudget: number,
): AvalancheResult {
  if (debts.length === 0) {
    return {
      paymentRecommendations: [],
      projections: [],
      totalMonthsToDebtFree: 0,
      totalInterestSaved: 0,
      debtFreeDate: new Date(),
      monthlyBreakdown: [],
    };
  }

  // Sort debts by interest rate (highest first)
  const sortedDebts = [...debts].sort(
    (a, b) => b.interestRate - a.interestRate,
  );

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
  const { projections, monthlyBreakdown, totalMonthsToDebtFree } =
    simulateAvalanchePayments(sortedDebts, monthlyBudget);

  // Calculate debt-free date
  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + totalMonthsToDebtFree);

  // Calculate total interest that would be paid with minimum payments only
  const minimumPaymentInterest = calculateMinimumPaymentInterest(debts);
  const avalancheInterest = projections.reduce(
    (sum, projection) => sum + projection.totalInterestPaid,
    0,
  );
  const totalInterestSaved = minimumPaymentInterest - avalancheInterest;

  return {
    paymentRecommendations,
    projections,
    totalMonthsToDebtFree,
    totalInterestSaved,
    debtFreeDate,
    monthlyBreakdown,
  };
}

function simulateAvalanchePayments(sortedDebts: Debt[], monthlyBudget: number) {
  // Create working copies of debts
  const workingDebts = sortedDebts.map((debt) => ({
    ...debt,
    remainingBalance: debt.balance,
    totalInterestPaid: 0,
    monthsPaid: 0,
  }));

  const monthlyBreakdown: AvalancheResult["monthlyBreakdown"] = [];
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

    // First, pay minimum payments on all debts
    for (const debt of workingDebts) {
      if (debt.remainingBalance > 0) {
        const minimumPayment = Math.min(
          debt.minimumPayment,
          debt.remainingBalance,
        );
        const interestCharge =
          (debt.remainingBalance * debt.interestRate) / 100 / 12;

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
      }
    }

    // Then, apply extra payment to highest interest rate debt
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
      }
    }

    monthlyBreakdown.push({
      month: currentMonth,
      date: monthDate,
      payments: monthPayments,
      totalPayment: monthlyBudget,
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

  return {
    projections,
    monthlyBreakdown,
    totalMonthsToDebtFree: currentMonth,
  };
}

function calculateMinimumPaymentInterest(debts: Debt[]): number {
  return debts.reduce((total, debt) => {
    let balance = debt.balance;
    let totalInterest = 0;
    let months = 0;

    while (balance > 0 && months < 600) {
      // 50 years max
      const interestCharge = (balance * debt.interestRate) / 100 / 12;
      const payment = Math.min(debt.minimumPayment, balance + interestCharge);

      totalInterest += interestCharge;
      balance = Math.max(0, balance + interestCharge - payment);
      months++;
    }

    return total + totalInterest;
  }, 0);
}
