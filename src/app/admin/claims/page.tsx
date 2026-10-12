import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ClaimActions } from "@/components/admin/moderation-actions";
import { getStore } from "@/lib/data";
import { getServerT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClaimsPage() {
  const { t, locale } = await getServerT();
  const store = await getStore();
  const claims = await store.listClaims();
  const orgs = await store.listOrganizationsByIds([...new Set(claims.map((c) => c.organizationId))]);
  const orgById = new Map(orgs.map((o) => [o.id, o]));

  return (
    <div>
      <h1 className="mb-5 text-2xl font-semibold tracking-tight text-charcoal">{t("admin.claims")}</h1>
      {claims.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-white p-8 text-center text-sm text-muted-foreground">
          No organization claims.
        </p>
      ) : (
        <div className="space-y-4">
          {claims.map((c) => (
            <Card key={c.id}>
              <CardContent className="space-y-2 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-charcoal">{orgById.get(c.organizationId)?.officialName ?? c.organizationId}</p>
                  <Badge variant={c.status === "approved" ? "jade" : c.status === "pending" ? "gold" : "destructive"}>
                    {c.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {c.representativeName} · {c.position}
                </p>
                <p className="text-sm text-charcoal/90">{c.evidence}</p>
                <p className="text-xs text-muted-foreground">{formatDate(c.createdAt, locale)}</p>
                {c.status === "pending" && <ClaimActions id={c.id} />}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
