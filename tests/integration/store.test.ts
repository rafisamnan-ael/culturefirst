import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import { FixtureStore } from "@/lib/data/stores/fixture-store";

describe("fixture store integration", () => {
  let store: FixtureStore;
  const DATA_DIR = path.join(process.cwd(), ".data");
  const STORE_FILE = path.join(DATA_DIR, "store.json");

  beforeEach(async () => {
    // Clean up persisted store to ensure test isolation
    try {
      await fs.unlink(STORE_FILE);
    } catch {
      // File doesn't exist, that's fine
    }
    store = await FixtureStore.open();
  });

  afterEach(async () => {
    // Clean up after test
    try {
      await fs.unlink(STORE_FILE);
    } catch {
      // File doesn't exist, that's fine
    }
  });

  it("loads categories and relationships", async () => {
    const cats = await store.listCategories();
    expect(cats.length).toBeGreaterThan(0);
    const rels = await store.listRelationships();
    expect(rels.length).toBe(14);
  });

  it("finds hospital category", async () => {
    const cat = await store.getCategoryBySlug("hospital-clinic");
    expect(cat).not.toBeNull();
    expect(cat?.slug).toBe("hospital-clinic");
  });

  it("gets template bundle for hospital patient", async () => {
    const cat = await store.getCategoryBySlug("hospital-clinic");
    const rels = await store.listRelationshipsForCategory(cat!.id);
    const patient = rels.find((r) => r.slug === "patient");
    expect(patient).toBeTruthy();
    const bundle = await store.getTemplateBundle(cat!.id, patient!.id);
    expect(bundle).not.toBeNull();
    expect(bundle!.parameters.length).toBe(7);
    expect(bundle!.parameters.every((p) => p.weight > 0)).toBe(true);
  });

  it("organization search finds sample", async () => {
    const result = await store.listOrganizations({ search: "nexus", pageSize: 10 });
    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result.items.some((o) => o.slug.includes("nexus"))).toBe(true);
  });

  it("score cards returned for orgs", async () => {
    const orgs = await store.listOrganizations({ pageSize: 5 });
    const cards = await store.getScoreCards(orgs.items.map((o) => o.id));
    expect(cards.length).toBeGreaterThan(0);
  });

  it("review creation + moderation flow", async () => {
    // Use seed org for setup, but query with specific filtering
    const seedOrgs = await store.listOrganizations({ pageSize: 1 });
    const seedOrg = seedOrgs.items[0];
    const cat = await store.getCategoryById(seedOrg.categoryId);
    const rels = await store.listRelationshipsForCategory(cat!.id);
    const rel = rels[0];
    const bundle = await store.getTemplateBundle(cat!.id, rel.id);
    expect(bundle).toBeTruthy();

    // Create a new test organization to avoid seed data interference
    const testOrg = await store.createOrganization(
      {
        name: "Test Org for Review Flow",
        slug: `test-org-${Date.now()}`,
        categoryId: cat!.id,
        country: "Bangladesh",
        state: "verified",
        websiteUrl: null,
        registrationNumber: null,
        description: null,
      },
      "u-test-admin",
    );

    const answers = bundle!.parameters.map((p) => ({ parameterId: p.id, value: 4 as const }));
    const review = await store.createReview({
      userId: "u-reviewer",
      organizationId: testOrg.id,
      branchId: null,
      categoryId: cat!.id,
      relationshipTypeId: rel.id,
      templateVersionId: bundle!.version.id,
      title: null,
      body: "Integration test review with sufficient content for scoring.",
      employmentStage: null,
      experiencePeriod: "2024",
      displayName: "Test User",
      language: "en",
      answers,
      score: 4,
      eligible: true,
      answeredParameters: bundle!.parameters.length,
      weightCoverage: 1,
    });

    // Pending review should not appear in public
    const published = await store.listReviews({ organizationId: testOrg.id, status: "published", pageSize: 10 });
    expect(published.items.length).toBe(0);

    // Approve
    await store.updateReviewStatus(review.id, "published", "u-admin");
    const after = await store.listReviews({ organizationId: testOrg.id, status: "published", pageSize: 10 });
    expect(after.items.length).toBe(1);
    expect(after.items[0].score).toBe(4);

    // Aggregates updated
    const agg = await store.getAggregates(testOrg.id, null);
    expect(agg.length).toBe(1);
    expect(agg[0].eligibleCount).toBe(1);
    expect(agg[0].averageScore).toBe(4);
  });
});