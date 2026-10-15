import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Info, CheckCircle2, Sparkles, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrganizationCard } from "@/components/organizations/organization-card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PageHero } from "@/components/layout/page-hero";
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
    <div className="pb-20">
      <PageHero
        eyebrow={t("common.category")}
        icon={Sparkles}
        title={pick(category.name, locale)}
        subtitle={pick(category.description, locale)}
      />

      <div className="container">
        {/* Methodology / Criteria Section - Collapsible */}
        <section className="mt-16">
          <Collapsible className="group rounded-2xl border border-border bg-white shadow-soft">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full flex items-center justify-between p-6 h-auto text-left hover:bg-transparent">
                <div>
                  <h2 className="text-2xl font-bold text-charcoal sm:text-3xl">{t("category.criteria")}</h2>
                  <p className="mt-2 text-muted-foreground max-w-2xl">
                    {locale === "bn"
                      ? "প্রতিটি দৃষ্টিভঙ্গির জন্য আলাদা প্যারামিটার ও ওজন ব্যবহার করে আমরা সংস্কৃতি মূল্যায়ন করি।"
                      : "We measure culture using distinct parameters and weighted scoring tailored for each perspective."}
                  </p>
                </div>
                <ChevronDown className="h-6 w-6 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-6 pt-2 grid gap-6 lg:grid-cols-2">
                {bundles.map(({ tpl, bundle }) => (
                  <Card key={tpl.id} className="overflow-hidden border-border/40 shadow-none bg-soft/50">
                    <div className="bg-white/50 px-6 py-4 border-b border-border/40 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <div className="h-2 w-2 rounded-full bg-jade" />
                         <h3 className="font-bold text-charcoal">{pick(tpl.name, locale)}</h3>
                       </div>
                       {bundle && <Badge variant="jade" className="rounded-md">v{bundle.version.version}</Badge>}
                    </div>
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <Info className="h-3.5 w-3.5" />
                        <span>{t("common.perspective")}:</span>
                        <span className="text-charcoal">
                          {tpl.relationshipTypeIds
                            .map((id) => pick(relById.get(id)?.name, locale))
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                      {bundle ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {bundle.parameters.map((p) => (
                            <div key={p.id} className="flex items-start gap-2.5 rounded-lg border border-border/30 bg-white p-3">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-jade" />
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-charcoal leading-tight">{pick(p.name, locale)}</span>
                                <span className="mt-1 text-[10px] font-bold text-muted-foreground uppercase">{p.weight}% {locale === "bn" ? "ওজন" : "weight"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                          {t("org.questionnaireUnavailable")}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </section>

        {/* Organizations Section */}
        <section className="mt-20">
          <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-charcoal sm:text-3xl">{t("category.orgsInCategory")}</h2>
              <p className="mt-2 text-sm font-medium text-muted-foreground bg-warmgray/50 inline-block px-3 py-1 rounded-full">
                {t("category.showingOf", { shown: orgs.items.length, total: orgs.total })}
              </p>
            </div>
            <Button asChild variant="accent" size="lg" className="rounded-full font-bold shadow-soft self-center sm:self-auto px-8">
              <Link href={`/organizations?category=${category.slug}`}>
                {t("category.viewAllOrgs", { count: orgs.total })} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {orgs.items.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-border py-20 text-center">
              <p className="text-lg text-muted-foreground">{t("directory.empty")}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}
