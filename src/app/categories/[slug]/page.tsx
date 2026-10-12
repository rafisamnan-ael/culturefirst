import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrganizationCard } from "@/components/organizations/organization-card";
import { getStore } from "@/lib/data";
import { getServerT } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/pick";
import type { OrgScoreCard } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStore();
  const category = await store.getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: category.name.en,
    description: category.description.en.slice(0, 150),
  };
}

function chooseCard(cards: OrgScoreCard[]): OrgScoreCard | null {
  if (cards.length === 0) return null;
  return [...cards].sort((a, b) => b.eligibleCount - a.eligibleCount)[0];
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { t, locale } = await getServerT();
  const store = await getStore();
  const category = await store.getCategoryBySlug(slug);
  if (!category) notFound();

  const allTemplates = await store.listTemplates();
  const templates = allTemplates.filter((tpl) => tpl.categoryId === category.id);
  const relationships = await store.listRelationships();
  const relById = new Map(relationships.map((r) => [r.id, r]));

  const bundles = await Promise.all(
    templates.map((tpl) => {
      const relId = tpl.relationshipTypeIds[0];
      return store.getTemplateBundle(category.id, relId).then((b) => ({ tpl, bundle: b }));
    }),
  );

  const orgs = await store.listOrganizations({ categoryId: category.id, pageSize: 9 });
  const cards = await store.getScoreCards(orgs.items.map((o) => o.id));

  return (
    <div className="container py-10">
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/categories" className="hover:text-jade">
          {t("nav.categories")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal">{pick(category.name, locale)}</span>
      </nav>

      <header className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-charcoal">
          {pick(category.name, locale)}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {pick(category.description, locale)}
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-charcoal">{t("category.criteria")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {locale === "bn"
            ? "প্রতিটি দৃষ্টিভঙ্গির জন্য আলাদা প্যারামিটার ও ওজন।"
            : "Distinct parameters and weights for each reviewer perspective."}
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {bundles.map(({ tpl, bundle }) => (
            <Card key={tpl.id}>
              <CardContent className="p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-charcoal">{pick(tpl.name, locale)}</h3>
                  <Badge variant="outline">v{bundle?.version.version ?? "—"}</Badge>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  {t("common.perspective")}:{" "}
                  {tpl.relationshipTypeIds
                    .map((id) => pick(relById.get(id)?.name, locale))
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <ul className="space-y-1.5">
                  {bundle?.parameters.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-charcoal/90">{pick(p.name, locale)}</span>
                      <span className="tabular-nums text-muted-foreground">{p.weight}%</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold text-charcoal">{t("category.orgsInCategory")}</h2>
          <Button asChild variant="outline" size="sm">
            <Link href={`/organizations?category=${category.slug}`}>
              {t("common.viewAll")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        {orgs.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("directory.empty")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orgs.items.map((o) => (
              <OrganizationCard
                key={o.id}
                organization={o}
                category={category}
                scoreCard={chooseCard(cards.filter((c) => c.organizationId === o.id))}
                locale={locale}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
