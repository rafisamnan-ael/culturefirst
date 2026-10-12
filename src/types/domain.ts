import type { ReviewStatus } from "@/lib/config";

export type { ReviewStatus };

export type Bilingual = { en: string; bn: string };

export type OrgStatus = "active" | "inactive" | "pending_approval" | "merged";

export type Role = "user" | "moderator" | "admin";

export type ReviewerKind = "patient" | "employee" | "student" | "citizen" | "beneficiary" | "visitor" | "other";

export interface OrganizationCategory {
  id: string;
  slug: string;
  name: Bilingual;
  description: Bilingual;
  icon: string;
  isFallback: boolean;
  createdAt: string;
}

export interface ReviewerRelationshipType {
  id: string;
  slug: string;
  name: Bilingual;
  kind: ReviewerKind;
  createdAt: string;
}

export interface CategoryRelationship {
  id: string;
  categoryId: string;
  relationshipTypeId: string;
}

export interface Organization {
  id: string;
  slug: string;
  officialName: string;
  bengaliName: string | null;
  alternateNames: string[];
  categoryId: string;
  parentOrganizationId: string | null;
  description: Bilingual;
  website: string | null;
  address: string | null;
  division: string | null;
  district: string | null;
  city: string | null;
  status: OrgStatus;
  googleMapsUrl: string | null;
  googlePlaceId: string | null;
  verified: boolean;
  claimStatus: "unclaimed" | "pending" | "claimed";
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationAlias {
  id: string;
  organizationId: string;
  alias: string;
}

export interface OrganizationBranch {
  id: string;
  organizationId: string;
  name: string;
  address: string | null;
  division: string | null;
  district: string | null;
  city: string | null;
  createdAt: string;
}

export interface RatingParameter {
  id: string;
  versionId: string;
  key: string;
  name: Bilingual;
  description: Bilingual;
  weight: number; // stored as percentage (e.g. 20 = 20%)
  order: number;
  active: boolean;
}

export interface RatingQuestion {
  id: string;
  parameterId: string;
  text: Bilingual;
  required: boolean;
  order: number;
}

export interface RatingTemplate {
  id: string;
  categoryId: string;
  relationshipTypeIds: string[];
  name: Bilingual;
  createdAt: string;
}

export interface RatingTemplateVersion {
  id: string;
  templateId: string;
  version: number;
  status: "draft" | "published" | "archived";
  changeNote: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export interface TemplateBundle {
  template: RatingTemplate;
  version: RatingTemplateVersion;
  parameters: Array<RatingParameter & { questions: RatingQuestion[] }>;
}

export type RatingValue = 1 | 2 | 3 | 4 | 5 | "not_observed";

export interface ReviewAnswer {
  id: string;
  reviewId: string;
  parameterId: string;
  value: RatingValue;
}

export interface ReviewScoreSnapshot {
  reviewId: string;
  templateVersionId: string;
  score: number | null;
  answeredParameters: number;
  weightCoverage: number;
  eligible: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  organizationId: string;
  branchId: string | null;
  categoryId: string;
  relationshipTypeId: string;
  templateVersionId: string;
  status: ReviewStatus;
  title: string | null;
  body: string;
  /** "current" | "former" etc. stored separately from the broader cohort */
  employmentStage: string | null;
  experiencePeriod: string | null;
  displayName: string | null;
  language: "en" | "bn" | "mixed";
  score: number | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  moderationReason: string | null;
}

export interface ReviewWithAnswers extends Review {
  answers: ReviewAnswer[];
}

export interface AggregateBucket {
  organizationId: string;
  branchId: string | null;
  categoryId: string;
  relationshipTypeId: string;
  templateVersionId: string;
  eligibleCount: number;
  averageScore: number | null;
  parameterScores: Record<string, number>;
  distribution: Record<string, number>;
  computedAt: string;
}

export interface OrganizationScoreAggregate {
  id: string;
  organizationId: string;
  branchId: string | null;
  categoryId: string;
  relationshipTypeId: string;
  templateVersionId: string;
  eligibleCount: number;
  averageScore: number | null;
  parameterScores: Record<string, number>;
  distribution: Record<string, number>;
  computedAt: string;
}

export interface ReviewReport {
  id: string;
  reviewId: string;
  reporterUserId: string;
  reason: string;
  details: string | null;
  status: "open" | "resolved" | "dismissed";
  createdAt: string;
}

export interface ModerationAction {
  id: string;
  reviewId: string;
  actorUserId: string;
  action: "approve" | "reject" | "return" | "hide" | "restore" | "withdraw";
  reason: string | null;
  createdAt: string;
}

export interface ReviewAppeal {
  id: string;
  reviewId: string;
  userId: string;
  message: string;
  status: "open" | "accepted" | "rejected";
  createdAt: string;
}

export interface OrganizationClaim {
  id: string;
  organizationId: string;
  requesterUserId: string;
  representativeName: string;
  position: string;
  evidence: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export type OrganizationSuggestionStatus = "pending" | "approved" | "rejected";

export interface OrganizationSuggestion {
  id: string;
  suggestedName: string;
  suggestedBengaliName: string | null;
  categoryId: string;
  division: string | null;
  district: string | null;
  city: string | null;
  website: string | null;
  address: string | null;
  reason: string | null;
  submittedByUserId: string | null;
  status: OrganizationSuggestionStatus;
  reviewReason: string | null;
  createdAt: string;
}

export interface OrganizationRepresentative {
  id: string;
  organizationId: string;
  userId: string;
  position: string;
  createdAt: string;
}

export interface OrganizationResponse {
  id: string;
  reviewId: string;
  organizationId: string;
  representativeUserId: string;
  body: string;
  status: "pending" | "published" | "rejected";
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  detail: string | null;
  createdAt: string;
}

export interface Profile {
  id: string;
  email: string;
  displayName: string | null;
  role: Role;
  createdAt: string;
}

export interface PlatformSettings {
  brandName: string;
  tagline: string;
  methodologyPublic: string;
  minProvisionalReviews: number;
  minPublishedReviews: number;
  minAnsweredParameters: number;
  minWeightCoverage: number;
  maintenanceMessage: string | null;
}
