import type {
  AuditLog,
  Organization,
  OrganizationBranch,
  OrganizationCategory,
  OrganizationResponse,
  OrganizationScoreAggregate,
  PlatformSettings,
  Profile,
  RatingParameter,
  RatingQuestion,
  RatingTemplate,
  RatingTemplateVersion,
  ReviewerRelationshipType,
  Review,
  ReviewAnswer,
  ReviewReport,
  ReviewStatus,
  Role,
  TemplateBundle,
} from "@/types/domain";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OrganizationFilters {
  search?: string;
  categoryId?: string;
  division?: string;
  district?: string;
  perspectiveRelationshipId?: string;
  hasScores?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ReviewFilters {
  organizationId?: string;
  branchId?: string | null;
  relationshipTypeId?: string;
  status?: ReviewStatus;
  userId?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateReviewInput {
  userId: string;
  organizationId: string;
  branchId: string | null;
  categoryId: string;
  relationshipTypeId: string;
  templateVersionId: string;
  title: string | null;
  body: string;
  employmentStage: string | null;
  experiencePeriod: string | null;
  displayName: string | null;
  language: "en" | "bn" | "mixed";
  answers: Array<{ parameterId: string; value: ReviewAnswer["value"] }>;
  score: number | null;
  eligible: boolean;
  answeredParameters: number;
  weightCoverage: number;
}

export interface TemplateDraft {
  templateId?: string;
  categoryId: string;
  relationshipTypeIds: string[];
  name: { en: string; bn: string };
  parameters: Array<{
    key: string;
    name: { en: string; bn: string };
    description?: { en: string; bn: string };
    weight: number;
    order: number;
    questions: Array<{ text: { en: string; bn: string }; required: boolean; order: number }>;
  }>;
}

export interface OrgScoreCard {
  organizationId: string;
  branchId: string | null;
  relationshipTypeId: string;
  categoryId: string;
  templateVersionId: string;
  score: number | null;
  eligibleCount: number;
  sufficiency: "insufficient" | "provisional" | "published";
}

export type ScoreCard = OrgScoreCard;

export interface Store {
  // ---- Platform ----
  getSettings(): Promise<PlatformSettings>;
  updateSettings(patch: Partial<PlatformSettings>, actorId: string): Promise<PlatformSettings>;

  // ---- Profiles / roles ----
  getProfile(userId: string): Promise<Profile | null>;
  upsertProfile(profile: Profile): Promise<Profile>;
  setUserRole(userId: string, role: Role): Promise<void>;
  listProfiles(): Promise<Profile[]>;

  // ---- Categories & relationships ----
  listCategories(): Promise<OrganizationCategory[]>;
  getCategoryBySlug(slug: string): Promise<OrganizationCategory | null>;
  getCategoryById(id: string): Promise<OrganizationCategory | null>;
  createCategory(input: Omit<OrganizationCategory, "id" | "createdAt">, actorId: string): Promise<OrganizationCategory>;
  updateCategory(id: string, patch: Partial<OrganizationCategory>, actorId: string): Promise<void>;
  listRelationships(): Promise<ReviewerRelationshipType[]>;
  createRelationship(input: Omit<ReviewerRelationshipType, "id" | "createdAt">, actorId: string): Promise<ReviewerRelationshipType>;
  listRelationshipsForCategory(categoryId: string): Promise<ReviewerRelationshipType[]>;
  setCategoryRelationships(categoryId: string, relationshipTypeIds: string[], actorId: string): Promise<void>;

  // ---- Rating templates ----
  listTemplates(): Promise<RatingTemplate[]>;
  getTemplateBundle(categoryId: string, relationshipTypeId: string): Promise<TemplateBundle | null>;
  getBundleByVersionId(versionId: string): Promise<TemplateBundle | null>;
  getTemplateVersion(versionId: string): Promise<RatingTemplateVersion | null>;
  listParameters(versionId: string): Promise<RatingParameter[]>;
  listQuestions(parameterId: string): Promise<RatingQuestion[]>;
  listTemplateVersions(templateId: string): Promise<RatingTemplateVersion[]>;
  saveTemplateDraft(draft: TemplateDraft, actorId: string): Promise<RatingTemplate>;
  publishVersion(templateId: string, actorId: string, changeNote?: string): Promise<RatingTemplateVersion>;
  archiveVersion(versionId: string, actorId: string): Promise<void>;

  // ---- Organizations ----
  listOrganizations(filters: OrganizationFilters): Promise<Paginated<Organization>>;
  getOrganizationBySlug(slug: string): Promise<Organization | null>;
  getOrganizationById(id: string): Promise<Organization | null>;
  createOrganization(input: Omit<Organization, "id" | "createdAt" | "updatedAt">, actorId: string): Promise<Organization>;
  updateOrganization(id: string, patch: Partial<Organization>, actorId: string): Promise<void>;
  listBranches(organizationId: string): Promise<OrganizationBranch[]>;
  listOrganizationsByIds(ids: string[]): Promise<Organization[]>;

  // ---- Reviews ----
  listReviews(filters: ReviewFilters): Promise<Paginated<Review>>;
  getReviewById(id: string): Promise<Review | null>;
  getAnswersForReviews(reviewIds: string[]): Promise<ReviewAnswer[]>;
  createReview(input: CreateReviewInput): Promise<Review>;
  updateReviewStatus(
    reviewId: string,
    status: ReviewStatus,
    actorId: string,
    reason?: string | null,
  ): Promise<void>;
  withdrawReview(reviewId: string, userId: string): Promise<void>;

  // ---- Aggregates ----
  getAggregates(organizationId: string, branchId?: string | null): Promise<OrganizationScoreAggregate[]>;
  getScoreCards(organizationIds: string[]): Promise<ScoreCard[]>;
  recomputeAggregates(organizationId: string): Promise<OrganizationScoreAggregate[]>;

  // ---- Moderation extras ----
  listModerationActions(reviewId: string): Promise<import("@/types/domain").ModerationAction[]>;
  createReport(input: { reviewId: string; reporterUserId: string; reason: string; details: string | null }): Promise<ReviewReport>;
  listReports(): Promise<ReviewReport[]>;
  setReportStatus(id: string, status: "open" | "resolved" | "dismissed", actorId: string): Promise<void>;
  createAppeal(input: { reviewId: string; userId: string; message: string }): Promise<import("@/types/domain").ReviewAppeal>;
  listAppeals(): Promise<import("@/types/domain").ReviewAppeal[]>;
  setAppealStatus(id: string, status: "open" | "accepted" | "rejected", actorId: string): Promise<void>;

  // ---- Organization responses / claims ----
  createClaim(input: Omit<import("@/types/domain").OrganizationClaim, "id" | "createdAt" | "status">): Promise<import("@/types/domain").OrganizationClaim>;
  listClaims(): Promise<import("@/types/domain").OrganizationClaim[]>;
  setClaimStatus(id: string, status: "pending" | "approved" | "rejected", actorId: string): Promise<void>;
  listRepresentatives(organizationId: string): Promise<import("@/types/domain").OrganizationRepresentative[]>;
  isRepresentative(organizationId: string, userId: string): Promise<boolean>;
  createResponse(input: { reviewId: string; organizationId: string; representativeUserId: string; body: string }): Promise<OrganizationResponse>;
  listResponses(organizationId: string): Promise<OrganizationResponse[]>;
  listResponsesForReviews(reviewIds: string[]): Promise<OrganizationResponse[]>;
  setResponseStatus(id: string, status: "pending" | "published" | "rejected", actorId: string): Promise<void>;

  // ---- Organization suggestions (manual add, requires admin approval) ----
  createSuggestion(input: Omit<import("@/types/domain").OrganizationSuggestion, "id" | "createdAt" | "status" | "reviewReason">): Promise<import("@/types/domain").OrganizationSuggestion>;
  listSuggestions(): Promise<import("@/types/domain").OrganizationSuggestion[]>;
  approveSuggestion(id: string, actorId: string): Promise<Organization>;
  rejectSuggestion(id: string, reason: string | null, actorId: string): Promise<void>;

  // ---- Contact messages / correction requests ----
  createContactMessage(input: Omit<import("@/types/domain").ContactMessage, "id" | "createdAt" | "status">): Promise<import("@/types/domain").ContactMessage>;
  listContactMessages(): Promise<import("@/types/domain").ContactMessage[]>;
  setContactMessageStatus(id: string, status: "open" | "resolved", actorId: string): Promise<void>;

  // ---- Audit ----
  listAuditLogs(limit?: number): Promise<AuditLog[]>;
}

export class StoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreError";
  }
}
