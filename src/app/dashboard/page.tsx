import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "@/components/layout/page-hero";
import { CheckCircle2, Clock, FileText, UserCircle2 } from "lucide-react";
import { getStore } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { getServerT } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/pick";
import { formatDate } from "@/lib/utils";
import { ReviewActions, PrivacySettings } from "@/components/review/review-actions";
import type { ReviewStatus } from "@/types/domain";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

const STATUS_VARIANT: Record<ReviewStatus, "default" | "jade" | "gold" | "destructive" | "outline" | "navy"> = {
  draft: "outline",
  pending: "gold",
  published: "jade",
  rejected: "destructive",
  withdrawn: "outline",
  flagged: "gold",
  under_appeal: "navy",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { t, locale } = await getServerT();
  const store = await getStore();

  const reviewsPage = await store.listReviews({ userId: user.id, pageSize: 100 });
  const reviews = reviewsPage.items;
  const orgs = await store.listOrganizationsByIds([...new Set(reviews.map((r) => r.organizationId))]);
  const orgById = new Map(orgs.map((o) => [o.id, o]));

  const counts = {
    pending: reviews.filter((r) => r.status === "pending").length,
    published: reviews.filter((r) => r.status === "published").length,
    total: reviews.length,
  };

  const stats = [
    { label: t("admin.totalReviews"), value: counts.total, icon: FileText },
    { label: t("admin.pending"), value: counts.pending, icon: Clock },
    { label: t("status.published"), value: counts.published, icon: CheckCircle2 },
  ];

  return (
    <div>
      <PageHero
        eyebrow={<span className="capitalize">{user.role}</span>}
        icon={UserCircle2}
        title={t("dashboard.title")}
        subtitle={user.displayName || user.email}
        size="compact"
      />
      <div className="container py-10">
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.label} className="hover-lift overflow-hidden border-border/60 shadow-soft">
              <CardContent className="flex items-center gap-4 p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-jade text-white shadow-soft">
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-bold tabular-nums text-charcoal">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-charcoal">{t("dashboard.myReviews")}</h2>
        {reviews.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-white p-8 text-center text-sm text-muted-foreground">
            {t("dashboard.noReviews")}
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => {
              const org = orgById.get(r.organizationId);
              return (
                <Card key={r.id} className="hover-lift border-border/60 shadow-soft">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <Link
                          href={org ? `/organizations/${org.slug}` : "#"}
                          className="font-medium text-charcoal hover:text-jade"
                        >
                          {org ? pick({ en: org.officialName, bn: org.bengaliName || org.officialName }, locale) : r.organizationId}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(r.createdAt, locale)}
                          {r.experiencePeriod ? ` · ${r.experiencePeriod}` : ""}
                        </p>
                      </div>
                      <Badge variant={STATUS_VARIANT[r.status] ?? "default"}>
                        {t(`status.${r.status}`)}
                      </Badge>
                    </div>
                    {r.title && <p className="text-sm font-medium text-charcoal">{r.title}</p>}
                    <p className="line-clamp-3 text-sm text-muted-foreground">{r.body}</p>
                    {r.moderationReason && r.status === "rejected" && (
                      <p className="text-xs text-destructive">
                        {t("admin.reason")}: {r.moderationReason}
                      </p>
                    )}
                    <ReviewActions review={r} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="max-w-xl">
        <h2 className="mb-4 text-lg font-semibold text-charcoal">{t("dashboard.privacy")}</h2>
        <Card className="border-border/60 shadow-soft">
          <CardContent className="p-5">
            <PrivacySettings initialName={user.displayName} />
            <p className="mt-4 text-xs text-muted-foreground">
              {locale === "bn"
                ? "আপনার ইমেইল কখনো প্রকাশ্যে দেখানো হয় না। ইমেইল যাচাইয়ের জন্য দাবি করা হয় না।"
                : "Your email is never shown publicly. We do not require email verification for review submission in this MVP."}
            </p>
          </CardContent>
        </Card>
      </section>
      </div>
    </div>
  );
}
