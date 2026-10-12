"use server";

import { revalidatePath } from "next/cache";
import { getStore } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/lib/actions/reviews";
import type { Bilingual, OrgStatus, Role } from "@/types/domain";

async function guard(roles: Role[]) {
  const user = await getCurrentUser();
  if (!user || !roles.includes(user.role)) return null;
  return user;
}

const ADMIN: Role[] = ["admin"];
const STAFF: Role[] = ["admin", "moderator"];

function refreshPublic(slug?: string) {
  revalidatePath("/");
  revalidatePath("/organizations");
  revalidatePath("/categories");
  if (slug) revalidatePath(`/organizations/${slug}`);
}

// ---------------------------------------------------------------------------
// Moderation
// ---------------------------------------------------------------------------
export async function moderationAction(input: {
  reviewId: string;
  action: "approve" | "reject" | "return";
  reason?: string;
}): Promise<ActionResult> {
  const user = await guard(STAFF);
  if (!user) return { ok: false, error: "FORBIDDEN" };
  const store = await getStore();
  const review = await store.getReviewById(input.reviewId);
  if (!review) return { ok: false, error: "NOT_FOUND" };
  if ((input.action === "reject" || input.action === "return") && !input.reason?.trim()) {
    return { ok: false, error: "REASON_REQUIRED" };
  }
  const status = input.action === "approve" ? "published" : input.action === "reject" ? "rejected" : "pending";
  await store.updateReviewStatus(input.reviewId, status, user.id, input.reason ?? null);
  const org = await store.getOrganizationById(review.organizationId);
  refreshPublic(org?.slug);
  revalidatePath("/admin/moderation");
  return { ok: true };
}

export async function resolveReport(input: { id: string; status: "resolved" | "dismissed" }): Promise<ActionResult> {
  const user = await guard(STAFF);
  if (!user) return { ok: false, error: "FORBIDDEN" };
  const store = await getStore();
  await store.setReportStatus(input.id, input.status, user.id);
  revalidatePath("/admin/moderation");
  return { ok: true };
}

export async function setAppealStatusAction(input: {
  id: string;
  status: "accepted" | "rejected";
}): Promise<ActionResult> {
  const user = await guard(STAFF);
  if (!user) return { ok: false, error: "FORBIDDEN" };
  const store = await getStore();
  await store.setAppealStatus(input.id, input.status, user.id);
  refreshPublic();
  revalidatePath("/admin/moderation");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Organizations
// ---------------------------------------------------------------------------
export async function createOrganizationAction(input: {
  officialName: string;
  bengaliName?: string;
  categoryId: string;
  division?: string;
  district?: string;
  city?: string;
  website?: string;
  googleMapsUrl?: string;
  descriptionEn?: string;
  descriptionBn?: string;
}): Promise<ActionResult<{ id: string }>> {
  const user = await guard(ADMIN);
  if (!user) return { ok: false, error: "FORBIDDEN" };
  if (!input.officialName.trim() || !input.categoryId) return { ok: false, error: "INVALID_INPUT" };
  const store = await getStore();
  const org = await store.createOrganization(
    {
      slug: slugify(input.officialName) || `org-${Date.now()}`,
      officialName: input.officialName.trim(),
      bengaliName: input.bengaliName?.trim() || null,
      alternateNames: [],
      categoryId: input.categoryId,
      parentOrganizationId: null,
      description: {
        en: input.descriptionEn?.trim() || "",
        bn: input.descriptionBn?.trim() || "",
      },
      website: input.website?.trim() || null,
      address: null,
      division: input.division?.trim() || null,
      district: input.district?.trim() || null,
      city: input.city?.trim() || null,
      status: "active" as OrgStatus,
      googleMapsUrl: input.googleMapsUrl?.trim() || null,
      googlePlaceId: null,
      verified: false,
      claimStatus: "unclaimed",
    },
    user.id,
  );
  refreshPublic(org.slug);
  revalidatePath("/admin/organizations");
  return { ok: true, data: { id: org.id } };
}

export async function updateOrganizationAction(input: {
  id: string;
  patch: {
    officialName?: string;
    bengaliName?: string | null;
    categoryId?: string;
    division?: string | null;
    district?: string | null;
    city?: string | null;
    status?: OrgStatus;
    googleMapsUrl?: string | null;
    website?: string | null;
    description?: Bilingual;
  };
}): Promise<ActionResult> {
  const user = await guard(ADMIN);
  if (!user) return { ok: false, error: "FORBIDDEN" };
  const store = await getStore();
  await store.updateOrganization(input.id, input.patch, user.id);
  const org = await store.getOrganizationById(input.id);
  refreshPublic(org?.slug);
  revalidatePath("/admin/organizations");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Organization suggestions (manual add — requires admin approval)
// ---------------------------------------------------------------------------
export async function approveSuggestion(input: { id: string }): Promise<ActionResult> {
  const user = await guard(ADMIN);
  if (!user) return { ok: false, error: "FORBIDDEN" };
  const store = await getStore();
  try {
    const org = await store.approveSuggestion(input.id, user.id);
    refreshPublic(org.slug);
    revalidatePath("/admin/suggestions");
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "FAILED";
    return { ok: false, error: msg };
  }
}

export async function rejectSuggestion(input: { id: string; reason?: string }): Promise<ActionResult> {
  const user = await guard(ADMIN);
  if (!user) return { ok: false, error: "FORBIDDEN" };
  const store = await getStore();
  await store.rejectSuggestion(input.id, input.reason ?? null, user.id);
  revalidatePath("/admin/suggestions");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Categories & relationships
// ---------------------------------------------------------------------------
export async function createCategoryAction(input: {
  name: Bilingual;
  description: Bilingual;
  icon: string;
  isFallback?: boolean;
}): Promise<ActionResult<{ id: string }>> {
  const user = await guard(ADMIN);
  if (!user) return { ok: false, error: "FORBIDDEN" };
  if (!input.name.en.trim()) return { ok: false, error: "INVALID_INPUT" };
  const store = await getStore();
  const cat = await store.createCategory(
    {
      slug: slugify(input.name.en) || `category-${Date.now()}`,
      name: input.name,
      description: input.description,
      icon: input.icon || "building",
      isFallback: input.isFallback ?? false,
    },
    user.id,
  );
  refreshPublic();
  revalidatePath("/admin/categories");
  return { ok: true, data: { id: cat.id } };
}

export async function updateCategoryAction(input: {
  id: string;
  patch: { name?: Bilingual; description?: Bilingual; icon?: string };
}): Promise<ActionResult> {
  const user = await guard(ADMIN);
  if (!user) return { ok: false, error: "FORBIDDEN" };
  const store = await getStore();
  await store.updateCategory(input.id, input.patch, user.id);
  refreshPublic();
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function setCategoryRelationshipsAction(input: {
  categoryId: string;
  relationshipTypeIds: string[];
}): Promise<ActionResult> {
  const user = await guard(ADMIN);
  if (!user) return { ok: false, error: "FORBIDDEN" };
  const store = await getStore();
  await store.setCategoryRelationships(input.categoryId, input.relationshipTypeIds, user.id);
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function createRelationshipAction(input: {
  slug: string;
  name: Bilingual;
  kind: import("@/types/domain").ReviewerKind;
}): Promise<ActionResult> {
  const user = await guard(ADMIN);
  if (!user) return { ok: false, error: "FORBIDDEN" };
  if (!input.slug.trim() || !input.name.en.trim()) return { ok: false, error: "INVALID_INPUT" };
  const store = await getStore();
  await store.createRelationship({ slug: slugify(input.slug), name: input.name, kind: input.kind }, user.id);
  revalidatePath("/admin/categories");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Rating templates
// ---------------------------------------------------------------------------
export async function saveTemplateAction(input: {
  templateId?: string;
  categoryId: string;
  relationshipTypeIds: string[];
  name: Bilingual;
  parameters: Array<{
    key: string;
    name: Bilingual;
    weight: number;
    order: number;
    questions: Array<{ text: Bilingual; required: boolean; order: number }>;
  }>;
}): Promise<ActionResult> {
  const user = await guard(ADMIN);
  if (!user) return { ok: false, error: "FORBIDDEN" };
  if (!input.categoryId || input.relationshipTypeIds.length === 0) {
    return { ok: false, error: "INVALID_INPUT" };
  }
  const store = await getStore();
  await store.saveTemplateDraft(input, user.id);
  revalidatePath("/admin/templates");
  return { ok: true };
}

export async function publishTemplateAction(input: {
  templateId: string;
  changeNote?: string;
}): Promise<ActionResult> {
  const user = await guard(ADMIN);
  if (!user) return { ok: false, error: "FORBIDDEN" };
  const store = await getStore();
  try {
    await store.publishVersion(input.templateId, user.id, input.changeNote);
  } catch {
    return { ok: false, error: "NO_DRAFT" };
  }
  refreshPublic();
  revalidatePath("/admin/templates");
  return { ok: true };
}

export async function archiveVersionAction(input: { versionId: string }): Promise<ActionResult> {
  const user = await guard(ADMIN);
  if (!user) return { ok: false, error: "FORBIDDEN" };
  const store = await getStore();
  await store.archiveVersion(input.versionId, user.id);
  revalidatePath("/admin/templates");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Claims & settings
// ---------------------------------------------------------------------------
export async function setClaimStatusAction(input: {
  id: string;
  status: "approved" | "rejected";
}): Promise<ActionResult> {
  const user = await guard(STAFF);
  if (!user) return { ok: false, error: "FORBIDDEN" };
  const store = await getStore();
  await store.setClaimStatus(input.id, input.status, user.id);
  refreshPublic();
  revalidatePath("/admin/claims");
  return { ok: true };
}

export async function updateSettingsAction(input: {
  brandName?: string;
  tagline?: string;
  methodologyPublic?: string;
  minProvisionalReviews?: number;
  minPublishedReviews?: number;
  minAnsweredParameters?: number;
  minWeightCoverage?: number;
  maintenanceMessage?: string | null;
}): Promise<ActionResult> {
  const user = await guard(ADMIN);
  if (!user) return { ok: false, error: "FORBIDDEN" };
  const store = await getStore();
  await store.updateSettings(input, user.id);
  revalidatePath("/admin/settings");
  refreshPublic();
  return { ok: true };
}
