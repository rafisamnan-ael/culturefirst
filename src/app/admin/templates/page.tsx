import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TemplateEditor } from "@/components/admin/template-editor";
import { getStore } from "@/lib/data";
import { getServerT } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/pick";

export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage() {
  const { t, locale } = await getServerT();
  const store = await getStore();
  const categories = await store.listCategories();
  const relationships = await store.listRelationships();
  const templates = await store.listTemplates();
  const catById = new Map(categories.map((c) => [c.id, c]));

  const entries = await Promise.all(
    templates.map(async (tpl) => {
      const versions = await store.listTemplateVersions(tpl.id);
      const draft = versions.find((v) => v.status === "draft");
      const activeVersion = draft ?? versions.find((v) => v.status === "published");
      const bundle = activeVersion ? await store.getBundleByVersionId(activeVersion.id) : null;
      return { tpl, versions, activeVersion, bundle };
    }),
  );

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-charcoal">{t("admin.templates")}</h1>
        <TemplateEditor
          mode="create"
          initialName={{ en: "New template", bn: "নতুন টেমপ্লেট" }}
          initialRelationshipIds={[]}
          initialParameters={[]}
          categories={categories}
          relationships={relationships}
        />
      </div>

      <div className="space-y-4">
        {entries.map(({ tpl, versions, activeVersion, bundle }) => {
          const total = (bundle?.parameters ?? []).reduce((sum, p) => sum + p.weight, 0);
          return (
            <Card key={tpl.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-charcoal">{pick(tpl.name, locale)}</p>
                    <p className="text-xs text-muted-foreground">
                      {catById.get(tpl.categoryId)?.name[locale] ?? ""} · {tpl.relationshipTypeIds.length} relationships ·{" "}
                      {tpl.relationshipTypeIds
                        .map((id) => relationships.find((r) => r.id === id)?.name[locale])
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">v{activeVersion?.version ?? "—"} {activeVersion?.status ?? ""}</Badge>
                    <Badge variant={total === 100 ? "jade" : "destructive"}>{total.toFixed(0)}%</Badge>
                  </div>
                </div>
                {bundle && (
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {bundle.parameters.map((p) => (
                      <li key={p.id} className="flex justify-between gap-2">
                        <span>{pick(p.name, locale)}</span>
                        <span className="tabular-nums">{p.weight}%</span>
                      </li>
                    ))}
                  </ul>
                )}
                <TemplateEditor
                  mode="edit"
                  templateId={tpl.id}
                  initialName={tpl.name}
                  initialRelationshipIds={tpl.relationshipTypeIds}
                  initialParameters={(bundle?.parameters ?? []).map((p) => ({
                    key: p.key,
                    name: p.name,
                    weight: p.weight,
                    questions: p.questions.map((q) => ({ text: q.text, required: q.required })),
                  }))}
                  categoryId={tpl.categoryId}
                  categories={categories}
                  relationships={relationships}
                  versions={versions}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
