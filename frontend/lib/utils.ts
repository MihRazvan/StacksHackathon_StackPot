import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { CONSTANTS } from './stacks/config';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSTX(microStx: number | bigint): string {
  const stx = Number(microStx) / CONSTANTS.MICROSTX_PER_STX;
  return stx.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  });
}

export function formatBTC(sats: number | bigint): string {
  const btc = Number(sats) / CONSTANTS.SATS_PER_BTC;
  return btc.toLocaleString('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 8
  });
}

export function formatProbability(basisPoints: number | bigint): string {
  const percentage = Number(basisPoints) / 100;
  return percentage.toFixed(2);
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function microStxToStx(microStx: number): number {
  return microStx / CONSTANTS.MICROSTX_PER_STX;
}

export function stxToMicroStx(stx: number): number {
  return Math.floor(stx * CONSTANTS.MICROSTX_PER_STX);
}

export function formatPercentage(basisPoints: number): string {
  return (basisPoints / 100).toFixed(2);
}

export function formatPercentageChange(currentBasisPoints: number, newBasisPoints: number): string {
  const currentPercent = currentBasisPoints / 100;
  const newPercent = newBasisPoints / 100;
  const change = newPercent - currentPercent;
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

export function formatTickets(microStx: number | bigint): string {
  // Format with commas for readability
  return Number(microStx).toLocaleString('en-US', {
    maximumFractionDigits: 0
  });
}
