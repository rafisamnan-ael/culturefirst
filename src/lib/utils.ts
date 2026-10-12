import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string, locale: "en" | "bn" = "en"): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(date);
}

export function formatNumber(n: number, locale: "en" | "bn" = "en"): string {
  return new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-GB").format(n);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
