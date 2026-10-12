import Link from "next/link";
import { ArrowRight, Search, ShieldCheck, Lock, Scale, Eye, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryCard } from "@/components/organizations/category-card";
import { OrganizationCard } from "@/components/organizations/organization-card";
import { getStore } from "@/lib/data";
import { getServerT } from "@/lib/i18n/server";
import { brand } from "@/lib/config";
import type { OrgScoreCard } from "@/lib/data/store";

export const dynamic = "force-dynamic";

function chooseCard(cards: OrgScoreCard[]): OrgScoreCard | null {
  if (cards.length === 0) return null;
  return [...cards].sort((a, b) => b.eligibleCount - a.eligibleCount)[0];
}

export default async function HomePage() {
  const { t, locale } = await getServerT();
  const store = await getStore();

  const categories = await store.listCategories();
  const orgsPage = await store.listOrganizations({ pageSize: 6 });
  const allOrgs = await store.listOrganizations({ pageSize: 1000 });
  const cards = await store.getScoreCards(orgsPage.items.map((o) => o.id));
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const orgCountByCategory = new Map<string, number>();
  for (const o of allOrgs.items) {
    orgCountByCategory.set(o.categoryId, (orgCountByCategory.get(o.categoryId) ?? 0) + 1);
  }

  const perspectives = [
    { icon: ShieldCheck, title: locale === "bn" ? "কর্মী" : "Employees", body: locale === "bn" ? "নেতৃত্ব, ন্যায্যতা ও মনস্তাত্ত্বিক নিরাপত্তা।" : "Leadership, fairness and psychological safety." },
    { icon: Eye, title: locale === "bn" ? "রোগী ও গ্রাহক" : "Patients & customers", body: locale === "bn" ? "সম্মান, মর্যাদা ও অভিযোগ নিষ্পত্তি।" : "Respect, dignity and how concerns are handled." },
    { icon: MessageSquare, title: locale === "bn" ? "শিক্ষার্থী" : "Students", body: locale === "bn" ? "শিক্ষকদের আচরণ ও প্রশাসনিক ন্যায্যতা।" : "Faculty conduct and administrative fairness." },
    { icon: Scale, title: locale === "bn" ? "নাগরিক" : "Citizens", body: locale === "bn" ? "স্বচ্ছতা, সাড়া ও সমান আচরণ।" : "Transparency, responsiveness and equal treatment." },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-navy to-navy-secondary text-soft">
        <div className="container grid gap-10 py-16 md:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-soft/20 px-3 py-1 text-xs font-medium text-jade-highlight">
              {brand.country} · {locale === "bn" ? "স্বাধীন সংস্কৃতি প্ল্যাটফর্ম" : "Independent culture platform"}
            </p>
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {t("home.heroTitle")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-soft/80 sm:text-lg">
              {t("home.heroSubtitle")}
            </p>

            <form action="/organizations" method="get" className="mt-8 flex max-w-xl gap-2">
              <label htmlFor="home-search" className="sr-only">
                {t("common.search")}
              </label>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="home-search"
                  name="q"
                  type="search"
                  placeholder={t("common.searchPlaceholder")}
                  className="h-12 w-full rounded-md border border-transparent bg-white pl-9 pr-3 text-sm text-charcoal placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-highlight"
                />
              </div>
              <Button type="submit" variant="accent" size="lg">
                {t("common.search")}
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="accent" size="lg">
                <Link href="/organizations">
                  {t("nav.directory")} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-soft/30 bg-transparent text-soft hover:bg-soft/10"
              >
                <Link href="/how-it-works">{t("nav.howItWorks")}</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-soft/15 bg-navy-secondary/60 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-wide text-jade-highlight">
              {locale === "bn" ? "সংস্কৃতি স্কোর — কীভাবে হিসাব হয়" : "Culture score — how it is calculated"}
            </p>
            <div className="mt-4 space-y-3 text-sm text-soft/85">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-jade text-xs font-bold text-white">1</span>
                <p>{locale === "bn" ? "প্রতিটি ক্যাটাগরি ও সংশ্লিষ্ট দৃষ্টিভঙ্গির জন্য আলাদা প্রশ্নমালা।" : "A distinct questionnaire for every category and reviewer perspective."}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-jade text-xs font-bold text-white">2</span>
                <p>{locale === "bn" ? "প্রতিটি প্যারামিটারের ওজনসহ ১–৫ স্কেলে রেটিং।" : "Weighted 1–5 ratings across category-specific parameters."}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-jade text-xs font-bold text-white">3</span>
                <p>{locale === "bn" ? "“দেখিনি” উত্তর হিসাব থেকে বাদ যায়।" : "“Not observed” answers are excluded from the calculation."}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-jade text-xs font-bold text-white">4</span>
                <p>{locale === "bn" ? "কম নমুনায় সংখ্যা নয়, সতর্কীকরণ দেখানো হয়।" : "Small samples show a disclosure instead of a reliable number."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-charcoal">{t("home.browseCategories")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {locale === "bn" ? "প্রতিটি ক্যাটাগরির নিজস্ব মূল্যায়ন মানদণ্ড।" : "Each category has its own culture criteria."}
            </p>
          </div>
          <Link href="/categories" className="hidden text-sm font-medium text-jade hover:underline sm:block">
            {t("common.viewAll")}
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((c) => (
            <CategoryCard key={c.id} category={c} count={orgCountByCategory.get(c.id) ?? 0} locale={locale} />
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="border-y border-border bg-white py-14">
        <div className="container">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold text-charcoal">{t("home.featured")}</h2>
            <Link href="/organizations" className="text-sm font-medium text-jade hover:underline">
              {t("nav.directory")}
            </Link>
          </div>
          {orgsPage.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("directory.empty")}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {orgsPage.items.map((o) => (
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
        </div>
      </section>

      {/* Perspectives */}
      <section className="container py-14">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-semibold text-charcoal">{t("home.perspectivesTitle")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("home.perspectivesBody")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            {perspectives.map((p) => (
              <Card key={p.title}>
                <CardContent className="space-y-2 p-5">
                  <p.icon className="h-5 w-5 text-jade" />
                  <h3 className="font-semibold text-charcoal">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-y border-border bg-white py-14">
        <div className="container grid gap-8 lg:grid-cols-3">
          <div>
            <Lock className="h-6 w-6 text-jade" />
            <h2 className="mt-3 text-xl font-semibold text-charcoal">{t("home.trustTitle")}</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-2">
            <div>
              <h3 className="font-semibold text-charcoal">{locale === "bn" ? "মডারেশন" : "Moderation"}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {locale === "bn"
                  ? "প্রতিটি রিভিউ প্রকাশের আগে মানব মডারেশনের মধ্য দিয়ে যায়। শুধু অনুমোদিত, যোগ্য রিভিউ স্কোরে অন্তর্ভুক্ত হয়।"
                  : "Every review passes through human moderation before publication. Only approved, eligible reviews affect public scores."}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-charcoal">{locale === "bn" ? "গোপনীয়তা" : "Privacy"}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {locale === "bn"
                  ? "ছদ্মনামে রিভিউ করা যায়। ইমেইল বা ব্যক্তিগত পরিচয় কখনো প্রকাশ্যে দেখানো হয় না।"
                  : "Reviews can be published under a pseudonym. Emails and personal identities are never shown publicly."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16">
        <div className="rounded-lg border border-border bg-gradient-to-br from-jade-highlight/40 to-white p-8 sm:p-12">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold text-charcoal">{t("home.ctaTitle")}</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">{t("home.ctaBody")}</p>
            </div>
            <Button asChild size="lg">
              <Link href="/organizations">
                <Plus className="h-4 w-4" />
                {t("nav.writeReview")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
