import {
  addCurrency,
  createCurrency,
  divideCurrency,
  formatCurrency as formatCurrencyUtil,
  getCurrencyValue,
  multiplyCurrency,
  subtractCurrency,
  sumCurrency,
} from "~/lib/currency";
import type { Debt } from "~/types/db.helpers";
import { calculateDebtAvalanche } from "./debt-avalanche";
import { calculateDebtSnowball } from "./debt-snowball";

export interface StrategyComparison {
  avalanche: {
    totalMonthsToDebtFree: number;
    totalInterestPaid: number;
    debtFreeDate: Date;
  };
  snowball: {
    totalMonthsToDebtFree: number;
    totalInterestPaid: number;
    debtFreeDate: Date;
    debtsEliminatedByMonth: Array<{
      month: number;
      date: Date;
      debtName: string;
    }>;
  };
  comparison: {
    interestSavingsWithAvalanche: number;
    timeSavingsWithAvalanche: number; // in months
    motivationalBenefitOfSnowball: number; // number of debts eliminated in first 12 months
  };
}

/**
 * Compare debt avalanche vs snowball strategies
 */
export function compareStrategies(
  debts: Debt[],
  monthlyBudget: number,
): StrategyComparison {
  const avalancheResult = calculateDebtAvalanche(debts, monthlyBudget);
  const snowballResult = calculateDebtSnowball(debts, monthlyBudget);

  const interestSavingsWithAvalanche =
    snowballResult.totalInterestPaid - avalancheResult.totalInterestSaved;

  const timeSavingsWithAvalanche =
    snowballResult.totalMonthsToDebtFree -
    avalancheResult.totalMonthsToDebtFree;

  const motivationalBenefitOfSnowball =
    snowballResult.debtsEliminatedByMonth.filter(
      (elimination) => elimination.month <= 12,
    ).length;

  return {
    avalanche: {
      totalMonthsToDebtFree: avalancheResult.totalMonthsToDebtFree,
      totalInterestPaid: avalancheResult.totalInterestSaved,
      debtFreeDate: avalancheResult.debtFreeDate,
    },
    snowball: {
      totalMonthsToDebtFree: snowballResult.totalMonthsToDebtFree,
      totalInterestPaid: snowballResult.totalInterestPaid,
      debtFreeDate: snowballResult.debtFreeDate,
      debtsEliminatedByMonth: snowballResult.debtsEliminatedByMonth,
    },
    comparison: {
      interestSavingsWithAvalanche,
      timeSavingsWithAvalanche,
      motivationalBenefitOfSnowball,
    },
  };
}

/**
 * Calculate total minimum payments required
 */
export function calculateTotalMinimumPayments(debts: Debt[]): number {
  const payments = debts.map((debt) => debt.minimumPayment);
  return getCurrencyValue(sumCurrency(payments));
}

/**
 * Calculate debt-to-income ratio (if income is provided)
 */
export function calculateDebtToIncomeRatio(
  debts: Debt[],
  monthlyIncome: number,
): number {
  const balances = debts.map((debt) => debt.balance);
  const totalDebt = getCurrencyValue(sumCurrency(balances));
  const annualIncome = getCurrencyValue(multiplyCurrency(monthlyIncome, 12));
  return getCurrencyValue(divideCurrency(totalDebt, annualIncome));
}

/**
 * Calculate average interest rate across all debts (weighted by balance)
 */
export function calculateWeightedAverageInterestRate(debts: Debt[]): number {
  if (debts.length === 0) return 0;

  const balances = debts.map((debt) => debt.balance);
  const totalBalance = getCurrencyValue(sumCurrency(balances));
  if (totalBalance === 0) return 0;

  const weightedSum = debts.reduce((sum, debt) => {
    const weightedRate = getCurrencyValue(
      multiplyCurrency(debt.balance, debt.interestRate),
    );
    return getCurrencyValue(addCurrency(sum, weightedRate));
  }, 0);

  return getCurrencyValue(divideCurrency(weightedSum, totalBalance));
}

/**
 * Calculate how much extra payment is available
 */
export function calculateExtraPayment(
  debts: Debt[],
  monthlyBudget: number,
): number {
  const totalMinimumPayments = calculateTotalMinimumPayments(debts);
  return Math.max(0, monthlyBudget - totalMinimumPayments);
}

/**
 * Estimate time to debt freedom with minimum payments only
 */
export function estimateMinimumPaymentTimeline(debts: Debt[]): {
  totalMonths: number;
  totalInterest: number;
  debtFreeDate: Date;
} {
  let totalMonths = 0;
  let totalInterest = createCurrency(0);

  for (const debt of debts) {
    let balance = createCurrency(debt.balance);
    let months = 0;
    let interestPaid = createCurrency(0);

    while (getCurrencyValue(balance) > 0 && months < 600) {
      // 50 years max
      const interestCharge = divideCurrency(
        divideCurrency(multiplyCurrency(balance, debt.interestRate), 100),
        12,
      );

      const balanceWithInterest = addCurrency(balance, interestCharge);
      const payment = createCurrency(
        Math.min(debt.minimumPayment, getCurrencyValue(balanceWithInterest)),
      );

      interestPaid = addCurrency(interestPaid, interestCharge);
      balance = createCurrency(
        Math.max(
          0,
          getCurrencyValue(subtractCurrency(balanceWithInterest, payment)),
        ),
      );
      months++;
    }

    totalMonths = Math.max(totalMonths, months);
    totalInterest = addCurrency(totalInterest, interestPaid);
  }

  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + totalMonths);

  return {
    totalMonths,
    totalInterest: getCurrencyValue(totalInterest),
    debtFreeDate,
  };
}

/**
 * Calculate the impact of increasing monthly budget
 */
export function calculateBudgetImpact(
  debts: Debt[],
  currentBudget: number,
  increasedBudget: number,
): {
  monthsSaved: number;
  interestSaved: number;
  percentageImprovement: number;
} {
  const currentResult = calculateDebtAvalanche(debts, currentBudget);
  const increasedResult = calculateDebtAvalanche(debts, increasedBudget);

  const monthsSaved =
    currentResult.totalMonthsToDebtFree - increasedResult.totalMonthsToDebtFree;
  const interestSaved =
    currentResult.totalInterestSaved - increasedResult.totalInterestSaved;
  const percentageImprovement =
    (monthsSaved / currentResult.totalMonthsToDebtFree) * 100;

  return {
    monthsSaved,
    interestSaved,
    percentageImprovement,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return formatCurrencyUtil(amount);
}

/**
 * Format months to years and months
 */
export function formatTimeToDebtFree(months: number): string {
  if (months === 0) return "Already debt-free";
  if (months === 1) return "1 month";
  if (months < 12) return `${months} months`;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) {
    return years === 1 ? "1 year" : `${years} years`;
  }

  const yearText = years === 1 ? "1 year" : `${years} years`;
  const monthText =
    remainingMonths === 1 ? "1 month" : `${remainingMonths} months`;

  return `${yearText} and ${monthText}`;
}
