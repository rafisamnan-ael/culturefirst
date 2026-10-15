import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import { FixtureStore } from "@/lib/data/stores/fixture-store";

const SCHOOL_RELATIONSHIPS = [
  "student",
  "former-student",
  "parent-guardian",
  "current-employee",
  "former-employee",
];

describe("school questionnaire availability", () => {
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

  it("publishes a template bundle for every school perspective", async () => {
    const cat = await store.getCategoryBySlug("school");
    expect(cat).not.toBeNull();
    const rels = await store.listRelationshipsForCategory(cat!.id);
    const bySlug = new Map(rels.map((r) => [r.slug, r]));

    for (const slug of SCHOOL_RELATIONSHIPS) {
      const rel = bySlug.get(slug);
      expect(rel, `school relationship ${slug} should exist`).toBeTruthy();
      const bundle = await store.getTemplateBundle(cat!.id, rel!.id);
      expect(bundle, `school/${slug} should have a published questionnaire`).not.toBeNull();
      expect(bundle!.parameters.length).toBeGreaterThan(0);
      expect(bundle!.version.status).toBe("published");
    }
  });

  it("lets every school organization accept reviews", async () => {
    const result = await store.listOrganizations({ pageSize: 5000 });
    const schools = [];
    for (const org of result.items) {
      const cat = await store.getCategoryById(org.categoryId);
      if (cat?.slug === "school") schools.push(org);
    }
    expect(schools.length).toBeGreaterThan(0);

    for (const org of schools) {
      const rels = await store.listRelationshipsForCategory(org.categoryId);
      const bundles = await Promise.all(rels.map((rel) => store.getTemplateBundle(org.categoryId, rel.id)));
      expect(
        bundles.some((b) => b !== null),
        `school ${org.slug} should expose at least one questionnaire`,
      ).toBe(true);
    }
  });
});
