// Centralized currency symbols and formatting options
export const CURRENCY_FORMATS: Record<string, { symbol: string; prefix?: boolean; locale: string }> = {
  KES: { symbol: 'Ksh', prefix: true, locale: 'en-KE' },
  RWF: { symbol: 'Rwf', prefix: true, locale: 'en-RW' },
  USD: { symbol: '$', prefix: true, locale: 'en-US' },
  EUR: { symbol: '€', prefix: true, locale: 'en-IE' },
  UGX: { symbol: 'USh', prefix: true, locale: 'en-UG' },
  ZIG: { symbol: 'ZIG', prefix: true, locale: 'en-ZW' },
  ZMW: { symbol: 'ZK', prefix: true, locale: 'en-ZM' },
};

// Utility to convert and format price
import { convertCurrencySync } from './currency';

export function convertAndFormatPrice(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  // Get formatting config for target currency
  const { symbol, prefix, locale } = CURRENCY_FORMATS[toCurrency] || { symbol: toCurrency, prefix: true, locale: 'en' };
  // Convert amount before formatting
  const converted = convertCurrencySync(amount, fromCurrency, toCurrency);
  // Format with proper thousand separators and fraction digits
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  });
  const formatted = formatter.format(converted);
  // Only show symbol/prefix, never currency code
  return prefix ? `${symbol} ${formatted}` : `${formatted} ${symbol}`;
}
