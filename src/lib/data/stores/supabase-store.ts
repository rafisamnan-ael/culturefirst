import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
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
  RatingValue,
} from "@/types/domain";
import { aggregateReviews, sufficiency } from "@/lib/scoring";
import { scoreThresholds } from "@/lib/config";
import type {
  CreateReviewInput,
  OrgScoreCard,
  OrganizationFilters,
  Paginated,
  ReviewFilters,
  Store,
  TemplateDraft,
} from "@/lib/data/store";

type Row = Record<string, unknown>;

function bi(value: unknown): { en: string; bn: string } {
  if (value && typeof value === "object") {
    const v = value as { en?: unknown; bn?: unknown };
    return { en: String(v.en ?? ""), bn: String(v.bn ?? "") };
  }
  return { en: "", bn: "" };
}

function bool(v: unknown): boolean {
  return v === true;
}
function num(v: unknown): number {
  return typeof v === "number" ? v : Number(v ?? 0);
}
function str(v: unknown): string {
  return String(v ?? "");
}
function nullable<T>(v: unknown): T | null {
  return (v ?? null) as T | null;
}
function iso(v: unknown): string {
  return v ? String(v) : new Date().toISOString();
}
function arr(v: unknown): string[] {
  return Array.isArray(v) ? (v as string[]) : [];
}

function toRatingValue(v: unknown): RatingValue {
  if (v === "not_observed") return "not_observed";
  const n = Number(v);
  if (n >= 1 && n <= 5) return n as RatingValue;
  return "not_observed";
}

function paginate<T>(items: T[], total: number, page = 1, pageSize = 12): Paginated<T> {
  return { items, total, page, pageSize };
}

/** Production Supabase-backed store. Server-side only; writes use the
 * service-role client because all authorization is enforced in the server
 * actions (role guards) before any privileged operation. */
export class SupabaseStore implements Store {
  private supabase: SupabaseClient;
  private privileged: SupabaseClient;

  private constructor(supabase: SupabaseClient, privileged: SupabaseClient) {
    this.supabase = supabase;
    this.privileged = privileged;
  }

  static async create(): Promise<Store> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !anon) {
      throw new Error(
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, or use DATA_SOURCE=fixtures for local development.",
      );
    }
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for server-side operations.");
    }
    const pub = createClient(url, anon, { auth: { persistSession: false } });
    const priv = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    return new SupabaseStore(pub, priv);
  }

  private must<T>(data: T | null, error: unknown, fallback: string): T {
    if (error) throw new Error(`${fallback}: ${String((error as { message?: string })?.message ?? error)}`);
    if (data === null || data === undefined) throw new Error(fallback);
    return data;
  }

  // -------------------------------------------------------------------------
  // Mappers
  // -------------------------------------------------------------------------
  private category(r: Row): OrganizationCategory {
    return { id: str(r.id), slug: str(r.slug), name: bi(r.name), description: bi(r.description), icon: str(r.icon), isFallback: bool(r.is_fallback), createdAt: iso(r.created_at) };
  }
  private relationship(r: Row): ReviewerRelationshipType {
    return { id: str(r.id), slug: str(r.slug), name: bi(r.name), kind: (str(r.kind) as ReviewerRelationshipType["kind"]) ?? "other", createdAt: iso(r.created_at) };
  }
  private organization(r: Row): Organization {
    return {
      id: str(r.id), slug: str(r.slug), officialName: str(r.official_name), bengaliName: nullable<string>(r.bengali_name),
      alternateNames: arr(r.alternate_names), categoryId: str(r.category_id), parentOrganizationId: nullable<string>(r.parent_organization_id),
      description: bi(r.description), website: nullable<string>(r.website), address: nullable<string>(r.address),
      division: nullable<string>(r.division), district: nullable<string>(r.district), city: nullable<string>(r.city),
      status: (str(r.status) as Organization["status"]) ?? "active", googleMapsUrl: nullable<string>(r.google_maps_url),
      googlePlaceId: nullable<string>(r.google_place_id), verified: bool(r.verified),
      claimStatus: (str(r.claim_status) as Organization["claimStatus"]) ?? "unclaimed",
      createdAt: iso(r.created_at), updatedAt: iso(r.updated_at),
    };
  }
  private branch(r: Row): OrganizationBranch {
    return { id: str(r.id), organizationId: str(r.organization_id), name: str(r.name), address: nullable<string>(r.address), division: nullable<string>(r.division), district: nullable<string>(r.district), city: nullable<string>(r.city), createdAt: iso(r.created_at) };
  }
  private template(r: Row, relIds: string[] = []): RatingTemplate {
    return { id: str(r.id), categoryId: str(r.category_id), relationshipTypeIds: relIds, name: bi(r.name), createdAt: iso(r.created_at) };
  }
  private version(r: Row): RatingTemplateVersion {
    return { id: str(r.id), templateId: str(r.template_id), version: num(r.version), status: (str(r.status) as RatingTemplateVersion["status"]) ?? "draft", changeNote: nullable<string>(r.change_note), publishedAt: nullable<string>(r.published_at), createdAt: iso(r.created_at) };
  }
  private parameter(r: Row): RatingParameter {
    return { id: str(r.id), versionId: str(r.version_id), key: str(r.key), name: bi(r.name), description: bi(r.description), weight: num(r.weight), order: num(r.ordering), active: bool(r.active) };
  }
  private question(r: Row): RatingQuestion {
    return { id: str(r.id), parameterId: str(r.parameter_id), text: bi(r.text), required: bool(r.required), order: num(r.ordering) };
  }
  private review(r: Row): Review {
    return {
      id: str(r.id), userId: str(r.user_id), organizationId: str(r.organization_id), branchId: nullable<string>(r.branch_id),
      categoryId: str(r.category_id), relationshipTypeId: str(r.relationship_type_id), templateVersionId: str(r.template_version_id),
      status: (str(r.status) as ReviewStatus) ?? "pending", title: nullable<string>(r.title), body: str(r.body),
      employmentStage: nullable<string>(r.employment_stage), experiencePeriod: nullable<string>(r.experience_period),
      displayName: nullable<string>(r.display_name), language: ((str(r.language) as Review["language"]) || "en"),
      score: r.score === null || r.score === undefined ? null : num(r.score),
      createdAt: iso(r.created_at), updatedAt: iso(r.updated_at), publishedAt: nullable<string>(r.published_at),
      moderationReason: nullable<string>(r.moderation_reason),
    };
  }
  private answer(r: Row): ReviewAnswer {
    return { id: str(r.id), reviewId: str(r.review_id), parameterId: str(r.parameter_id), value: toRatingValue(r.value) };
  }
  private aggregate(r: Row): OrganizationScoreAggregate {
    return {
      id: str(r.id), organizationId: str(r.organization_id), branchId: nullable<string>(r.branch_id),
      categoryId: str(r.category_id), relationshipTypeId: str(r.relationship_type_id), templateVersionId: str(r.template_version_id),
      eligibleCount: num(r.eligible_count), averageScore: r.average_score === null ? null : num(r.average_score),
      parameterScores: (r.parameter_scores as Record<string, number>) ?? {},
      distribution: (r.distribution as Record<string, number>) ?? {},
      computedAt: iso(r.computed_at),
    };
  }
  private settings(r: Row): PlatformSettings {
    return {
      brandName: str(r.brand_name), tagline: str(r.tagline), methodologyPublic: str(r.methodology_public),
      minProvisionalReviews: num(r.min_provisional_reviews), minPublishedReviews: num(r.min_published_reviews),
      minAnsweredParameters: num(r.min_answered_parameters), minWeightCoverage: num(r.min_weight_coverage),
      maintenanceMessage: nullable<string>(r.maintenance_message),
    };
  }

  private async templateRelIds(templateId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from("rating_template_relationships")
      .select("relationship_type_id")
      .eq("template_id", templateId);
    if (error || !data) return [];
    return (data as Row[]).map((r) => str(r.relationship_type_id));
  }

  private async assemble(versionId: string): Promise<TemplateBundle | null> {
    const { data: vData, error: vErr } = await this.supabase
      .from("rating_template_versions").select("*").eq("id", versionId).single();
    if (vErr || !vData) return null;
    const version = this.version(vData as Row);
    const { data: tData, error: tErr } = await this.supabase
      .from("rating_templates").select("*").eq("id", version.templateId).single();
    if (tErr || !tData) return null;
    const relIds = await this.templateRelIds(version.templateId);
    const template = this.template(tData as Row, relIds);
    const { data: pData } = await this.supabase
      .from("rating_parameters").select("*").eq("version_id", versionId).eq("active", true).order("ordering");
    const params = ((pData ?? []) as Row[]).map((r) => this.parameter(r));
    const { data: qData } = await this.supabase
      .from("rating_questions").select("*")
      .in("parameter_id", params.length ? params.map((p) => p.id) : ["00000000-0000-0000-0000-000000000000"])
      .order("ordering");
    const questions = ((qData ?? []) as Row[]).map((r) => this.question(r));
    return {
      template,
      version,
      parameters: params.map((p) => ({ ...p, questions: questions.filter((q) => q.parameterId === p.id) })),
    };
  }

  // -------------------------------------------------------------------------
  // Platform
  // -------------------------------------------------------------------------
  async getSettings(): Promise<PlatformSettings> {
    const { data, error } = await this.supabase.from("platform_settings").select("*").eq("id", 1).single();
    const row = this.must(data as Row | null, error, "settings");
    return this.settings(row);
  }

  async updateSettings(patch: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const row: Row = {};
    if (patch.brandName !== undefined) row.brand_name = patch.brandName;
    if (patch.tagline !== undefined) row.tagline = patch.tagline;
    if (patch.methodologyPublic !== undefined) row.methodology_public = patch.methodologyPublic;
    if (patch.minProvisionalReviews !== undefined) row.min_provisional_reviews = patch.minProvisionalReviews;
    if (patch.minPublishedReviews !== undefined) row.min_published_reviews = patch.minPublishedReviews;
    if (patch.minAnsweredParameters !== undefined) row.min_answered_parameters = patch.minAnsweredParameters;
    if (patch.minWeightCoverage !== undefined) row.min_weight_coverage = patch.minWeightCoverage;
    if (patch.maintenanceMessage !== undefined) row.maintenance_message = patch.maintenanceMessage;
    if (Object.keys(row).length) {
      const { error } = await this.privileged.from("platform_settings").update(row).eq("id", 1);
      if (error) throw new Error(`settings update: ${error.message}`);
    }
    await this.audit("_", "settings.update", "platform_settings", "settings", JSON.stringify(patch));
    return this.getSettings();
  }

  private async audit(actorUserId: string, action: string, entityType: string, entityId: string, detail?: string | null) {
    await this.privileged.from("audit_logs").insert({
      actor_user_id: actorUserId === "_" ? null : actorUserId,
      action, entity_type: entityType, entity_id: entityId, detail: detail ?? null,
    });
  }

  // -------------------------------------------------------------------------
  // Profiles
  // -------------------------------------------------------------------------
  async getProfile(userId: string): Promise<Profile | null> {
    const { data } = await this.privileged.from("profiles").select("*").eq("id", userId).single();
    if (!data) return null;
    const r = data as Row;
    return { id: str(r.id), email: str(r.email), displayName: nullable<string>(r.display_name), role: (str(r.role) as Role) ?? "user", createdAt: iso(r.created_at) };
  }

  async upsertProfile(profile: Profile): Promise<Profile> {
    await this.privileged.from("profiles").upsert(
      { id: profile.id, email: profile.email, display_name: profile.displayName, role: profile.role },
      { onConflict: "id" },
    );
    return profile;
  }

  async setUserRole(userId: string, role: Role): Promise<void> {
    await this.privileged.from("profiles").update({ role }).eq("id", userId);
  }

  async listProfiles(): Promise<Profile[]> {
    const { data, error } = await this.privileged.from("profiles").select("*").order("created_at");
    this.must(data, error, "profiles");
    return ((data ?? []) as Row[]).map((r) => ({
      id: str(r.id), email: str(r.email), displayName: nullable<string>(r.display_name),
      role: (str(r.role) as Role) ?? "user", createdAt: iso(r.created_at),
    }));
  }

  // -------------------------------------------------------------------------
  // Categories & relationships
  // -------------------------------------------------------------------------
  async listCategories(): Promise<OrganizationCategory[]> {
    const { data, error } = await this.supabase.from("organization_categories").select("*").order("name->en");
    this.must(data, error, "categories");
    return ((data ?? []) as Row[]).map((r) => this.category(r));
  }

  async getCategoryBySlug(slug: string): Promise<OrganizationCategory | null> {
    const { data } = await this.supabase.from("organization_categories").select("*").eq("slug", slug).single();
    if (!data) return null;
    return this.category(data as Row);
  }

  async getCategoryById(id: string): Promise<OrganizationCategory | null> {
    const { data } = await this.supabase.from("organization_categories").select("*").eq("id", id).single();
    if (!data) return null;
    return this.category(data as Row);
  }

  async createCategory(input: Omit<OrganizationCategory, "id" | "createdAt">, actorId: string): Promise<OrganizationCategory> {
    const { data, error } = await this.privileged
      .from("organization_categories")
      .insert({ slug: input.slug, name: input.name, description: input.description, icon: input.icon, is_fallback: input.isFallback })
      .select("*").single();
    const row = this.must(data as Row | null, error, "create category");
    await this.audit(actorId, "category.create", "organization_category", str(row.id), str(row.slug));
    return this.category(row);
  }

  async updateCategory(id: string, patch: Partial<OrganizationCategory>, actorId: string): Promise<void> {
    const row: Row = {};
    if (patch.name) row.name = patch.name;
    if (patch.description) row.description = patch.description;
    if (patch.icon) row.icon = patch.icon;
    if (patch.slug) row.slug = patch.slug;
    if (Object.keys(row).length) {
      const { error } = await this.privileged.from("organization_categories").update(row).eq("id", id);
      if (error) throw new Error(`update category: ${error.message}`);
    }
    await this.audit(actorId, "category.update", "organization_category", id, JSON.stringify(patch));
  }

  async listRelationships(): Promise<ReviewerRelationshipType[]> {
    const { data, error } = await this.supabase.from("reviewer_relationship_types").select("*").order("name->en");
    this.must(data, error, "relationships");
    return ((data ?? []) as Row[]).map((r) => this.relationship(r));
  }

  async createRelationship(input: Omit<ReviewerRelationshipType, "id" | "createdAt">, actorId: string): Promise<ReviewerRelationshipType> {
    const { data, error } = await this.privileged
      .from("reviewer_relationship_types")
      .insert({ slug: input.slug, name: input.name, kind: input.kind }).select("*").single();
    const row = this.must(data as Row | null, error, "create relationship");
    await this.audit(actorId, "relationship.create", "reviewer_relationship_type", str(row.id), str(row.slug));
    return this.relationship(row);
  }

  async listRelationshipsForCategory(categoryId: string): Promise<ReviewerRelationshipType[]> {
    const { data, error } = await this.supabase
      .from("category_relationships").select("relationship_type_id").eq("category_id", categoryId);
    this.must(data, error, "category relationships");
    const ids = ((data ?? []) as Row[]).map((r) => str(r.relationship_type_id));
    if (!ids.length) return [];
    const { data: rels } = await this.supabase.from("reviewer_relationship_types").select("*").in("id", ids);
    return ((rels ?? []) as Row[]).map((r) => this.relationship(r));
  }

  async setCategoryRelationships(categoryId: string, relationshipTypeIds: string[], actorId: string): Promise<void> {
    await this.privileged.from("category_relationships").delete().eq("category_id", categoryId);
    if (relationshipTypeIds.length) {
      await this.privileged.from("category_relationships").insert(
        relationshipTypeIds.map((relationship_type_id) => ({ category_id: categoryId, relationship_type_id })),
      );
    }
    await this.audit(actorId, "category.relationships", "organization_category", categoryId, relationshipTypeIds.join(","));
  }

  // -------------------------------------------------------------------------
  // Templates
  // -------------------------------------------------------------------------
  async listTemplates(): Promise<RatingTemplate[]> {
    const { data, error } = await this.privileged.from("rating_templates").select("*").order("created_at");
    this.must(data, error, "templates");
    const rows = ((data ?? []) as Row[]).map((r) => this.template(r));
    for (const t of rows) t.relationshipTypeIds = await this.templateRelIds(t.id);
    return rows;
  }

  async getTemplateBundle(categoryId: string, relationshipTypeId: string): Promise<TemplateBundle | null> {
    const { data: rels } = await this.supabase
      .from("rating_template_relationships").select("template_id").eq("relationship_type_id", relationshipTypeId);
    const templateIds = ((rels ?? []) as Row[]).map((r) => str(r.template_id));
    if (!templateIds.length) return null;
    const { data: templates } = await this.supabase.from("rating_templates").select("id").eq("category_id", categoryId).in("id", templateIds);
    const match = (templates as Row[] | null)?.[0];
    if (!match) return null;
    const { data: versions } = await this.supabase
      .from("rating_template_versions").select("id").eq("template_id", str(match.id)).eq("status", "published")
      .order("version", { ascending: false }).limit(1);
    const version = (versions as Row[] | null)?.[0];
    if (!version) return null;
    return this.assemble(str(version.id));
  }

  async getBundleByVersionId(versionId: string): Promise<TemplateBundle | null> {
    return this.assemble(versionId);
  }

  async getTemplateVersion(versionId: string): Promise<RatingTemplateVersion | null> {
    const { data } = await this.supabase.from("rating_template_versions").select("*").eq("id", versionId).single();
    if (!data) return null;
    return this.version(data as Row);
  }

  async listParameters(versionId: string): Promise<RatingParameter[]> {
    const { data } = await this.supabase.from("rating_parameters").select("*").eq("version_id", versionId).eq("active", true).order("ordering");
    return ((data ?? []) as Row[]).map((r) => this.parameter(r));
  }

  async listQuestions(parameterId: string): Promise<RatingQuestion[]> {
    const { data } = await this.supabase.from("rating_questions").select("*").eq("parameter_id", parameterId).order("ordering");
    return ((data ?? []) as Row[]).map((r) => this.question(r));
  }

  async listTemplateVersions(templateId: string): Promise<RatingTemplateVersion[]> {
    const { data } = await this.privileged.from("rating_template_versions").select("*").eq("template_id", templateId).order("version", { ascending: false });
    return ((data ?? []) as Row[]).map((r) => this.version(r));
  }

  async saveTemplateDraft(draft: TemplateDraft, actorId: string): Promise<RatingTemplate> {
    let templateId = draft.templateId;
    if (templateId) {
      await this.privileged.from("rating_templates").update({ name: draft.name }).eq("id", templateId);
      await this.privileged.from("rating_template_relationships").delete().eq("template_id", templateId);
      await this.privileged.from("rating_template_relationships").insert(
        draft.relationshipTypeIds.map((relationship_type_id) => ({ template_id: templateId as string, relationship_type_id })),
      );
    } else {
      const { data, error } = await this.privileged
        .from("rating_templates").insert({ category_id: draft.categoryId, name: draft.name }).select("*").single();
      const row = this.must(data as Row | null, error, "create template");
      templateId = str(row.id);
      await this.privileged.from("rating_template_relationships").insert(
        draft.relationshipTypeIds.map((relationship_type_id) => ({ template_id: templateId as string, relationship_type_id })),
      );
    }

    const { data: existing } = await this.privileged
      .from("rating_template_versions").select("*").eq("template_id", templateId).eq("status", "draft").limit(1);
    let draftRow = (existing as Row[] | null)?.[0];
    if (!draftRow) {
      const { data: all } = await this.privileged.from("rating_template_versions").select("version").eq("template_id", templateId);
      const max = (((all ?? []) as Row[]).reduce((m, r) => Math.max(m, num(r.version)), 0) ?? 0) + 1;
      const { data: created, error } = await this.privileged
        .from("rating_template_versions").insert({ template_id: templateId, version: max, status: "draft" }).select("*").single();
      draftRow = this.must(created as Row | null, error, "create draft version");
    }

    // Replace draft content (never mutate published rows).
    await this.privileged.from("rating_parameters").delete().eq("version_id", str(draftRow.id));
    const paramRows = draft.parameters.map((p, i) => ({
      version_id: str(draftRow!.id), key: p.key, name: p.name, description: p.description ?? { en: "", bn: "" },
      weight: p.weight, ordering: p.order ?? i, active: true,
    }));
    const { data: createdParams, error: pErr } = await this.privileged.from("rating_parameters").insert(paramRows).select("id, ordering");
    if (pErr) throw new Error(`save draft params: ${pErr.message}`);
    const questionRows = (createdParams as Row[] | null ?? []).flatMap((cp, i) =>
      (draft.parameters[i]?.questions ?? []).map((q, qi) => ({
        parameter_id: str(cp.id), text: q.text, required: q.required, ordering: q.order ?? qi,
      })),
    );
    if (questionRows.length) {
      const { error: qErr } = await this.privileged.from("rating_questions").insert(questionRows);
      if (qErr) throw new Error(`save draft questions: ${qErr.message}`);
    }

    await this.audit(actorId, "template.draft", "rating_template", templateId);
    const relIds = await this.templateRelIds(templateId);
    const { data: tRow } = await this.privileged.from("rating_templates").select("*").eq("id", templateId).single();
    return this.template(this.must(tRow as Row | null, null, "template"), relIds);
  }

  async publishVersion(templateId: string, actorId: string, changeNote?: string): Promise<RatingTemplateVersion> {
    const { data: drafts } = await this.privileged
      .from("rating_template_versions").select("*").eq("template_id", templateId).eq("status", "draft").limit(1);
    const draftRow = (drafts as Row[] | null)?.[0];
    if (!draftRow) throw new Error("No draft version to publish");
    await this.privileged.from("rating_template_versions").update({ status: "archived" }).eq("template_id", templateId).eq("status", "published");
    const { data, error } = await this.privileged
      .from("rating_template_versions")
      .update({ status: "published", published_at: new Date().toISOString(), change_note: changeNote ?? null })
      .eq("id", str(draftRow.id)).select("*").single();
    const row = this.must(data as Row | null, error, "publish");
    await this.audit(actorId, "template.publish", "rating_template_version", str(row.id), `v${num(row.version)}`);
    return this.version(row);
  }

  async archiveVersion(versionId: string, actorId: string): Promise<void> {
    await this.privileged.from("rating_template_versions").update({ status: "archived" }).eq("id", versionId);
    await this.audit(actorId, "template.archive", "rating_template_version", versionId);
  }

  // -------------------------------------------------------------------------
  // Organizations
  // -------------------------------------------------------------------------
  async listOrganizations(filters: OrganizationFilters): Promise<Paginated<Organization>> {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = filters.pageSize ?? 12;
    let query = this.supabase.from("organizations").select("*", { count: "exact" }).neq("status", "merged");
    if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
    if (filters.division) query = query.eq("division", filters.division);
    if (filters.district) query = query.eq("district", filters.district);
    if (filters.search) {
      const needle = `%${filters.search}%`;
      query = query.or(`official_name.ilike.${needle},bengali_name.ilike.${needle},slug.ilike.${needle}`);
    }
    if (filters.hasScores) {
      const { data: agg } = await this.supabase.from("organization_score_aggregates").select("organization_id").gt("eligible_count", 0);
      const ids = [...new Set(((agg ?? []) as Row[]).map((r) => str(r.organization_id)))];
      query = ids.length ? query.in("id", ids) : query.eq("id", "00000000-0000-0000-0000-000000000000");
    }
    const { data, error, count } = await query
      .order("official_name").range((page - 1) * pageSize, page * pageSize - 1);
    this.must(data, error, "organizations");
    let items = ((data ?? []) as Row[]).map((r) => this.organization(r));
    if (filters.perspectiveRelationshipId) {
      const { data: scoped } = await this.supabase.from("reviews").select("organization_id")
        .eq("relationship_type_id", filters.perspectiveRelationshipId).eq("status", "published");
      const ids = new Set(((scoped ?? []) as Row[]).map((r) => str(r.organization_id)));
      items = items.filter((o) => ids.has(o.id));
    }
    return paginate(items, count ?? items.length, page, pageSize);
  }

  async getOrganizationBySlug(slug: string): Promise<Organization | null> {
    const { data } = await this.supabase.from("organizations").select("*").eq("slug", slug).single();
    if (!data) return null;
    return this.organization(data as Row);
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    const { data } = await this.supabase.from("organizations").select("*").eq("id", id).single();
    if (!data) return null;
    return this.organization(data as Row);
  }

  async listOrganizationsByIds(ids: string[]): Promise<Organization[]> {
    if (!ids.length) return [];
    const { data } = await this.supabase.from("organizations").select("*").in("id", ids);
    return ((data ?? []) as Row[]).map((r) => this.organization(r));
  }

  async createOrganization(input: Omit<Organization, "id" | "createdAt" | "updatedAt">, actorId: string): Promise<Organization> {
    const { data, error } = await this.privileged.from("organizations").insert({
      slug: input.slug, official_name: input.officialName, bengali_name: input.bengaliName,
      alternate_names: input.alternateNames, category_id: input.categoryId, parent_organization_id: input.parentOrganizationId,
      description: input.description, website: input.website, address: input.address, division: input.division,
      district: input.district, city: input.city, status: input.status, google_maps_url: input.googleMapsUrl,
      google_place_id: input.googlePlaceId, verified: input.verified, claim_status: input.claimStatus,
    }).select("*").single();
    const row = this.must(data as Row | null, error, "create organization");
    await this.audit(actorId, "organization.create", "organization", str(row.id), str(row.official_name));
    return this.organization(row);
  }

  async updateOrganization(id: string, patch: Partial<Organization>, actorId: string): Promise<void> {
    const row: Row = {};
    const map: Record<string, string> = {
      slug: "slug", officialName: "official_name", bengaliName: "bengali_name", alternateNames: "alternate_names",
      categoryId: "category_id", description: "description", website: "website", address: "address",
      division: "division", district: "district", city: "city", status: "status",
      googleMapsUrl: "google_maps_url", googlePlaceId: "google_place_id", verified: "verified", claimStatus: "claim_status",
    };
    for (const [k, v] of Object.entries(patch)) {
      const col = map[k];
      if (col) row[col] = v as unknown;
    }
    if (Object.keys(row).length) {
      const { error } = await this.privileged.from("organizations").update(row).eq("id", id);
      if (error) throw new Error(`update organization: ${error.message}`);
    }
    await this.audit(actorId, "organization.update", "organization", id, JSON.stringify(patch));
  }

  async listBranches(organizationId: string): Promise<OrganizationBranch[]> {
    const { data } = await this.supabase.from("organization_branches").select("*").eq("organization_id", organizationId);
    return ((data ?? []) as Row[]).map((r) => this.branch(r));
  }

  // -------------------------------------------------------------------------
  // Reviews
  // -------------------------------------------------------------------------
  async listReviews(filters: ReviewFilters): Promise<Paginated<Review>> {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = filters.pageSize ?? 20;
    const staff = ["pending", "rejected", "flagged", "under_appeal", "withdrawn", "draft"];
    const client = filters.status && staff.includes(filters.status) ? this.privileged : this.supabase;
    let query = client.from("reviews").select("*", { count: "exact" }).order("created_at", { ascending: false });
    if (filters.organizationId) query = query.eq("organization_id", filters.organizationId);
    if (filters.branchId !== undefined) {
      query = filters.branchId === null ? query.is("branch_id", null) : query.eq("branch_id", filters.branchId);
    }
    if (filters.relationshipTypeId) query = query.eq("relationship_type_id", filters.relationshipTypeId);
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.userId) query = query.eq("user_id", filters.userId);
    const { data, error, count } = await query.range((page - 1) * pageSize, page * pageSize - 1);
    this.must(data, error, "reviews");
    return paginate(((data ?? []) as Row[]).map((r) => this.review(r)), count ?? 0, page, pageSize);
  }

  async getReviewById(id: string): Promise<Review | null> {
    const { data } = await this.privileged.from("reviews").select("*").eq("id", id).single();
    if (!data) return null;
    return this.review(data as Row);
  }

  async getAnswersForReviews(reviewIds: string[]): Promise<ReviewAnswer[]> {
    if (!reviewIds.length) return [];
    const { data } = await this.privileged.from("review_answers").select("*").in("review_id", reviewIds);
    return ((data ?? []) as Row[]).map((r) => this.answer(r));
  }

  async createReview(input: CreateReviewInput): Promise<Review> {
    const { data, error } = await this.privileged.from("reviews").insert({
      user_id: input.userId, organization_id: input.organizationId, branch_id: input.branchId,
      category_id: input.categoryId, relationship_type_id: input.relationshipTypeId,
      template_version_id: input.templateVersionId, status: "pending", title: input.title, body: input.body,
      employment_stage: input.employmentStage, experience_period: input.experiencePeriod,
      display_name: input.displayName, language: input.language, score: null,
    }).select("*").single();
    const row = this.must(data as Row | null, error, "create review");
    const reviewId = str(row.id);
    await this.privileged.from("review_answers").insert(
      input.answers.map((a) => ({
        review_id: reviewId, parameter_id: a.parameterId,
        value: a.value === "not_observed" ? "not_observed" : String(a.value),
      })),
    );
    await this.privileged.from("review_score_snapshots").insert({
      review_id: reviewId, template_version_id: input.templateVersionId, score: input.score,
      answered_parameters: input.answeredParameters, weight_coverage: input.weightCoverage, eligible: input.eligible,
    });
    return this.review(row);
  }

  async updateReviewStatus(reviewId: string, status: ReviewStatus, actorId: string, reason?: string | null): Promise<void> {
    const previous = await this.getReviewById(reviewId);
    if (!previous) return;
    const patch: Row = { status, updated_at: new Date().toISOString(), moderation_reason: reason ?? null };
    if (status === "published") {
      patch.published_at = new Date().toISOString();
      const { data: snap } = await this.privileged.from("review_score_snapshots").select("score").eq("review_id", reviewId).single();
      patch.score = snap ? (snap as Row).score : null;
    } else {
      patch.score = null;
    }
    const { error } = await this.privileged.from("reviews").update(patch).eq("id", reviewId);
    if (error) throw new Error(`moderate: ${error.message}`);
    await this.privileged.from("moderation_actions").insert({
      review_id: reviewId, actor_user_id: actorId,
      action: status === "published" ? "approve" : status === "rejected" ? "reject" : status === "pending" ? "return" : status === "withdrawn" ? "withdraw" : "hide",
      reason: reason ?? null,
    });
    await this.audit(actorId, `review.${status}`, "review", reviewId, `from ${previous.status}`);
    await this.recomputeAggregates(previous.organizationId);
  }

  async withdrawReview(reviewId: string, userId: string): Promise<void> {
    const { data } = await this.privileged.from("reviews").select("*").eq("id", reviewId).eq("user_id", userId).single();
    if (!data) return;
    const r = data as Row;
    await this.privileged.from("reviews").update({ status: "withdrawn", score: null }).eq("id", reviewId);
    await this.recomputeAggregates(str(r.organization_id));
  }

  // -------------------------------------------------------------------------
  // Aggregates
  // -------------------------------------------------------------------------
  async getAggregates(organizationId: string, branchId?: string | null): Promise<OrganizationScoreAggregate[]> {
    let query = this.supabase.from("organization_score_aggregates").select("*").eq("organization_id", organizationId);
    if (branchId !== undefined) {
      query = branchId === null ? query.is("branch_id", null) : query.eq("branch_id", branchId);
    }
    const { data } = await query;
    return ((data ?? []) as Row[]).map((r) => this.aggregate(r));
  }

  async getScoreCards(organizationIds: string[]): Promise<OrgScoreCard[]> {
    if (!organizationIds.length) return [];
    const { data } = await this.supabase.from("organization_score_aggregates").select("*").in("organization_id", organizationIds);
    return ((data ?? []) as Row[]).map((r) => {
      const agg = this.aggregate(r);
      return {
        organizationId: agg.organizationId, branchId: agg.branchId, relationshipTypeId: agg.relationshipTypeId,
        categoryId: agg.categoryId, templateVersionId: agg.templateVersionId,
        score: agg.averageScore, eligibleCount: agg.eligibleCount,
        sufficiency: sufficiency(agg.eligibleCount, scoreThresholds),
      } as OrgScoreCard;
    });
  }

  async recomputeAggregates(organizationId: string): Promise<OrganizationScoreAggregate[]> {
    const { data: reviews } = await this.privileged.from("reviews").select("*")
      .eq("organization_id", organizationId).eq("status", "published").not("score", "is", null);
    const published = ((reviews ?? []) as Row[]).map((r) => this.review(r));
    const buckets = new Map<string, Review[]>();
    for (const r of published) {
      const key = [r.branchId ?? "", r.categoryId, r.relationshipTypeId, r.templateVersionId].join("::");
      const arr = buckets.get(key) ?? [];
      arr.push(r);
      buckets.set(key, arr);
    }
    await this.privileged.from("organization_score_aggregates").delete().eq("organization_id", organizationId);
    const rows: Row[] = [];
    for (const [key, group] of buckets) {
      const [branchId, categoryId, relationshipTypeId, templateVersionId] = key.split("::");
      const { data: ans } = await this.privileged.from("review_answers").select("*")
        .in("review_id", group.map((r) => r.id));
      const inputs = group.map((r) => ({
        score: r.score as number,
        answers: (((ans ?? []) as Row[]).filter((a) => str(a.review_id) === r.id))
          .map((a) => ({ parameterId: str(a.parameter_id), value: toRatingValue(a.value) })),
        relationshipTypeId: r.relationshipTypeId,
        templateVersionId: r.templateVersionId,
      }));
      const agg = aggregateReviews(inputs);
      const parameterScores: Record<string, number> = {};
      for (const p of agg.parameterAverages) parameterScores[p.parameterId] = p.average;
      rows.push({
        organization_id: organizationId, branch_id: branchId || null, category_id: categoryId,
        relationship_type_id: relationshipTypeId, template_version_id: templateVersionId,
        eligible_count: agg.eligibleCount, average_score: agg.averageScore,
        parameter_scores: parameterScores, distribution: agg.distribution, computed_at: new Date().toISOString(),
      });
    }
    if (rows.length) {
      await this.privileged.from("organization_score_aggregates").insert(rows);
    }
    return this.getAggregates(organizationId);
  }

  // -------------------------------------------------------------------------
  // Moderation extras
  // -------------------------------------------------------------------------
  async listModerationActions(reviewId: string): Promise<ModerationAction[]> {
    const { data } = await this.privileged.from("moderation_actions").select("*").eq("review_id", reviewId).order("created_at", { ascending: false });
    return ((data ?? []) as Row[]).map((r) => ({
      id: str(r.id), reviewId: str(r.review_id), actorUserId: str(r.actor_user_id),
      action: (str(r.action) as ModerationAction["action"]) ?? "hide",
      reason: nullable<string>(r.reason), createdAt: iso(r.created_at),
    }));
  }

  async createReport(input: { reviewId: string; reporterUserId: string; reason: string; details: string | null }): Promise<ReviewReport> {
    const { data, error } = await this.privileged.from("review_reports")
      .insert({ review_id: input.reviewId, reporter_user_id: input.reporterUserId, reason: input.reason, details: input.details, status: "open" })
      .select("*").single();
    const row = this.must(data as Row | null, error, "report");
    return { id: str(row.id), reviewId: str(row.review_id), reporterUserId: str(row.reporter_user_id), reason: str(row.reason), details: nullable<string>(row.details), status: "open", createdAt: iso(row.created_at) };
  }

  async listReports(): Promise<ReviewReport[]> {
    const { data } = await this.privileged.from("review_reports").select("*").order("created_at", { ascending: false });
    return ((data ?? []) as Row[]).map((r) => ({
      id: str(r.id), reviewId: str(r.review_id), reporterUserId: str(r.reporter_user_id), reason: str(r.reason),
      details: nullable<string>(r.details), status: (str(r.status) as ReviewReport["status"]) ?? "open", createdAt: iso(r.created_at),
    }));
  }

  async setReportStatus(id: string, status: "open" | "resolved" | "dismissed", actorId: string): Promise<void> {
    await this.privileged.from("review_reports").update({ status }).eq("id", id);
    await this.audit(actorId, `report.${status}`, "review_report", id);
  }

  async createAppeal(input: { reviewId: string; userId: string; message: string }): Promise<ReviewAppeal> {
    const { data, error } = await this.privileged.from("review_appeals")
      .insert({ review_id: input.reviewId, user_id: input.userId, message: input.message, status: "open" })
      .select("*").single();
    const row = this.must(data as Row | null, error, "appeal");
    const review = await this.getReviewById(input.reviewId);
    if (review && review.status === "rejected") {
      await this.privileged.from("reviews").update({ status: "under_appeal" }).eq("id", input.reviewId);
    }
    return { id: str(row.id), reviewId: str(row.review_id), userId: str(row.user_id), message: str(row.message), status: "open", createdAt: iso(row.created_at) };
  }

  async listAppeals(): Promise<ReviewAppeal[]> {
    const { data } = await this.privileged.from("review_appeals").select("*").order("created_at", { ascending: false });
    return ((data ?? []) as Row[]).map((r) => ({
      id: str(r.id), reviewId: str(r.review_id), userId: str(r.user_id), message: str(r.message),
      status: (str(r.status) as ReviewAppeal["status"]) ?? "open", createdAt: iso(r.created_at),
    }));
  }

  async setAppealStatus(id: string, status: "open" | "accepted" | "rejected", actorId: string): Promise<void> {
    await this.privileged.from("review_appeals").update({ status }).eq("id", id);
    if (status === "accepted") {
      const { data } = await this.privileged.from("review_appeals").select("review_id").eq("id", id).single();
      const reviewId = data ? str((data as Row).review_id) : null;
      if (reviewId) {
        const { data: snap } = await this.privileged.from("review_score_snapshots").select("score, review_id").eq("review_id", reviewId).single();
        const snapRow = snap as Row | null;
        await this.privileged.from("reviews").update({
          status: "published", published_at: new Date().toISOString(), score: snapRow ? snapRow.score : null,
        }).eq("id", reviewId);
        const review = await this.getReviewById(reviewId);
        if (review) await this.recomputeAggregates(review.organizationId);
      }
    }
    await this.audit(actorId, `appeal.${status}`, "review_appeal", id);
  }

  // -------------------------------------------------------------------------
  // Claims & responses
  // -------------------------------------------------------------------------
  async createClaim(input: Omit<OrganizationClaim, "id" | "createdAt" | "status">): Promise<OrganizationClaim> {
    const { data, error } = await this.privileged.from("organization_claims").insert({
      organization_id: input.organizationId, requester_user_id: input.requesterUserId,
      representative_name: input.representativeName, position: input.position, evidence: input.evidence, status: "pending",
    }).select("*").single();
    const row = this.must(data as Row | null, error, "claim");
    return { id: str(row.id), organizationId: str(row.organization_id), requesterUserId: str(row.requester_user_id), representativeName: str(row.representative_name), position: str(row.position), evidence: str(row.evidence), status: "pending", createdAt: iso(row.created_at) };
  }

  async listClaims(): Promise<OrganizationClaim[]> {
    const { data } = await this.privileged.from("organization_claims").select("*").order("created_at", { ascending: false });
    return ((data ?? []) as Row[]).map((r) => ({
      id: str(r.id), organizationId: str(r.organization_id), requesterUserId: str(r.requester_user_id),
      representativeName: str(r.representative_name), position: str(r.position), evidence: str(r.evidence),
      status: (str(r.status) as OrganizationClaim["status"]) ?? "pending", createdAt: iso(r.created_at),
    }));
  }

  async setClaimStatus(id: string, status: "pending" | "approved" | "rejected", actorId: string): Promise<void> {
    await this.privileged.from("organization_claims").update({ status }).eq("id", id);
    if (status === "approved") {
      const { data } = await this.privileged.from("organization_claims").select("*").eq("id", id).single();
      const claim = data as Row | null;
      if (claim) {
        await this.privileged.from("organizations").update({ claim_status: "claimed" }).eq("id", str(claim.organization_id));
        await this.privileged.from("organization_representatives").upsert(
          { organization_id: str(claim.organization_id), user_id: str(claim.requester_user_id), position: str(claim.position) },
          { onConflict: "organization_id,user_id" },
        );
      }
    }
    await this.audit(actorId, `claim.${status}`, "organization_claim", id);
  }

  async listRepresentatives(organizationId: string): Promise<OrganizationRepresentative[]> {
    const { data } = await this.privileged.from("organization_representatives").select("*").eq("organization_id", organizationId);
    return ((data ?? []) as Row[]).map((r) => ({
      id: str(r.id), organizationId: str(r.organization_id), userId: str(r.user_id), position: str(r.position), createdAt: iso(r.created_at),
    }));
  }

  async isRepresentative(organizationId: string, userId: string): Promise<boolean> {
    const { data } = await this.privileged.from("organization_representatives").select("id")
      .eq("organization_id", organizationId).eq("user_id", userId).limit(1);
    return !!((data as Row[] | null)?.length);
  }

  async createResponse(input: { reviewId: string; organizationId: string; representativeUserId: string; body: string }): Promise<OrganizationResponse> {
    const { data, error } = await this.privileged.from("organization_responses").insert({
      review_id: input.reviewId, organization_id: input.organizationId,
      representative_user_id: input.representativeUserId, body: input.body, status: "pending",
    }).select("*").single();
    const row = this.must(data as Row | null, error, "response");
    return { id: str(row.id), reviewId: str(row.review_id), organizationId: str(row.organization_id), representativeUserId: str(row.representative_user_id), body: str(row.body), status: "pending", createdAt: iso(row.created_at) };
  }

  async listResponses(organizationId: string): Promise<OrganizationResponse[]> {
    const { data } = await this.privileged.from("organization_responses").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false });
    return ((data ?? []) as Row[]).map((r) => this.response(r));
  }

  async listResponsesForReviews(reviewIds: string[]): Promise<OrganizationResponse[]> {
    if (!reviewIds.length) return [];
    const { data } = await this.supabase.from("organization_responses").select("*").in("review_id", reviewIds).eq("status", "published");
    return ((data ?? []) as Row[]).map((r) => this.response(r));
  }

  async setResponseStatus(id: string, status: "pending" | "published" | "rejected", actorId: string): Promise<void> {
    await this.privileged.from("organization_responses").update({ status }).eq("id", id);
    await this.audit(actorId, `response.${status}`, "organization_response", id);
  }

  private response(r: Row): OrganizationResponse {
    return {
      id: str(r.id), reviewId: str(r.review_id), organizationId: str(r.organization_id),
      representativeUserId: str(r.representative_user_id), body: str(r.body),
      status: (str(r.status) as OrganizationResponse["status"]) ?? "pending", createdAt: iso(r.created_at),
    };
  }

  // -------------------------------------------------------------------------
  // Audit
  // -------------------------------------------------------------------------
  async listAuditLogs(limit = 100): Promise<AuditLog[]> {
    const { data } = await this.privileged.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(limit);
    return ((data ?? []) as Row[]).map((r) => ({
      id: str(r.id), actorUserId: nullable<string>(r.actor_user_id) ?? "", action: str(r.action),
      entityType: str(r.entity_type), entityId: str(r.entity_id), detail: nullable<string>(r.detail), createdAt: iso(r.created_at),
    }));
  }
}
