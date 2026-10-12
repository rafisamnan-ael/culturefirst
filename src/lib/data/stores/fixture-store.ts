import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  AuditLog,
  ModerationAction,
  Organization,
  OrganizationBranch,
  OrganizationCategory,
  OrganizationClaim,
  OrganizationRepresentative,
  OrganizationResponse,
  OrganizationScoreAggregate,
  OrganizationSuggestion,
  PlatformSettings,
  Profile,
  RatingParameter,
  RatingQuestion,
  RatingTemplate,
  RatingTemplateVersion,
  ReviewerRelationshipType,
  Review,
  ReviewAnswer,
  ReviewAppeal,
  ReviewReport,
  ReviewStatus,
  Role,
  TemplateBundle,
} from "@/types/domain";
import { aggregateReviews, sufficiency } from "@/lib/scoring";
import { scoreThresholds } from "@/lib/config";
import { createSeedState, type SeedState } from "@/lib/data/fixtures/seed";
import type {
  CreateReviewInput,
  OrgScoreCard,
  OrganizationFilters,
  Paginated,
  ReviewFilters,
  Store,
  TemplateDraft,
} from "@/lib/data/store";
import { StoreError } from "@/lib/data/store";

interface Db extends SeedState {
  aggregates: OrganizationScoreAggregate[];
  reports: ReviewReport[];
  appeals: ReviewAppeal[];
  claims: OrganizationClaim[];
  representatives: OrganizationRepresentative[];
  moderationActions: ModerationAction[];
  suggestions: OrganizationSuggestion[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

function newId(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}

function paginate<T>(items: T[], page = 1, pageSize = 12): Paginated<T> {
  const p = Math.max(1, page);
  const start = (p - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page: p,
    pageSize,
  };
}

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** JSON-file-backed development store. Never used in production. */
export class FixtureStore implements Store {
  private db: Db;
  private writable: boolean;

  private constructor(db: Db) {
    this.db = db;
    this.writable = true;
  }

  static async open(): Promise<FixtureStore> {
    let db: Db | null = null;
    try {
      const raw = await fs.readFile(STORE_FILE, "utf8");
      db = JSON.parse(raw) as Db;
    } catch {
      db = null;
    }
    if (!db) {
      const seed = createSeedState();
      db = {
        ...seed,
        aggregates: [],
        reports: [],
        appeals: [],
        claims: [],
        representatives: [],
        moderationActions: [],
        suggestions: [],
      };
    }
    if (!db.suggestions) db.suggestions = [];
    const store = new FixtureStore(db);
    store.recomputeAll();
    if (!db.aggregates.length) store.recomputeAll();
    await store.persist();
    return store;
  }

  private async persist(): Promise<void> {
    if (!this.writable) return;
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(STORE_FILE, JSON.stringify(this.db, null, 0), "utf8");
    } catch {
      this.writable = false;
    }
  }

  private audit(actorUserId: string, action: string, entityType: string, entityId: string, detail?: string | null) {
    const log: AuditLog = {
      id: newId("aud"),
      actorUserId,
      action,
      entityType,
      entityId,
      detail: detail ?? null,
      createdAt: new Date().toISOString(),
    };
    this.db.auditLogs.unshift(log);
    return log;
  }

  private assembleBundle(template: RatingTemplate, version: RatingTemplateVersion): TemplateBundle {
    const parameters = this.db.parameters
      .filter((p) => p.versionId === version.id)
      .sort((a, b) => a.order - b.order)
      .map((p) => ({
        ...p,
        questions: this.db.questions
          .filter((qq) => qq.parameterId === p.id)
          .sort((a, b) => a.order - b.order),
      }));
    return { template, version, parameters };
  }

  private publishedVersion(templateId: string): RatingTemplateVersion | null {
    const versions = this.db.templateVersions.filter((v) => v.templateId === templateId);
    const published = versions
      .filter((v) => v.status === "published")
      .sort((a, b) => b.version - a.version)[0];
    return published ?? null;
  }

  // -------------------------------------------------------------------------
  // Platform
  // -------------------------------------------------------------------------
  async getSettings(): Promise<PlatformSettings> {
    return this.db.settings;
  }

  async updateSettings(patch: Partial<PlatformSettings>, actorId: string): Promise<PlatformSettings> {
    this.db.settings = { ...this.db.settings, ...patch };
    this.audit(actorId, "settings.update", "platform_settings", "settings", JSON.stringify(patch));
    await this.persist();
    return this.db.settings;
  }

  // -------------------------------------------------------------------------
  // Profiles
  // -------------------------------------------------------------------------
  async getProfile(userId: string): Promise<Profile | null> {
    return this.db.profiles.find((p) => p.id === userId) ?? null;
  }

  async upsertProfile(profile: Profile): Promise<Profile> {
    const existing = this.db.profiles.find((p) => p.id === profile.id);
    if (existing) {
      Object.assign(existing, profile);
    } else {
      this.db.profiles.push(profile);
    }
    await this.persist();
    return profile;
  }

  async setUserRole(userId: string, role: Role): Promise<void> {
    const profile = this.db.profiles.find((p) => p.id === userId);
    if (profile) profile.role = role;
    await this.persist();
  }

  async listProfiles(): Promise<Profile[]> {
    return [...this.db.profiles];
  }

  // -------------------------------------------------------------------------
  // Categories & relationships
  // -------------------------------------------------------------------------
  async listCategories(): Promise<OrganizationCategory[]> {
    return [...this.db.categories];
  }

  async getCategoryBySlug(slug: string): Promise<OrganizationCategory | null> {
    return this.db.categories.find((c) => c.slug === slug) ?? null;
  }

  async getCategoryById(id: string): Promise<OrganizationCategory | null> {
    return this.db.categories.find((c) => c.id === id) ?? null;
  }

  async createCategory(input: Omit<OrganizationCategory, "id" | "createdAt">, actorId: string): Promise<OrganizationCategory> {
    const category: OrganizationCategory = { ...input, id: newId("cat"), createdAt: new Date().toISOString() };
    this.db.categories.push(category);
    this.audit(actorId, "category.create", "organization_category", category.id, category.slug);
    await this.persist();
    return category;
  }

  async updateCategory(id: string, patch: Partial<OrganizationCategory>, actorId: string): Promise<void> {
    const category = this.db.categories.find((c) => c.id === id);
    if (!category) return;
    Object.assign(category, patch);
    this.audit(actorId, "category.update", "organization_category", id, JSON.stringify(patch));
    await this.persist();
  }

  async listRelationships(): Promise<ReviewerRelationshipType[]> {
    return [...this.db.relationshipTypes];
  }

  async createRelationship(input: Omit<ReviewerRelationshipType, "id" | "createdAt">, actorId: string): Promise<ReviewerRelationshipType> {
    const rel: ReviewerRelationshipType = { ...input, id: newId("rel"), createdAt: new Date().toISOString() };
    this.db.relationshipTypes.push(rel);
    this.audit(actorId, "relationship.create", "reviewer_relationship_type", rel.id, rel.slug);
    await this.persist();
    return rel;
  }

  async listRelationshipsForCategory(categoryId: string): Promise<ReviewerRelationshipType[]> {
    const ids = this.db.categoryRelationships
      .filter((cr) => cr.categoryId === categoryId)
      .map((cr) => cr.relationshipTypeId);
    return this.db.relationshipTypes.filter((r) => ids.includes(r.id));
  }

  async setCategoryRelationships(categoryId: string, relationshipTypeIds: string[], actorId: string): Promise<void> {
    this.db.categoryRelationships = this.db.categoryRelationships.filter((cr) => cr.categoryId !== categoryId);
    for (const relId of relationshipTypeIds) {
      this.db.categoryRelationships.push({
        id: newId("catrel"),
        categoryId,
        relationshipTypeId: relId,
      });
    }
    this.audit(actorId, "category.relationships", "organization_category", categoryId, relationshipTypeIds.join(","));
    await this.persist();
  }

  // -------------------------------------------------------------------------
  // Templates
  // -------------------------------------------------------------------------
  async listTemplates(): Promise<RatingTemplate[]> {
    return [...this.db.templates];
  }

  async getTemplateBundle(categoryId: string, relationshipTypeId: string): Promise<TemplateBundle | null> {
    const template = this.db.templates.find(
      (t) => t.categoryId === categoryId && t.relationshipTypeIds.includes(relationshipTypeId),
    );
    if (!template) return null;
    const version = this.publishedVersion(template.id);
    if (!version) return null;
    return this.assembleBundle(template, version);
  }

  async getBundleByVersionId(versionId: string): Promise<TemplateBundle | null> {
    const version = this.db.templateVersions.find((v) => v.id === versionId);
    if (!version) return null;
    const template = this.db.templates.find((t) => t.id === version.templateId);
    if (!template) return null;
    return this.assembleBundle(template, version);
  }

  async getTemplateVersion(versionId: string): Promise<RatingTemplateVersion | null> {
    return this.db.templateVersions.find((v) => v.id === versionId) ?? null;
  }

  async listParameters(versionId: string): Promise<RatingParameter[]> {
    return this.db.parameters.filter((p) => p.versionId === versionId).sort((a, b) => a.order - b.order);
  }

  async listQuestions(parameterId: string): Promise<RatingQuestion[]> {
    return this.db.questions.filter((q) => q.parameterId === parameterId).sort((a, b) => a.order - b.order);
  }

  async listTemplateVersions(templateId: string): Promise<RatingTemplateVersion[]> {
    return this.db.templateVersions
      .filter((v) => v.templateId === templateId)
      .sort((a, b) => b.version - a.version);
  }

  async saveTemplateDraft(draft: TemplateDraft, actorId: string): Promise<RatingTemplate> {
    let template = draft.templateId
      ? this.db.templates.find((t) => t.id === draft.templateId)
      : this.db.templates.find((t) => t.categoryId === draft.categoryId && draft.relationshipTypeIds.every((r) => t.relationshipTypeIds.includes(r)) && t.relationshipTypeIds.length === draft.relationshipTypeIds.length);

    if (!template) {
      template = {
        id: newId("tpl"),
        categoryId: draft.categoryId,
        relationshipTypeIds: draft.relationshipTypeIds,
        name: draft.name,
        createdAt: new Date().toISOString(),
      };
      this.db.templates.push(template);
    } else {
      template.name = draft.name;
      template.relationshipTypeIds = draft.relationshipTypeIds;
    }

    // Work on a draft version (immutable published versions are never mutated).
    let draftVersion = this.db.templateVersions.find((v) => v.templateId === template!.id && v.status === "draft");
    if (!draftVersion) {
      const max = this.db.templateVersions
        .filter((v) => v.templateId === template!.id)
        .reduce((m, v) => Math.max(m, v.version), 0);
      draftVersion = {
        id: newId("tplv"),
        templateId: template.id,
        version: max + 1,
        status: "draft",
        changeNote: null,
        publishedAt: null,
        createdAt: new Date().toISOString(),
      };
      this.db.templateVersions.push(draftVersion);
    }

    // Replace draft parameters/questions.
    const oldParams = this.db.parameters.filter((p) => p.versionId === draftVersion!.id).map((p) => p.id);
    this.db.questions = this.db.questions.filter((q) => !oldParams.includes(q.parameterId));
    this.db.parameters = this.db.parameters.filter((p) => p.versionId !== draftVersion!.id);

    draft.parameters.forEach((p, idx) => {
      const paramId = newId(`p-${template!.id}-${idx}`);
      this.db.parameters.push({
        id: paramId,
        versionId: draftVersion!.id,
        key: p.key,
        name: p.name,
        description: p.description ?? { en: "", bn: "" },
        weight: p.weight,
        order: p.order ?? idx,
        active: true,
      });
      p.questions.forEach((qq, qi) => {
        this.db.questions.push({
          id: newId("q"),
          parameterId: paramId,
          text: qq.text,
          required: qq.required,
          order: qq.order ?? qi,
        });
      });
    });

    this.audit(actorId, "template.draft", "rating_template", template.id, `v${draftVersion.version}`);
    await this.persist();
    return template;
  }

  async publishVersion(templateId: string, actorId: string, changeNote?: string): Promise<RatingTemplateVersion> {
    const draft = this.db.templateVersions.find((v) => v.templateId === templateId && v.status === "draft");
    if (!draft) throw new Error("No draft version to publish");
    for (const v of this.db.templateVersions) {
      if (v.templateId === templateId && v.status === "published") v.status = "archived";
    }
    draft.status = "published";
    draft.publishedAt = new Date().toISOString();
    draft.changeNote = changeNote ?? draft.changeNote;
    this.audit(actorId, "template.publish", "rating_template_version", draft.id, `v${draft.version}`);
    await this.persist();
    return draft;
  }

  async archiveVersion(versionId: string, actorId: string): Promise<void> {
    const version = this.db.templateVersions.find((v) => v.id === versionId);
    if (version) version.status = "archived";
    this.audit(actorId, "template.archive", "rating_template_version", versionId);
    await this.persist();
  }

  // -------------------------------------------------------------------------
  // Organizations
  // -------------------------------------------------------------------------
  private orgSearchHaystack(org: Organization): string {
    const aliases = this.db.aliases.filter((a) => a.organizationId === org.id).map((a) => a.alias);
    return normalize(
      [org.officialName, org.bengaliName ?? "", ...org.alternateNames, ...aliases, org.slug].join(" "),
    );
  }

  async listOrganizations(filters: OrganizationFilters): Promise<Paginated<Organization>> {
    let items = this.db.organizations.filter((o) => o.status !== "merged");
    if (filters.categoryId) items = items.filter((o) => o.categoryId === filters.categoryId);
    if (filters.division) items = items.filter((o) => o.division === filters.division);
    if (filters.district) items = items.filter((o) => o.district === filters.district);
    if (filters.search) {
      const needle = normalize(filters.search);
      items = items.filter((o) => this.orgSearchHaystack(o).includes(needle));
    }
    if (filters.perspectiveRelationshipId) {
      const rel = filters.perspectiveRelationshipId;
      const versionIds = new Set(
        this.db.snapshots.map((s) => s.templateVersionId),
      );
      items = items.filter((o) =>
        this.db.reviews.some(
          (r) => r.organizationId === o.id && r.relationshipTypeId === rel && r.status === "published",
        ) && versionIds.size > 0,
      );
    }
    if (filters.hasScores) {
      const withScores = new Set(
        this.db.aggregates.filter((a) => a.eligibleCount > 0).map((a) => a.organizationId),
      );
      items = items.filter((o) => withScores.has(o.id));
    }
    items = items.sort((a, b) => a.officialName.localeCompare(b.officialName));
    return paginate(items, filters.page, filters.pageSize ?? 12);
  }

  async getOrganizationBySlug(slug: string): Promise<Organization | null> {
    return this.db.organizations.find((o) => o.slug === slug) ?? null;
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    return this.db.organizations.find((o) => o.id === id) ?? null;
  }

  async listOrganizationsByIds(ids: string[]): Promise<Organization[]> {
    return this.db.organizations.filter((o) => ids.includes(o.id));
  }

  async createOrganization(input: Omit<Organization, "id" | "createdAt" | "updatedAt">, actorId: string): Promise<Organization> {
    const org: Organization = {
      ...input,
      id: newId("org"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.db.organizations.push(org);
    this.audit(actorId, "organization.create", "organization", org.id, org.officialName);
    await this.persist();
    return org;
  }

  async updateOrganization(id: string, patch: Partial<Organization>, actorId: string): Promise<void> {
    const org = this.db.organizations.find((o) => o.id === id);
    if (!org) return;
    Object.assign(org, patch, { updatedAt: new Date().toISOString() });
    this.audit(actorId, "organization.update", "organization", id, JSON.stringify(patch));
    await this.persist();
  }

  async listBranches(organizationId: string): Promise<OrganizationBranch[]> {
    return this.db.branches.filter((b) => b.organizationId === organizationId);
  }

  // -------------------------------------------------------------------------
  // Reviews
  // -------------------------------------------------------------------------
  async listReviews(filters: ReviewFilters): Promise<Paginated<Review>> {
    let items = [...this.db.reviews];
    if (filters.organizationId) items = items.filter((r) => r.organizationId === filters.organizationId);
    if (filters.branchId !== undefined) items = items.filter((r) => r.branchId === filters.branchId);
    if (filters.relationshipTypeId) items = items.filter((r) => r.relationshipTypeId === filters.relationshipTypeId);
    if (filters.status) items = items.filter((r) => r.status === filters.status);
    if (filters.userId) items = items.filter((r) => r.userId === filters.userId);
    items = items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return paginate(items, filters.page, filters.pageSize ?? 20);
  }

  async getReviewById(id: string): Promise<Review | null> {
    return this.db.reviews.find((r) => r.id === id) ?? null;
  }

  async getAnswersForReviews(reviewIds: string[]): Promise<ReviewAnswer[]> {
    return this.db.answers.filter((a) => reviewIds.includes(a.reviewId));
  }

  async createReview(input: CreateReviewInput): Promise<Review> {
    const id = newId("rev");
    const nowIso = new Date().toISOString();
    const review: Review = {
      id,
      userId: input.userId,
      organizationId: input.organizationId,
      branchId: input.branchId,
      categoryId: input.categoryId,
      relationshipTypeId: input.relationshipTypeId,
      templateVersionId: input.templateVersionId,
      status: "pending",
      title: input.title,
      body: input.body,
      employmentStage: input.employmentStage,
      experiencePeriod: input.experiencePeriod,
      displayName: input.displayName,
      language: input.language,
      score: null,
      createdAt: nowIso,
      updatedAt: nowIso,
      publishedAt: null,
      moderationReason: null,
    };
    const answers: ReviewAnswer[] = input.answers.map((a) => ({
      id: newId("ans"),
      reviewId: id,
      parameterId: a.parameterId,
      value: a.value,
    }));
    this.db.reviews.push(review);
    this.db.answers.push(...answers);
    this.db.snapshots.push({
      reviewId: id,
      templateVersionId: input.templateVersionId,
      score: input.score,
      answeredParameters: input.answeredParameters,
      weightCoverage: input.weightCoverage,
      eligible: input.eligible,
      createdAt: nowIso,
    });
    await this.persist();
    return review;
  }

  async updateReviewStatus(
    reviewId: string,
    status: ReviewStatus,
    actorId: string,
    reason?: string | null,
  ): Promise<void> {
    const review = this.db.reviews.find((r) => r.id === reviewId);
    if (!review) return;
    const previous = review.status;
    review.status = status;
    review.updatedAt = new Date().toISOString();
    review.moderationReason = reason ?? null;
    if (status === "published") {
      review.publishedAt = new Date().toISOString();
      const snap = this.db.snapshots.find((s) => s.reviewId === reviewId);
      review.score = snap?.score ?? review.score;
    } else {
      review.score = null;
    }
    this.db.moderationActions.unshift({
      id: newId("mod"),
      reviewId,
      actorUserId: actorId,
      action:
        status === "published"
          ? "approve"
          : status === "rejected"
            ? "reject"
            : status === "pending"
              ? "return"
              : status === "withdrawn"
                ? "withdraw"
                : "hide",
      reason: reason ?? null,
      createdAt: new Date().toISOString(),
    });
    this.audit(actorId, `review.${status}`, "review", reviewId, `from ${previous}`);
    await this.recomputeAggregates(review.organizationId);
    await this.persist();
  }

  async withdrawReview(reviewId: string, userId: string): Promise<void> {
    const review = this.db.reviews.find((r) => r.id === reviewId);
    if (!review || review.userId !== userId) return;
    review.status = "withdrawn";
    review.updatedAt = new Date().toISOString();
    review.score = null;
    await this.recomputeAggregates(review.organizationId);
    await this.persist();
  }

  // -------------------------------------------------------------------------
  // Aggregates
  // -------------------------------------------------------------------------
  private computeAggregatesFor(organizationId: string): OrganizationScoreAggregate[] {
    const reviews = this.db.reviews.filter(
      (r) => r.organizationId === organizationId && r.status === "published" && r.score !== null,
    );
    const buckets = new Map<string, Review[]>();
    for (const r of reviews) {
      const key = [r.branchId ?? "", r.categoryId, r.relationshipTypeId, r.templateVersionId].join("::");
      const arr = buckets.get(key) ?? [];
      arr.push(r);
      buckets.set(key, arr);
    }
    const result: OrganizationScoreAggregate[] = [];
    for (const [key, group] of buckets) {
      const [branchId, categoryId, relationshipTypeId, templateVersionId] = key.split("::");
      const inputs = group.map((r) => ({
        score: r.score as number,
        answers: this.db.answers
          .filter((a) => a.reviewId === r.id)
          .map((a) => ({ parameterId: a.parameterId, value: a.value })),
        relationshipTypeId: r.relationshipTypeId,
        templateVersionId: r.templateVersionId,
      }));
      const agg = aggregateReviews(inputs);
      const parameterScores: Record<string, number> = {};
      for (const p of agg.parameterAverages) parameterScores[p.parameterId] = p.average;
      result.push({
        id: `${organizationId}::${key}`,
        organizationId,
        branchId: branchId || null,
        categoryId,
        relationshipTypeId,
        templateVersionId,
        eligibleCount: agg.eligibleCount,
        averageScore: agg.averageScore,
        parameterScores,
        distribution: agg.distribution,
        computedAt: new Date().toISOString(),
      });
    }
    return result;
  }

  private recomputeAll(): void {
    const orgIds = new Set(this.db.reviews.map((r) => r.organizationId));
    this.db.aggregates = [...orgIds].flatMap((id) => this.computeAggregatesFor(id));
  }

  async getAggregates(organizationId: string, branchId?: string | null): Promise<OrganizationScoreAggregate[]> {
    const all = this.db.aggregates.filter((a) => a.organizationId === organizationId);
    if (branchId === undefined) return all;
    return all.filter((a) => a.branchId === branchId);
  }

  async getScoreCards(organizationIds: string[]): Promise<OrgScoreCard[]> {
    const cards: OrgScoreCard[] = [];
    for (const aggregate of this.db.aggregates) {
      if (!organizationIds.includes(aggregate.organizationId)) continue;
      cards.push({
        organizationId: aggregate.organizationId,
        branchId: aggregate.branchId,
        relationshipTypeId: aggregate.relationshipTypeId,
        categoryId: aggregate.categoryId,
        templateVersionId: aggregate.templateVersionId,
        score: aggregate.averageScore,
        eligibleCount: aggregate.eligibleCount,
        sufficiency: sufficiency(aggregate.eligibleCount, scoreThresholds),
      });
    }
    return cards;
  }

  async recomputeAggregates(organizationId: string): Promise<OrganizationScoreAggregate[]> {
    const others = this.db.aggregates.filter((a) => a.organizationId !== organizationId);
    this.db.aggregates = [...others, ...this.computeAggregatesFor(organizationId)];
    return this.db.aggregates.filter((a) => a.organizationId === organizationId);
  }

  // -------------------------------------------------------------------------
  // Moderation extras
  // -------------------------------------------------------------------------
  async listModerationActions(reviewId: string): Promise<ModerationAction[]> {
    return this.db.moderationActions.filter((m) => m.reviewId === reviewId);
  }

  async createReport(input: { reviewId: string; reporterUserId: string; reason: string; details: string | null }): Promise<ReviewReport> {
    const report: ReviewReport = {
      id: newId("rep"),
      reviewId: input.reviewId,
      reporterUserId: input.reporterUserId,
      reason: input.reason,
      details: input.details,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    this.db.reports.unshift(report);
    await this.persist();
    return report;
  }

  async listReports(): Promise<ReviewReport[]> {
    return [...this.db.reports];
  }

  async setReportStatus(id: string, status: "open" | "resolved" | "dismissed", actorId: string): Promise<void> {
    const report = this.db.reports.find((r) => r.id === id);
    if (!report) return;
    report.status = status;
    this.audit(actorId, `report.${status}`, "review_report", id);
    await this.persist();
  }

  async createAppeal(input: { reviewId: string; userId: string; message: string }): Promise<ReviewAppeal> {
    const appeal: ReviewAppeal = {
      id: newId("apl"),
      reviewId: input.reviewId,
      userId: input.userId,
      message: input.message,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    this.db.appeals.unshift(appeal);
    const review = this.db.reviews.find((r) => r.id === input.reviewId);
    if (review && review.status === "rejected") review.status = "under_appeal";
    await this.persist();
    return appeal;
  }

  async listAppeals(): Promise<ReviewAppeal[]> {
    return [...this.db.appeals];
  }

  async setAppealStatus(id: string, status: "open" | "accepted" | "rejected", actorId: string): Promise<void> {
    const appeal = this.db.appeals.find((a) => a.id === id);
    if (!appeal) return;
    appeal.status = status;
    if (status === "accepted") {
      const review = this.db.reviews.find((r) => r.id === appeal.reviewId);
      if (review) {
        review.status = "published";
        review.publishedAt = new Date().toISOString();
        review.score = this.db.snapshots.find((s) => s.reviewId === review.id)?.score ?? review.score;
        await this.recomputeAggregates(review.organizationId);
      }
    }
    this.audit(actorId, `appeal.${status}`, "review_appeal", id);
    await this.persist();
  }

  // -------------------------------------------------------------------------
  // Claims & responses
  // -------------------------------------------------------------------------
  async createClaim(input: Omit<OrganizationClaim, "id" | "createdAt" | "status">): Promise<OrganizationClaim> {
    const claim: OrganizationClaim = {
      ...input,
      id: newId("clm"),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    this.db.claims.unshift(claim);
    await this.persist();
    return claim;
  }

  async listClaims(): Promise<OrganizationClaim[]> {
    return [...this.db.claims];
  }

  async setClaimStatus(id: string, status: "pending" | "approved" | "rejected", actorId: string): Promise<void> {
    const claim = this.db.claims.find((c) => c.id === id);
    if (!claim) return;
    claim.status = status;
    if (status === "approved") {
      const org = this.db.organizations.find((o) => o.id === claim.organizationId);
      if (org) org.claimStatus = "claimed";
      if (!this.db.representatives.some((r) => r.organizationId === claim.organizationId && r.userId === claim.requesterUserId)) {
        this.db.representatives.push({
          id: newId("repr"),
          organizationId: claim.organizationId,
          userId: claim.requesterUserId,
          position: claim.position,
          createdAt: new Date().toISOString(),
        });
      }
    }
    this.audit(actorId, `claim.${status}`, "organization_claim", id);
    await this.persist();
  }

  async listRepresentatives(organizationId: string): Promise<OrganizationRepresentative[]> {
    return this.db.representatives.filter((r) => r.organizationId === organizationId);
  }

  async isRepresentative(organizationId: string, userId: string): Promise<boolean> {
    return this.db.representatives.some((r) => r.organizationId === organizationId && r.userId === userId);
  }

  async createResponse(input: { reviewId: string; organizationId: string; representativeUserId: string; body: string }): Promise<OrganizationResponse> {
    const response: OrganizationResponse = {
      id: newId("rsp"),
      reviewId: input.reviewId,
      organizationId: input.organizationId,
      representativeUserId: input.representativeUserId,
      body: input.body,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    this.db.responses.unshift(response);
    await this.persist();
    return response;
  }

  async listResponses(organizationId: string): Promise<OrganizationResponse[]> {
    return this.db.responses.filter((r) => r.organizationId === organizationId);
  }

  async listResponsesForReviews(reviewIds: string[]): Promise<OrganizationResponse[]> {
    return this.db.responses.filter((r) => reviewIds.includes(r.reviewId) && r.status === "published");
  }

  async setResponseStatus(id: string, status: "pending" | "published" | "rejected", actorId: string): Promise<void> {
    const response = this.db.responses.find((r) => r.id === id);
    if (!response) return;
    response.status = status;
    this.audit(actorId, `response.${status}`, "organization_response", id);
    await this.persist();
  }

  // -------------------------------------------------------------------------
  // Organization suggestions (manual add — requires admin approval)
  // -------------------------------------------------------------------------
  async createSuggestion(
    input: Omit<OrganizationSuggestion, "id" | "createdAt" | "status" | "reviewReason">,
  ): Promise<OrganizationSuggestion> {
    const suggestion: OrganizationSuggestion = {
      ...input,
      id: newId("sug"),
      status: "pending",
      reviewReason: null,
      createdAt: new Date().toISOString(),
    };
    this.db.suggestions.unshift(suggestion);
    await this.persist();
    return suggestion;
  }

  async listSuggestions(): Promise<OrganizationSuggestion[]> {
    return [...this.db.suggestions];
  }

  async approveSuggestion(id: string, actorId: string): Promise<Organization> {
    const suggestion = this.db.suggestions.find((s) => s.id === id);
    if (!suggestion) throw new StoreError("Suggestion not found");
    const baseSlug = slugify(suggestion.suggestedName);
    let slug = baseSlug || `org-${Date.now()}`;
    let n = 1;
    while (this.db.organizations.some((o) => o.slug === slug)) {
      slug = `${baseSlug}-${++n}`;
    }
    const nowIso = new Date().toISOString();
    const org: Organization = {
      id: newId("org"),
      slug,
      officialName: suggestion.suggestedName,
      bengaliName: suggestion.suggestedBengaliName,
      alternateNames: [],
      categoryId: suggestion.categoryId,
      parentOrganizationId: null,
      description: { en: "", bn: "" },
      website: suggestion.website,
      address: suggestion.address,
      division: suggestion.division,
      district: suggestion.district,
      city: suggestion.city,
      status: "active",
      googleMapsUrl: null,
      googlePlaceId: null,
      verified: true,
      claimStatus: "unclaimed",
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    this.db.organizations.push(org);
    suggestion.status = "approved";
    this.audit(actorId, "suggestion.approve", "organization_suggestion", id, org.id);
    await this.persist();
    return org;
  }

  async rejectSuggestion(id: string, reason: string | null, actorId: string): Promise<void> {
    const suggestion = this.db.suggestions.find((s) => s.id === id);
    if (!suggestion) return;
    suggestion.status = "rejected";
    suggestion.reviewReason = reason;
    this.audit(actorId, "suggestion.reject", "organization_suggestion", id, reason ?? undefined);
    await this.persist();
  }

  // -------------------------------------------------------------------------
  // Audit
  // -------------------------------------------------------------------------
  async listAuditLogs(limit = 100): Promise<AuditLog[]> {
    return this.db.auditLogs.slice(0, limit);
  }
}
