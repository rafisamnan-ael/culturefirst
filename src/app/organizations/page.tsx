import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Search, Sparkles } from "lucide-react";
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
    <div className="pb-20">
      {/* Colorful Header */}
      <section className="relative overflow-hidden border-b border-border bg-mesh text-soft py-16 md:py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-[400px] w-[400px] rounded-full bg-jade/10 blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 h-[350px] w-[350px] rounded-full bg-navy-accent/20 blur-[100px]" />
        </div>
        
        <div className="container relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-bold uppercase tracking-widest text-jade-highlight">
            <Search className="h-3.5 w-3.5" />
            {t("directory.title")}
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {t("directory.title")}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-soft/80 sm:text-xl max-w-2xl">
            {t("directory.subtitle")}
          </p>
        </div>
      </section>

      <div className="container py-12">
        <Suspense fallback={<Skeleton className="h-32 w-full" />}>
          <OrganizationFilters categories={categories} relationships={relationships} divisions={divisions} />
        </Suspense>

        <p className="mt-8 text-sm font-medium text-muted-foreground bg-warmgray/50 inline-block px-3 py-1 rounded-full">
          {t("directory.showing", { from, to, total: result.total })}
        </p>

        {result.items.length === 0 ? (
          <div className="mt-8 rounded-3xl border-2 border-dashed border-border py-20 text-center">
            <p className="text-lg text-muted-foreground">{t("directory.empty")}</p>
            <Button asChild variant="outline" className="mt-4 rounded-full">
              <Link href="/organizations">{t("directory.clearFilters")}</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
            {page > 1 && (
              <Button asChild variant="outline" className="rounded-full">
                <Link href={pageHref(page - 1)}>{t("common.back")}</Link>
              </Button>
            )}
            <span className="px-4 text-sm font-bold text-charcoal">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Button asChild variant="outline" className="rounded-full">
                <Link href={pageHref(page + 1)}>{t("common.next")}</Link>
              </Button>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
