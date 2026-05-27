import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateROI(profit: number, cost: number): number {
  if (cost === 0) return 0;
  return Math.round((profit / cost) * 100 * 10) / 10;
}

export function calculateNetProfit(
  amazonPrice: number,
  buyCost: number,
  fbaFee: number,
  referralFee: number,
  inboundShipping: number = 0,
  prepCost: number = 0
): number {
  return amazonPrice - buyCost - fbaFee - referralFee - inboundShipping - prepCost;
}

export function calculateBreakEven(
  buyCost: number,
  fbaFee: number,
  referralFeePercent: number,
  inboundShipping: number = 0,
  prepCost: number = 0
): number {
  const fixedCosts = buyCost + fbaFee + inboundShipping + prepCost;
  return fixedCosts / (1 - referralFeePercent / 100);
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    mastered: "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400",
    learning: "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400",
    practicing: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400",
    "not started": "text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400",
    completed: "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400",
    watching: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400",
    rewatch: "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400",
    good: "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400",
    reject: "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400",
    watchlist: "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400",
    buy: "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400",
    approved: "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400",
    contacted: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400",
    new: "text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400",
    rejected: "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400",
  };
  return map[status?.toLowerCase()] ?? "text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400";
}

export function getRiskColor(risk: string): string {
  const map: Record<string, string> = {
    low: "text-green-600",
    medium: "text-yellow-600",
    high: "text-red-600",
  };
  return map[risk?.toLowerCase()] ?? "text-gray-600";
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
}

/**
 * Extracts the 11-char YouTube video ID from a URL.
 * Supports youtube.com/watch?v=ID, youtu.be/ID, m.youtube.com, /shorts/, /v/, and /embed/.
 */
export function getYouTubeId(url: string | undefined | null): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

export function getYouTubeEmbedUrl(url: string | undefined | null): string | null {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` : null;
}

export function getYouTubeThumbnail(
  url: string | undefined | null,
  size: "default" | "hq" | "max" = "hq",
): string | null {
  const id = getYouTubeId(url);
  if (!id) return null;
  const map = { default: "default", hq: "hqdefault", max: "maxresdefault" };
  return `https://img.youtube.com/vi/${id}/${map[size]}.jpg`;
}
