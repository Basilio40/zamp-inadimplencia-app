import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBRL(n: number): string {
  if (!n || n <= 0) return '-';
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatBRLK(n: number): string {
  if (!n || n <= 0) return '-';
  if (n >= 1000) return 'R$' + Math.round(n / 1000) + 'k';
  return 'R$' + Math.round(n);
}

export function daysOverdue(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function nextCycleDate(paidDate: Date | string | null): Date | null {
  if (!paidDate) return null;
  const pd = new Date(paidDate);
  if (isNaN(pd.getTime())) return null;
  return new Date(pd.getTime() + 60 * 24 * 60 * 60 * 1000);
}
