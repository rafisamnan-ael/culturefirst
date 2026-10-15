import { Card, CardContent } from "@/components/ui/card";
import { getStore } from "@/lib/data";
import { getServerT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { t, locale } = await getServerT();
  const store = await getStore();

  const orgs = await store.listOrganizations({ pageSize: 1 });
  const published = await store.listReviews({ status: "published", pageSize: 1 });
  const pending = await store.listReviews({ status: "pending", pageSize: 1 });
  const reports = await store.listReports();
  const audits = await store.listAuditLogs(10);

  const stats = [
    { label: t("admin.totalOrgs"), value: orgs.total },
    { label: t("admin.totalReviews"), value: published.total },
    { label: t("admin.pending"), value: pending.total },
    { label: t("admin.flagged"), value: reports.filter((r) => r.status === "open").length },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-charcoal">{t("admin.dashboard")}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="hover-lift border-border/60 shadow-soft">
            <CardContent className="p-5">
              <p className="bg-gradient-to-br from-navy via-navy-accent to-jade bg-clip-text text-3xl font-bold tabular-nums text-transparent">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-charcoal">{t("admin.audit")}</h2>
        <Card className="border-border/60 shadow-soft">
          <CardContent className="divide-y divide-border p-0">
            {audits.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              audits.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-charcoal">{a.action}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {a.entityType} · {a.entityId}
                      {a.detail ? ` · ${a.detail}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(a.createdAt, locale)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
