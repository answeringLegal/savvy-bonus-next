import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  })
    .format(amount)
    .replace(/\.\d{2}$/, '');
}

export function getCurrentQuarter() {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return {
    quarter,
    year: now.getFullYear(),
    asString: `Q${quarter} ${now.getFullYear()}`,
    quarterStart: new Date(now.getFullYear(), (quarter - 1) * 3, 1),
    quarterEnd: new Date(now.getFullYear(), quarter * 3, 0),
  };
}
