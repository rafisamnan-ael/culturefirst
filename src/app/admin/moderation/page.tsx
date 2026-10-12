import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getStore } from "@/lib/data";
import { getServerT } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/pick";
import { formatDate } from "@/lib/utils";
import { ModerationButtons, ReportActions, AppealActions } from "@/components/admin/moderation-actions";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const { t, locale } = await getServerT();
  const store = await getStore();

  const pending = await store.listReviews({ status: "pending", pageSize: 50 });
  const reports = await store.listReports();
  const appeals = await store.listAppeals();
  const relationships = await store.listRelationships();
  const relById = new Map(relationships.map((r) => [r.id, r]));
  const orgs = await store.listOrganizationsByIds([
    ...new Set([...pending.items.map((r) => r.organizationId), ...reports.map((r) => r.reviewId)]),
  ]);
  const orgById = new Map(orgs.map((o) => [o.id, o]));
  const reportedReviews = await Promise.all(reports.map((r) => store.getReviewById(r.reviewId)));

  return (
    <div className="space-y-10">
      <section>
        <h1 className="mb-4 text-2xl font-semibold tracking-tight text-charcoal">
          {t("admin.pending")} ({pending.total})
        </h1>
        {pending.items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-white p-8 text-center text-sm text-muted-foreground">
            The pending queue is empty.
          </p>
        ) : (
          <div className="space-y-4">
            {pending.items.map((r) => {
              const org = orgById.get(r.organizationId);
              return (
                <Card key={r.id}>
                  <CardContent className="space-y-3 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-charcoal">{org?.officialName ?? r.organizationId}</p>
                        <p className="text-xs text-muted-foreground">
                          {pick(relById.get(r.relationshipTypeId)?.name, locale)} · {formatDate(r.createdAt, locale)}
                        </p>
                      </div>
                      <Badge variant="gold">{t("status.pending")}</Badge>
                    </div>
                    {r.title && <p className="text-sm font-medium text-charcoal">{r.title}</p>}
                    <p className="whitespace-pre-line text-sm text-charcoal/90">{r.body}</p>
                    <ModerationButtons reviewId={r.id} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-charcoal">{t("admin.flagged")} ({reports.length})</h2>
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reports.</p>
        ) : (
          <div className="space-y-3">
            {reports.map((rep, i) => (
              <Card key={rep.id}>
                <CardContent className="space-y-2 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant={rep.status === "open" ? "destructive" : "outline"}>{rep.status}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(rep.createdAt, locale)}</span>
                  </div>
                  <p className="text-sm text-charcoal">
                    <span className="font-medium">{rep.reason}</span>
                    {rep.details ? ` — ${rep.details}` : ""}
                  </p>
                  {reportedReviews[i] && (
                    <p className="line-clamp-2 rounded bg-warmgray p-2 text-xs text-muted-foreground">
                      {reportedReviews[i]!.body}
                    </p>
                  )}
                  <ReportActions id={rep.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-charcoal">{locale === "bn" ? "আপিল" : "Appeals"} ({appeals.length})</h2>
        {appeals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No appeals.</p>
        ) : (
          <div className="space-y-3">
            {appeals.map((a) => (
              <Card key={a.id}>
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={a.status === "open" ? "gold" : "outline"}>{a.status}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(a.createdAt, locale)}</span>
                  </div>
                  <p className="text-sm text-charcoal/90">{a.message}</p>
                  {a.status === "open" && <AppealActions id={a.id} />}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
