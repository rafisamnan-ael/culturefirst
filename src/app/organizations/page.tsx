import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { OrganizationCard } from "@/components/organizations/organization-card";
import { OrganizationFilters } from "@/components/organizations/organization-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { getStore } from "@/lib/data";
import { getServerT } from "@/lib/i18n/server";
import type { OrgScoreCard } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Organization directory",
  description:
    "Search and filter organizations across Bangladesh by category, location and reviewer perspective.",
};

function chooseCard(cards: OrgScoreCard[]): OrgScoreCard | null {
  if (cards.length === 0) return null;
  return [...cards].sort((a, b) => b.eligibleCount - a.eligibleCount)[0];
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const { t, locale } = await getServerT();
  const store = await getStore();

  const categories = await store.listCategories();
  const relationships = await store.listRelationships();
  const allOrgs = await store.listOrganizations({ pageSize: 1000 });
  const divisions = [...new Set(allOrgs.items.map((o) => o.division).filter((d): d is string => !!d))].sort();

  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
  const relBySlug = new Map(relationships.map((r) => [r.slug, r]));

  const categorySlug = typeof sp.category === "string" ? sp.category : undefined;
  const perspectiveSlug = typeof sp.perspective === "string" ? sp.perspective : undefined;
  const page = typeof sp.page === "string" ? Number(sp.page) || 1 : 1;

  const result = await store.listOrganizations({
    search: typeof sp.q === "string" ? sp.q : undefined,
    categoryId: categorySlug ? categoryBySlug.get(categorySlug)?.id : undefined,
    division: typeof sp.division === "string" ? sp.division : undefined,
    perspectiveRelationshipId: perspectiveSlug ? relBySlug.get(perspectiveSlug)?.id : undefined,
    hasScores: sp.scores === "1",
    page,
    pageSize: 12,
  });

  const cards = await store.getScoreCards(result.items.map((o) => o.id));
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const from = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const to = Math.min(result.page * result.pageSize, result.total);

  function pageHref(p: number) {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (typeof v === "string" && k !== "page") next.set(k, v);
    }
    next.set("page", String(p));
    return `/organizations?${next.toString()}`;
  }

  return (
    <div className="container py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-charcoal">{t("directory.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("directory.subtitle")}</p>
      </header>

      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <OrganizationFilters categories={categories} relationships={relationships} divisions={divisions} />
      </Suspense>

      <p className="mt-6 text-sm text-muted-foreground">
        {t("directory.showing", { from, to, total: result.total })}
      </p>

      {result.items.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border bg-white p-12 text-center">
          <p className="text-sm text-muted-foreground">{t("directory.empty")}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button asChild variant="outline">
              <Link href="/organizations">{t("directory.clearFilters")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/suggest">{locale === "bn" ? "এই প্রতিষ্ঠান প্রস্তাব করুন" : "Suggest this organization"}</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((o) => (
            <OrganizationCard
              key={o.id}
              organization={o}
              category={categoryById.get(o.categoryId)}
              scoreCard={chooseCard(cards.filter((c) => c.organizationId === o.id))}
              locale={locale}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
          {page > 1 && (
            <Button asChild variant="outline" size="sm">
              <Link href={pageHref(page - 1)}>{t("common.back")}</Link>
            </Button>
          )}
          <span className="px-3 text-sm text-muted-foreground">
            {t("directory.page")} {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Button asChild variant="outline" size="sm">
              <Link href={pageHref(page + 1)}>{t("common.next")}</Link>
            </Button>
          )}
        </nav>
      )}
    </div>
  );
}
