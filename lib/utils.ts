
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { convertAndFormatPrice } from './currencyFormat';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


// Default: KES as base, KES as display
export function formatPrice(price: number, fromCurrency: string = 'KES', toCurrency: string = 'KES'): string {
  return convertAndFormatPrice(price, fromCurrency, toCurrency);
}

export function formatKSh(price: number): string {
  return `KSh ${price.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function calculateDiscount(price: number, compareAtPrice?: number): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
