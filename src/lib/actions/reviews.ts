"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getStore } from "@/lib/data";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { createReviewSchema, reportSchema, appealSchema, claimSchema, responseSchema, suggestionSchema } from "@/lib/validation/schemas";
import { calculateReviewScore, toAnswerInputs } from "@/lib/scoring";
import { scoreThresholds } from "@/lib/config";
import { rateLimit } from "@/lib/rate-limit";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "unknown";
}

export async function submitReview(input: unknown): Promise<ActionResult<{ reviewId: string }>> {
  const user = await getCurrentUser();
  // Anyone can submit a review. Guests get an opaque identity; authenticated
  // users keep their own id so duplicate detection and "my reviews" still work.
  const userId = user?.id ?? `anon:${crypto.randomUUID()}`;

  const limited = rateLimit(user ? `review:${user.id}` : `reviewip:${await clientIp()}`, 5, 60 * 60 * 1000);
  if (!limited.ok) return { ok: false, error: "RATE_LIMITED" };

  const parsed = createReviewSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "INVALID_INPUT" };
  }
  const payload = parsed.data;

  const store = await getStore();
  const org = await store.getOrganizationById(payload.organizationId);
  if (!org) return { ok: false, error: "ORGANIZATION_NOT_FOUND" };

  // Server-authoritative template + scoring. Client weights/scores are ignored.
  const bundle = await store.getTemplateBundle(org.categoryId, payload.relationshipTypeId);
  if (!bundle) return { ok: false, error: "NO_TEMPLATE" };

  const allowedParameterIds = new Set(bundle.parameters.map((p) => p.id));
  const answers = payload.answers.filter((a) => allowedParameterIds.has(a.parameterId));
  if (answers.length === 0) return { ok: false, error: "NO_ANSWERS" };

  const score = calculateReviewScore(
    toAnswerInputs(answers.map((a, i) => ({ id: String(i), reviewId: "", parameterId: a.parameterId, value: a.value }))),
    bundle.parameters,
    scoreThresholds,
  );
  if (!score.eligible) {
    return { ok: false, error: score.reason ?? "NOT_ELIGIBLE" };
  }

  // Anti-duplicate: one active review per authenticated user/org/relationship.
  // Guests cannot be linked across submissions, so they are covered by the IP rate limit instead.
  if (user) {
    const existing = await store.listReviews({
      organizationId: org.id,
      relationshipTypeId: payload.relationshipTypeId,
      userId: user.id,
      pageSize: 50,
    });
    const active = existing.items.find((r) => r.status === "pending" || r.status === "published");
    if (active) return { ok: false, error: "DUPLICATE_REVIEW" };
  }

  const review = await store.createReview({
    userId,
    organizationId: org.id,
    branchId: payload.branchId ?? null,
    categoryId: org.categoryId,
    relationshipTypeId: payload.relationshipTypeId,
    templateVersionId: bundle.version.id,
    title: payload.title ?? null,
    body: (payload.body ?? "").trim() || "(Ratings only — no written review provided.)",
    employmentStage: null,
    experiencePeriod: payload.experiencePeriod ?? null,
    displayName: payload.displayName ?? null,
    language: payload.language,
    answers,
    score: score.score,
    eligible: score.eligible,
    answeredParameters: score.answeredParameters,
    weightCoverage: score.weightCoverage,
  });

  revalidatePath(`/organizations/${org.slug}`);
  revalidatePath("/dashboard");
  return { ok: true, data: { reviewId: review.id } };
}

export async function withdrawReview(reviewId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "UNAUTHENTICATED" };
  const store = await getStore();
  const review = await store.getReviewById(reviewId);
  if (!review || review.userId !== user.id) return { ok: false, error: "NOT_FOUND" };
  await store.withdrawReview(reviewId, user.id);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function reportReview(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "UNAUTHENTICATED" };
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };
  const store = await getStore();
  await store.createReport({
    reviewId: parsed.data.reviewId,
    reporterUserId: user.id,
    reason: parsed.data.reason,
    details: parsed.data.details ?? null,
  });
  return { ok: true };
}

export async function appealReview(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "UNAUTHENTICATED" };
  const parsed = appealSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };
  const store = await getStore();
  const review = await store.getReviewById(parsed.data.reviewId);
  if (!review || review.userId !== user.id) return { ok: false, error: "NOT_FOUND" };
  await store.createAppeal({ reviewId: parsed.data.reviewId, userId: user.id, message: parsed.data.message });
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function requestClaim(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = claimSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };
  const store = await getStore();
  await store.createClaim({
    organizationId: parsed.data.organizationId,
    requesterUserId: user.id,
    representativeName: parsed.data.representativeName,
    position: parsed.data.position,
    evidence: parsed.data.evidence,
  });
  return { ok: true };
}

export async function submitSuggestion(input: unknown): Promise<ActionResult<{ suggestionId: string }>> {
  const user = await getCurrentUser();
  const parsed = suggestionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "INVALID_INPUT" };
  }
  const payload = parsed.data;
  const store = await getStore();
  const suggestion = await store.createSuggestion({
    suggestedName: payload.suggestedName.trim(),
    suggestedBengaliName: payload.suggestedBengaliName?.trim() || null,
    categoryId: payload.categoryId,
    division: payload.division?.trim() || null,
    district: payload.district?.trim() || null,
    city: payload.city?.trim() || null,
    website: payload.website?.trim() || null,
    address: payload.address?.trim() || null,
    reason: payload.reason?.trim() || null,
    submittedByUserId: user?.id ?? null,
  });
  return { ok: true, data: { suggestionId: suggestion.id } };
}

export async function submitResponse(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = responseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };
  const store = await getStore();
  const review = await store.getReviewById(parsed.data.reviewId);
  if (!review) return { ok: false, error: "NOT_FOUND" };
  const isRep = await store.isRepresentative(review.organizationId, user.id);
  if (!isRep) return { ok: false, error: "FORBIDDEN" };
  await store.createResponse({
    reviewId: review.id,
    organizationId: review.organizationId,
    representativeUserId: user.id,
    body: parsed.data.body,
  });
  revalidatePath("/dashboard");
  return { ok: true };
}
