import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStore } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { SuggestionActions } from "@/components/admin/suggestion-actions";

export const metadata: Metadata = { title: "Organization suggestions" };
export const dynamic = "force-dynamic";

export default async function AdminSuggestionsPage() {
  const store = await getStore();
  const [suggestions, categories] = await Promise.all([
    store.listSuggestions(),
    store.listCategories().catch(() => []),
  ]);
  const catById = new Map(categories.map((c) => [c.id, c]));
  const pending = suggestions.filter((s) => s.status === "pending");
  const recent = suggestions.filter((s) => s.status !== "pending").slice(0, 20);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Organization suggestions</h1>
      <p className="text-sm text-muted-foreground">Manual additions require admin approval before becoming public listings.</p>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Pending ({pending.length})</h2>
        {pending.length === 0 ? (
          <Card><CardContent className="p-6 text-sm text-muted-foreground">No pending suggestions.</CardContent></Card>
        ) : (
          pending.map((s) => {
            const cat = catById.get(s.categoryId);
            return (
              <Card key={s.id}>
                <CardContent className="space-y-3 p-4 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{s.suggestedName}</span>
                    {s.suggestedBengaliName ? <span className="text-xs text-muted-foreground">({s.suggestedBengaliName})</span> : null}
                    {cat ? <Badge>{cat.name.en}</Badge> : <Badge>{s.categoryId}</Badge>}
                    <span className="text-xs text-muted-foreground">{formatDate(s.createdAt)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {[s.division, s.district, s.city].filter(Boolean).join(", ") || "—"}
                    {s.website ? <> · <a className="text-jade underline" href={s.website} target="_blank" rel="noreferrer">{s.website}</a></> : null}
                  </div>
                  {s.address ? <p className="text-sm">{s.address}</p> : null}
                  {s.reason ? <p className="rounded bg-warmgray/40 p-2 text-xs">{s.reason}</p> : null}
                  <SuggestionActions id={s.id} />
                </CardContent>
              </Card>
            );
          })
        )}
      </section>

      {recent.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Reviewed</h2>
          {recent.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-center gap-2 p-3 text-xs">
                <span className="font-medium">{s.suggestedName}</span>
                <Badge>{s.status}</Badge>
                <span className="text-muted-foreground">{formatDate(s.createdAt)}</span>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}
    </div>
  );
}
