import { z } from "zod";

export const ratingValueSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal("not_observed"),
]);

export const reviewAnswerSchema = z.object({
  parameterId: z.string().min(1).max(200),
  value: ratingValueSchema,
});

export const createReviewSchema = z.object({
  organizationId: z.string().min(1).max(200),
  branchId: z.string().min(1).max(200).nullable().optional(),
  relationshipTypeId: z.string().min(1).max(200),
  title: z.string().max(140).nullable().optional(),
  body: z.string().min(40, "Please describe your experience in at least 40 characters.").max(5000),
  experiencePeriod: z.string().max(60).nullable().optional(),
  displayName: z.string().max(60).nullable().optional(),
  language: z.enum(["en", "bn", "mixed"]).default("en"),
  answers: z.array(reviewAnswerSchema).min(1).max(80),
});

export type CreateReviewPayload = z.infer<typeof createReviewSchema>;

export const reportSchema = z.object({
  reviewId: z.string().min(1).max(200),
  reason: z.string().min(2).max(200),
  details: z.string().max(1000).nullable().optional(),
});

export const appealSchema = z.object({
  reviewId: z.string().min(1).max(200),
  message: z.string().min(10).max(1000),
});

export const claimSchema = z.object({
  organizationId: z.string().min(1).max(200),
  representativeName: z.string().min(2).max(120),
  position: z.string().min(2).max(120),
  evidence: z.string().min(10).max(1000),
});

export const responseSchema = z.object({
  reviewId: z.string().min(1).max(200),
  body: z.string().min(10).max(2000),
});

export const moderationSchema = z.object({
  reviewId: z.string().min(1).max(200),
  action: z.enum(["approve", "reject", "return"]),
  reason: z.string().max(500).optional(),
});
