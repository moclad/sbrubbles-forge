export const SUPPORTED_CURRENCIES = [
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]['code'];

/**
 * Format an amount with the specified currency using locale-aware formatting
 * @param amount - The numeric amount to format
 * @param currencyCode - The ISO 4217 currency code (e.g., 'EUR', 'USD')
 * @param locale - Optional locale string (defaults to browser/system locale)
 * @returns Formatted currency string (e.g., "€123.45", "$123.45")
 */
export function formatCurrency(amount: number, currencyCode: string, locale?: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      currency: currencyCode,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      style: 'currency',
    }).format(amount);
  } catch {
    // Fallback to basic formatting if Intl.NumberFormat fails
    const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
    const symbol = currency?.symbol ?? currencyCode;
    return `${symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Get the currency symbol for a given currency code
 * @param currencyCode - The ISO 4217 currency code
 * @returns The currency symbol or the code if not found
 */
export function getCurrencySymbol(currencyCode: string): string {
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
  return currency?.symbol ?? currencyCode;
}

/**
 * Get currency name by code
 * @param currencyCode - The ISO 4217 currency code
 * @returns The full currency name
 */
export function getCurrencyName(currencyCode: string): string {
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
  return currency?.name ?? currencyCode;
}
