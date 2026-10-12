import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStore } from "@/lib/data";
import { getServerT } from "@/lib/i18n/server";
import { CreateCategoryForm, CategoryEditor, CreateRelationshipForm } from "@/components/admin/category-forms";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const { t, locale } = await getServerT();
  const store = await getStore();
  const categories = await store.listCategories();
  const relationships = await store.listRelationships();

  const selections = new Map<string, string[]>();
  for (const c of categories) {
    const rels = await store.listRelationshipsForCategory(c.id);
    selections.set(c.id, rels.map((r) => r.id));
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-charcoal">{t("admin.categories")}</h1>
          <CreateCategoryForm />
        </div>
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {categories.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-charcoal">{c.name[locale]}</p>
                  <p className="text-xs text-muted-foreground">
                    /{c.slug} {c.isFallback ? "· fallback" : ""} · {(selections.get(c.id) ?? []).length} relationships
                  </p>
                </div>
                <CategoryEditor
                  category={c}
                  allRelationships={relationships}
                  selectedRelationshipIds={selections.get(c.id) ?? []}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-charcoal">Reviewer relationships</h2>
          <CreateRelationshipForm />
        </div>
        <div className="flex flex-wrap gap-2">
          {relationships.map((r) => (
            <Badge key={r.id} variant="outline">
              {r.name[locale]} · {r.kind}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  );
}
