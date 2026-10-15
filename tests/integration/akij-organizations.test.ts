import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import { FixtureStore } from "@/lib/data/stores/fixture-store";
import { dedupeOrganizationSeeds, normalizeOrgKey } from "@/lib/data/fixtures/seed";

const AKIJ_SLUGS = [
  "akij-group",
  "akij-venture-ltd",
  "akij-resource-ltd",
  "akijbashir-group",
  "akij-insaf-group",
  "akij-assets-ltd",
];

const VERIFIED_GOOGLE_SLUGS = [
  "akij-group",
  "akij-venture-ltd",
  "akij-resource-ltd",
  "akijbashir-group",
];

const SEARCH_ONLY_SLUGS = ["akij-insaf-group", "akij-assets-ltd"];

describe("Akij organizations", () => {
  let store: FixtureStore;
  const DATA_DIR = path.join(process.cwd(), ".data");
  const STORE_FILE = path.join(DATA_DIR, "store.json");

  beforeEach(async () => {
    try {
      await fs.unlink(STORE_FILE);
    } catch {
      /* no persisted store */
    }
    store = await FixtureStore.open();
  });

  afterEach(async () => {
    try {
      await fs.unlink(STORE_FILE);
    } catch {
      /* nothing to clean */
    }
  });

  it("exposes all six Akij organizations at their canonical slugs", async () => {
    for (const slug of AKIJ_SLUGS) {
      const org = await store.getOrganizationBySlug(slug);
      expect(org, `expected ${slug} to exist`).not.toBeNull();
      expect(org!.categoryId).toBe("cat-private-company");
    }
  });

  it("labels verified Google review profiles and search-only listings correctly", async () => {
    for (const slug of VERIFIED_GOOGLE_SLUGS) {
      const org = await store.getOrganizationBySlug(slug);
      expect(org!.googlePlaceId, `${slug} should have a verified place id`).toBeTruthy();
      expect(org!.googleMapsUrl).toContain("query_place_id=");
    }
    for (const slug of SEARCH_ONLY_SLUGS) {
      const org = await store.getOrganizationBySlug(slug);
      expect(org!.googlePlaceId, `${slug} must not be treated as verified`).toBeNull();
      expect(org!.googleMapsUrl).toContain("/maps/search");
    }
  });

  it("does not invent a website or Google rating for unverified groups", async () => {
    const assets = await store.getOrganizationBySlug("akij-assets-ltd");
    expect(assets!.website).toBeNull();
    // Google ratings are never stored on the organization record.
    expect(assets).not.toHaveProperty("googleRating");
  });

  it("returns every Akij group from directory search", async () => {
    const result = await store.listOrganizations({ search: "akij", pageSize: 50 });
    const slugs = result.items.map((o) => o.slug);
    for (const slug of AKIJ_SLUGS) {
      expect(slugs, `search should surface ${slug}`).toContain(slug);
    }
  });

  it("keeps the Akij groups as independent profiles (no merging or parenting)", async () => {
    for (const slug of AKIJ_SLUGS) {
      const org = await store.getOrganizationBySlug(slug);
      expect(org!.parentOrganizationId).toBeNull();
      expect(org!.status).toBe("active");
    }
  });

  it("offers an independent review questionnaire for each Akij group", async () => {
    const cat = await store.getCategoryBySlug("private-company");
    const rels = await store.listRelationshipsForCategory(cat!.id);
    const rel = rels.find((r) => r.slug === "current-employee");
    expect(rel).toBeTruthy();
    const bundle = await store.getTemplateBundle(cat!.id, rel!.id);
    expect(bundle).not.toBeNull();
    expect(bundle!.parameters.length).toBeGreaterThan(0);
  });

  it("has no duplicate organization slugs or normalized names", async () => {
    const all = await store.listOrganizations({ pageSize: 5000 });
    const slugSet = new Set<string>();
    const nameSet = new Set<string>();
    for (const org of all.items) {
      expect(slugSet.has(org.slug), `duplicate slug ${org.slug}`).toBe(false);
      slugSet.add(org.slug);
      const key = normalizeOrgKey(org.officialName);
      expect(nameSet.has(key), `duplicate name ${org.officialName}`).toBe(false);
      nameSet.add(key);
    }
  });
});

describe("dedupeOrganizationSeeds", () => {
  it("drops seeds that collide on slug, name, or alias", () => {
    const seeds = [
      { slug: "akij-group", en: "Akij Group" },
      { slug: "akij-group", en: "Akij Group Duplicate Slug" },
      { slug: "akij-venture-ltd", en: "Akij Venture Ltd.", aliases: ["akij-venture"] },
      { slug: "akij-venture", en: "Akij Venture Alias Collision" },
    ];
    const unique = dedupeOrganizationSeeds(seeds);
    expect(unique.map((s) => s.slug)).toEqual(["akij-group", "akij-venture-ltd"]);
  });

  it("normalizes punctuation and casing", () => {
    expect(normalizeOrgKey("Akij-Bashir Group")).toBe("akijbashirgroup");
    expect(normalizeOrgKey("AkijBashir Group")).toBe("akijbashirgroup");
  });
});
