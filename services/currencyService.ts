
import { Currency } from "../types";

export const EXCHANGE_RATE = 40;

export const convert = (amount: number, from: Currency, to: Currency): number => {
  if (from === to) return amount;
  if (from === 'USD' && to === 'UYU') return amount * EXCHANGE_RATE;
  if (from === 'UYU' && to === 'USD') return amount / EXCHANGE_RATE;
  return amount;
};

export const formatCurrency = (amount: number, currency: Currency) => {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'USD' ? 2 : 0
  }).format(amount);
};
