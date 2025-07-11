import currency from "currency.js";

/**
 * Currency configuration for consistent formatting
 */
const currencyConfig = {
  symbol: "$",
  precision: 2,
  separator: ",",
  decimal: ".",
};

/**
 * Create a currency instance with our app's configuration
 */
export function createCurrency(value: number | string | currency): currency {
  return currency(value, currencyConfig);
}

/**
 * Format a number as currency string
 */
export function formatCurrency(amount: number | string | currency): string {
  return createCurrency(amount).format();
}

/**
 * Add two currency values safely
 */
export function addCurrency(
  a: number | currency,
  b: number | currency,
): currency {
  return createCurrency(a).add(b);
}

/**
 * Subtract two currency values safely
 */
export function subtractCurrency(
  a: number | currency,
  b: number | currency,
): currency {
  return createCurrency(a).subtract(b);
}

/**
 * Multiply currency by a number safely
 */
export function multiplyCurrency(
  amount: number | currency,
  multiplier: number,
): currency {
  return createCurrency(amount).multiply(multiplier);
}

/**
 * Divide currency by a number safely
 */
export function divideCurrency(
  amount: number | currency,
  divisor: number,
): currency {
  return createCurrency(amount).divide(divisor);
}

/**
 * Calculate monthly interest charge for a debt
 */
export function calculateMonthlyInterest(
  balance: number,
  annualRate: number,
): currency {
  return createCurrency(balance).multiply(annualRate).divide(100).divide(12);
}

/**
 * Calculate minimum payment required to pay off debt in specified months
 */
export function calculateRequiredPayment(
  balance: number,
  annualRate: number,
  months: number,
): currency {
  if (annualRate === 0) {
    return createCurrency(balance).divide(months);
  }

  const monthlyRate = annualRate / 100 / 12;
  const numerator = createCurrency(balance).multiply(monthlyRate);
  const denominator = 1 - (1 + monthlyRate) ** -months;

  return numerator.divide(denominator);
}

/**
 * Sum an array of currency values
 */
export function sumCurrency(amounts: (number | currency)[]): currency {
  return amounts.reduce(
    (total: currency, amount) => addCurrency(total, amount),
    createCurrency(0),
  );
}

/**
 * Get the numeric value from a currency instance
 */
export function getCurrencyValue(amount: currency): number {
  return amount.value;
}

/**
 * Check if a currency amount is zero
 */
export function isZero(amount: currency): boolean {
  return amount.value === 0;
}

/**
 * Check if a currency amount is positive
 */
export function isPositive(amount: currency): boolean {
  return amount.value > 0;
}

/**
 * Check if a currency amount is negative
 */
export function isNegative(amount: currency): boolean {
  return amount.value < 0;
}

/**
 * Get the maximum of two currency values
 */
export function maxCurrency(
  a: number | currency,
  b: number | currency,
): currency {
  const currencyA = createCurrency(a);
  const currencyB = createCurrency(b);
  return currencyA.value >= currencyB.value ? currencyA : currencyB;
}

/**
 * Get the minimum of two currency values
 */
export function minCurrency(
  a: number | currency,
  b: number | currency,
): currency {
  const currencyA = createCurrency(a);
  const currencyB = createCurrency(b);
  return currencyA.value <= currencyB.value ? currencyA : currencyB;
}

/**
 * Round currency to nearest cent
 */
export function roundCurrency(amount: number | currency): currency {
  return createCurrency(createCurrency(amount).value);
}

/**
 * Convert currency to dollars (useful for calculations that need plain numbers)
 */
export function toDollars(amount: currency): number {
  return Math.round(amount.value * 100) / 100;
}

/**
 * Parse a string input to currency (useful for form inputs)
 */
export function parseCurrency(input: string): currency {
  // Remove any non-numeric characters except decimal point and negative sign
  const cleaned = input.replace(/[^0-9.-]/g, "");
  return createCurrency(cleaned || 0);
}

/**
 * Validate if a string can be parsed as valid currency
 */
export function isValidCurrency(input: string): boolean {
  try {
    const cleaned = input.replace(/[^0-9.-]/g, "");
    const parsed = Number.parseFloat(cleaned);
    return !Number.isNaN(parsed) && Number.isFinite(parsed) && parsed >= 0;
  } catch {
    return false;
  }
}
