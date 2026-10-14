import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageActions } from "@/components/admin/moderation-actions";
import { getStore } from "@/lib/data";
import { getServerT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const { t, locale } = await getServerT();
  const store = await getStore();
  const messages = await store.listContactMessages();
  const orgIds = [...new Set(messages.map((m) => m.organizationId).filter((id): id is string => !!id))];
  const orgs = await store.listOrganizationsByIds(orgIds);
  const orgById = new Map(orgs.map((o) => [o.id, o]));
  const open = messages.filter((m) => m.status === "open");
  const resolved = messages.filter((m) => m.status === "resolved");

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-charcoal">{t("admin.messages")}</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        {messages.length} total · {open.length} open
      </p>

      {messages.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-white p-8 text-center text-sm text-muted-foreground">
          No messages yet.
        </p>
      ) : (
        <div className="space-y-4">
          {[...open, ...resolved].map((m) => (
            <Card key={m.id}>
              <CardContent className="space-y-2 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-charcoal">
                    {m.subject || m.name}
                  </p>
                  <Badge variant={m.status === "resolved" ? "jade" : "gold"}>{m.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {m.name} · {m.email} · <span className="capitalize">{m.topic.replace(/-/g, " ")}</span>
                </p>
                {m.organizationId && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Regarding: </span>
                    <Link
                      href={`/organizations/${orgById.get(m.organizationId)?.slug ?? m.organizationId}`}
                      className="font-medium text-jade hover:underline"
                    >
                      {m.organizationName ?? orgById.get(m.organizationId)?.officialName ?? m.organizationId}
                    </Link>
                  </p>
                )}
                <p className="whitespace-pre-wrap text-sm text-charcoal/90">{m.message}</p>
                <p className="text-xs text-muted-foreground">{formatDate(m.createdAt, locale)}</p>
                <MessageActions id={m.id} status={m.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
