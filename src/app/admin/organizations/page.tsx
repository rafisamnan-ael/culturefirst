import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getStore } from "@/lib/data";
import { getServerT } from "@/lib/i18n/server";
import { CreateOrganizationForm, EditOrganizationDialog } from "@/components/admin/organization-forms";

export const dynamic = "force-dynamic";

export default async function AdminOrganizationsPage() {
  const { t, locale } = await getServerT();
  const store = await getStore();
  const categories = await store.listCategories();
  const orgs = await store.listOrganizations({ pageSize: 200 });
  const catById = new Map(categories.map((c) => [c.id, c]));

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-charcoal">
          {t("admin.organizations")} ({orgs.total})
        </h1>
        <CreateOrganizationForm categories={categories} />
      </div>

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {orgs.items.map((o) => (
            <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-medium text-charcoal">{o.officialName}</p>
                <p className="text-xs text-muted-foreground">
                  {catById.get(o.categoryId)?.name[locale] ?? ""} · {o.city ?? "—"} · /{o.slug}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={o.status === "active" ? "jade" : "outline"}>{o.status}</Badge>
                <EditOrganizationDialog organization={o} categories={categories} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
