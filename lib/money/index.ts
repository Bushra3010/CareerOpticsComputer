/**
 * Money — integer paise only.
 *
 * PRD §9.5 and §20.1: "Money stored as integer paise (`bigint`) plus ISO
 * currency code; never floating point." Every amount that crosses a module
 * boundary in this codebase is a `Paise`, and the only places a rupee-shaped
 * decimal exists are the parse and format functions at the edges.
 *
 * The branded type makes it a compile error to pass a raw rupee number where
 * paise are expected — the single most likely way to lose ₹99 out of ₹100.
 */

declare const paiseBrand: unique symbol;

/** An integer number of paise. Never fractional, never a rupee value. */
export type Paise = number & { readonly [paiseBrand]: true };

export const ZERO = 0 as Paise;

/** JavaScript integers are exact to 2^53; ₹90,07,19,92,54,740.99 is the ceiling. */
const MAX_SAFE_PAISE = Number.MAX_SAFE_INTEGER;

export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MoneyError";
  }
}

/** Asserts an already-integral paise value, e.g. one read from the database. */
export function paise(value: number): Paise {
  if (!Number.isInteger(value)) {
    throw new MoneyError(`Paise must be an integer, received ${value}`);
  }
  if (Math.abs(value) > MAX_SAFE_PAISE) {
    throw new MoneyError(`Paise value ${value} exceeds safe integer range`);
  }
  return value as Paise;
}

/**
 * Converts a rupee amount to paise.
 *
 * Accepts a string in preference to a number: `fromRupees(0.07 * 100)` is the
 * exact float bug this module exists to prevent, and only the string path can
 * be exact. A numeric input with more than two decimal places is rejected
 * rather than silently rounded.
 */
export function fromRupees(value: string | number): Paise {
  const text = typeof value === "number" ? String(value) : value.trim();

  if (!/^-?\d+(\.\d{1,2})?$/.test(text)) {
    throw new MoneyError(
      `Expected a rupee amount with at most 2 decimal places, received "${text}"`,
    );
  }

  const negative = text.startsWith("-");
  const [whole, fraction = ""] = text.replace("-", "").split(".");
  const paiseFraction = fraction.padEnd(2, "0");
  const total = Number(whole) * 100 + Number(paiseFraction);

  return paise(negative ? -total : total);
}

/** Exact decimal-string representation in rupees, e.g. `"4500.00"`. */
export function toRupeeString(amount: Paise): string {
  const negative = amount < 0;
  const abs = Math.abs(amount);
  const whole = Math.floor(abs / 100);
  const fraction = String(abs % 100).padStart(2, "0");
  return `${negative ? "-" : ""}${whole}.${fraction}`;
}

/**
 * Display formatting with the Indian digit grouping (1,00,000 not 100,000)
 * and tabular-friendly fixed decimals.
 */
export function formatPaise(
  amount: Paise,
  options: { showDecimals?: boolean; showSymbol?: boolean } = {},
): string {
  const { showDecimals = true, showSymbol = true } = options;
  const rupees = amount / 100;

  const formatted = new Intl.NumberFormat("en-IN", {
    style: showSymbol ? "currency" : "decimal",
    currency: "INR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(rupees);

  return formatted;
}

/* --- Arithmetic ---------------------------------------------------------- */

export function add(...amounts: Paise[]): Paise {
  return paise(amounts.reduce<number>((sum, a) => sum + a, 0));
}

export function subtract(a: Paise, b: Paise): Paise {
  return paise(a - b);
}

export function multiply(amount: Paise, factor: number): Paise {
  return paise(Math.round(amount * factor));
}

export function negate(amount: Paise): Paise {
  return paise(-amount);
}

export function isZero(amount: Paise): boolean {
  return amount === 0;
}

export function isNegative(amount: Paise): boolean {
  return amount < 0;
}

/**
 * Percentage of an amount, rounded half-up to the nearest paisa.
 * Used for discounts and tax. `percent` is a plain number: 18 means 18%.
 */
export function percentOf(amount: Paise, percent: number): Paise {
  return paise(Math.round((amount * percent) / 100));
}

/**
 * Splits an amount into `parts` instalments without losing or inventing a
 * paisa. The remainder is distributed one paisa at a time across the earliest
 * instalments, so `split(10000, 3)` is `[3334, 3333, 3333]` and the parts always
 * sum back to the original.
 *
 * PRD §6.5 requires instalment schedules to reconcile exactly; naive division
 * is the usual source of a stubborn ₹0.01 discrepancy in a fee ledger.
 */
export function split(amount: Paise, parts: number): Paise[] {
  if (!Number.isInteger(parts) || parts < 1) {
    throw new MoneyError(`Cannot split into ${parts} parts`);
  }

  const base = Math.trunc(amount / parts);
  const remainder = amount - base * parts;
  const step = amount < 0 ? -1 : 1;
  const extra = Math.abs(remainder);

  return Array.from({ length: parts }, (_, i) =>
    paise(base + (i < extra ? step : 0)),
  );
}

/**
 * Allocates a payment across dues in priority order, oldest first.
 * Returns the amount applied to each due and anything left unallocated.
 *
 * PRD §6.5: "Partial payments allocate using configured priority or manual
 * allocation." This is the default priority path.
 */
export function allocate(
  payment: Paise,
  dues: Paise[],
): { allocations: Paise[]; unallocated: Paise } {
  if (isNegative(payment)) {
    throw new MoneyError("Cannot allocate a negative payment");
  }

  let remaining: number = payment;
  const allocations = dues.map((due) => {
    const applied = Math.min(remaining, Math.max(due, 0));
    remaining -= applied;
    return paise(applied);
  });

  return { allocations, unallocated: paise(remaining) };
}
