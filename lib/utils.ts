import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(value: bigint | number): string {
  const size = typeof value === "bigint" ? Number(value) : value;
  if (!Number.isFinite(size) || size <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const p = Math.floor(Math.log(size) / Math.log(1024));
  return `${(size / Math.pow(1024, p)).toFixed(1)} ${units[p]}`;
}
