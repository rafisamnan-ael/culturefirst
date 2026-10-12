/**
 * Centralised, code-free brand + platform configuration.
 * Requirement: the brand name, tagline, colours and thresholds must be
 * changeable without editing individual components.
 */

export const brand = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || "CultureFirst",
  tagline:
    process.env.NEXT_PUBLIC_BRAND_TAGLINE || "Know the culture before you choose.",
  description:
    "Explore real experiences of respect, fairness, leadership and accountability across organizations in Bangladesh.",
  locale: "Asia/Dhaka",
  country: "Bangladesh",
} as const;

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export type ScoreThresholds = {
  minAnsweredParameters: number;
  minWeightCoverage: number;
  minProvisionalReviews: number;
  minPublishedReviews: number;
};

function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export const scoreThresholds: ScoreThresholds = {
  minAnsweredParameters: num(process.env.SCORE_MIN_ANSWERED_PARAMETERS, 3),
  minWeightCoverage: num(process.env.SCORE_MIN_WEIGHT_COVERAGE, 0.6),
  minProvisionalReviews: num(process.env.AGG_MIN_PROVISIONAL, 5),
  minPublishedReviews: num(process.env.AGG_MIN_PUBLISHED, 20),
};

export const dataSource = (process.env.DATA_SOURCE || "fixtures") as
  | "supabase"
  | "fixtures";

export const devAuth =
  (process.env.DEV_AUTH || "true") === "true" && dataSource === "fixtures";

export const ratingScale = [
  { value: 1, en: "Very poor", bn: "খুব খারাপ" },
  { value: 2, en: "Poor", bn: "খারাপ" },
  { value: 3, en: "Average", bn: "মাঝারি" },
  { value: 4, en: "Good", bn: "ভালো" },
  { value: 5, en: "Excellent", bn: "চমৎকার" },
] as const;

export const NOT_OBSERVED = "not_observed" as const;

export const reviewStatuses = [
  "draft",
  "pending",
  "published",
  "rejected",
  "withdrawn",
  "flagged",
  "under_appeal",
] as const;

export type ReviewStatus = (typeof reviewStatuses)[number];
