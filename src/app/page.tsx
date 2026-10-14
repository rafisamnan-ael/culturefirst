import Link from "next/link";
import { ArrowRight, ShieldCheck, Lock, Scale, Eye, MessageSquare, Plus, PenLine, Star, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryCard } from "@/components/organizations/category-card";
import { OrganizationCard } from "@/components/organizations/organization-card";
import { ReviewSearch } from "@/components/review/review-search";
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
  const allOrgs = await store.listOrganizations({ pageSize: 2000 });
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const recentReviews = await store.listReviews({ status: "published", pageSize: 100 });
  const recentOrgIds: string[] = [];
  for (const r of recentReviews.items) {
    if (r.score === null) continue;
    if (!recentOrgIds.includes(r.organizationId)) recentOrgIds.push(r.organizationId);
    if (recentOrgIds.length >= 6) break;
  }
  const recentOrgsRaw = await store.listOrganizationsByIds(recentOrgIds);
  const recentOrgs = recentOrgIds
    .map((id) => recentOrgsRaw.find((o) => o.id === id))
    .filter((o): o is NonNullable<typeof o> => Boolean(o));
  const recentCards = await store.getScoreCards(recentOrgs.map((o) => o.id));
  const hasRecent = recentOrgs.length > 0;
  const featuredOrgs = hasRecent ? recentOrgs : orgsPage.items;
  const featuredCards = await store.getScoreCards(featuredOrgs.map(o => o.id));

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
      {/* Hero: Review-Centric Redesign */}
      <section className="relative overflow-hidden border-b border-border bg-[#0d1b2a] text-soft">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-[450px] w-[450px] rounded-full bg-jade/10 blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full bg-navy/20 blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03] grayscale" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />
        </div>
        
        <div className="container relative z-10 grid gap-12 py-16 md:py-28 lg:grid-cols-2 lg:items-center">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-jade/30 bg-jade/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-jade-highlight">
              <Sparkles className="h-3.5 w-3.5" />
              {locale === "bn" ? "বাংলাদেশের প্রথম কালচার প্ল্যাটফর্ম" : "Bangladesh's Independent Culture Platform"}
            </div>
            <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              {locale === "bn" ? "প্রতিষ্ঠানের আসল চেহারা জানুন।" : "Know the culture before you choose."}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-soft/70 sm:text-xl mx-auto lg:mx-0">
              {t("home.heroSubtitle")}
            </p>
            
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
               <div className="flex items-center gap-2 text-sm font-medium text-jade-highlight">
                 <CheckCircle2 className="h-4 w-4" />
                 <span>{locale === "bn" ? "সম্পূর্ণ গোপনীয়" : "100% Anonymous"}</span>
               </div>
               <div className="flex items-center gap-2 text-sm font-medium text-jade-highlight">
                 <CheckCircle2 className="h-4 w-4" />
                 <span>{locale === "bn" ? "সঠিক যাচাইকরণ" : "Verified Methodology"}</span>
               </div>
            </div>
          </div>

          {/* Interactive Review Centerpiece */}
          <div className="relative mx-auto w-full max-w-md lg:mr-0 animate-in fade-in slide-in-from-right-4 duration-700">
            <Card className="overflow-hidden border-border/10 bg-white/10 backdrop-blur-xl shadow-2xl">
              <CardContent className="p-8">
                <div className="mb-6 space-y-2 text-center">
                   <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-jade shadow-lg shadow-jade/20 mb-4">
                     <PenLine className="h-6 w-6 text-white" />
                   </div>
                   <h2 className="text-2xl font-bold text-white">
                     {locale === "bn" ? "রিভিউ দিয়ে শুরু করুন" : "Start your review"}
                   </h2>
                   <p className="text-sm text-soft/60">
                     {locale === "bn" ? "প্রতিষ্ঠান নির্বাচন করে রেটিং দেওয়া শুরু করুন" : "Select an organization to rate your experience"}
                   </p>
                </div>

                <ReviewSearch
                  organizations={allOrgs.items.map((o) => ({
                    id: o.id,
                    slug: o.slug,
                    officialName: o.officialName,
                    bengaliName: o.bengaliName,
                  }))}
                  className="scale-105"
                />

                <div className="mt-8 grid grid-cols-2 gap-3 text-center">
                   <Link href="/organizations" className="rounded-xl border border-soft/10 bg-white/5 p-3 text-xs font-bold text-soft transition hover:bg-white/10">
                     {t("nav.directory")}
                   </Link>
                   <Link href="/how-it-works" className="rounded-xl border border-soft/10 bg-white/5 p-3 text-xs font-bold text-soft transition hover:bg-white/10">
                     {t("nav.howItWorks")}
                   </Link>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold text-soft/40">
                   <Lock className="h-3 w-3" />
                   <span>{locale === "bn" ? "নিরাপদ ও এনক্রিপ্টেড" : "Secure & Encrypted Submission"}</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Floating stats decorative */}
            <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 rounded-2xl border border-border/10 bg-navy-secondary p-4 shadow-xl">
               <div className="flex -space-x-2">
                 {[1,2,3].map(i => <div key={i} className="h-8 w-8 rounded-full border-2 border-navy-secondary bg-jade-highlight" />)}
               </div>
               <div className="text-left">
                 <p className="text-[10px] font-bold uppercase tracking-tighter text-soft/50 leading-none">Joined by</p>
                 <p className="text-sm font-bold text-white leading-tight">500+ Reviewers</p>
               </div>
            </div>
          </div>
        </div>
      </section>

       {/* Categories */}
      <section className="container py-20">
        <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-charcoal sm:text-4xl">{t("home.browseCategories")}</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              {locale === "bn" ? "প্রতিটি ক্যাটাগরির জন্য রয়েছে বিশেষ মূল্যায়ন মানদণ্ড।" : "Specialized culture criteria for every industry."}
            </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, idx) => (
            <div key={c.id} className="reveal" style={{ animationDelay: `${idx * 50}ms` }}>
              <CategoryCard category={c} count={orgCountByCategory.get(c.id) ?? 0} locale={locale} />
            </div>
          ))}
        </div>
      </section>

       {/* Featured */}
      <section className="border-y border-border bg-warmgray/30 py-20">
        <div className="container">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-bold text-charcoal sm:text-4xl">
                {hasRecent ? t("home.featured") : t("home.exploreTitle")}
              </h2>
              <p className="mt-2 text-muted-foreground">{hasRecent ? "" : t("home.exploreSubtitle")}</p>
            </div>
            <Button asChild variant="outline" className="rounded-full font-bold self-center sm:self-auto">
              <Link href="/organizations">
                {t("nav.directory")} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {featuredOrgs.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-20">{t("directory.empty")}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredOrgs.map((o) => (
                <OrganizationCard
                  key={o.id}
                  organization={o}
                  category={categoryById.get(o.categoryId)}
                  scoreCard={chooseCard(featuredCards.filter((c) => c.organizationId === o.id))}
                  locale={locale}
                />
              ))}
            </div>
          )}
        </div>
      </section>

       {/* Perspectives */}
      <section className="container py-24">
        <div className="grid gap-12 lg:grid-cols-3 lg:items-center">
          <div className="lg:col-span-1 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-charcoal sm:text-4xl leading-tight">{t("home.perspectivesTitle")}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{t("home.perspectivesBody")}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-2">
            {perspectives.map((p, idx) => (
              <Card key={p.title} className="group border-border/40 shadow-soft transition-all hover:border-jade/20 hover:shadow-elevated">
                <CardContent className="space-y-4 p-8">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-jade/10 text-jade transition-colors group-hover:bg-jade group-hover:text-white">
                    <p.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-navy py-24 text-soft overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-jade/5 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="container relative z-10 grid gap-12 lg:grid-cols-3">
          <div className="text-center lg:text-left">
            <div className="mx-auto lg:mx-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-6">
              <Lock className="h-7 w-7 text-jade-highlight" />
            </div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">{t("home.trustTitle")}</h2>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-2">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-jade-highlight" />
                <h3 className="text-xl font-bold text-white">{locale === "bn" ? "মডারেশন" : "Human Moderation"}</h3>
              </div>
              <p className="text-lg leading-relaxed text-soft/60">
                {locale === "bn"
                  ? "প্রতিটি রিভিউ প্রকাশের আগে মানব মডারেশনের মধ্য দিয়ে যায়। শুধু অনুমোদিত, যোগ্য রিভিউ স্কোরে অন্তর্ভুক্ত হয়।"
                  : "Every review passes through human moderation before publication. Only approved, eligible reviews affect public scores."}
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-jade-highlight" />
                <h3 className="text-xl font-bold text-white">{locale === "bn" ? "গোপনীয়তা" : "Reviewer Privacy"}</h3>
              </div>
              <p className="text-lg leading-relaxed text-soft/60">
                {locale === "bn"
                  ? "ছদ্মনামে রিভিউ করা যায়। ইমেইল বা ব্যক্তিগত পরিচয় কখনো প্রকাশ্যে দেখানো হয় না।"
                  : "Reviews can be published under a pseudonym. Emails and personal identities are never shown publicly."}
              </p>
            </div>
          </div>
        </div>
      </section>

       {/* Final CTA: Focused on the Review Page */}
      <section className="container py-24">
        <div className="relative overflow-hidden rounded-3xl border-2 border-jade/20 bg-gradient-to-br from-jade-highlight/40 via-white to-white p-10 shadow-elevated text-center sm:p-20">
          <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-jade/10 blur-[80px]" />
          <div aria-hidden className="pointer-events-none absolute -left-32 -bottom-32 h-64 w-64 rounded-full bg-navy/5 blur-[80px]" />
          
          <div className="relative z-10 mx-auto max-w-2xl space-y-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-soft">
              <PenLine className="h-8 w-8 text-jade" />
            </div>
            <h2 className="text-4xl font-bold text-charcoal sm:text-5xl">{t("home.ctaTitle")}</h2>
            <p className="text-xl text-muted-foreground">{t("home.ctaBody")}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="rounded-full h-14 px-10 text-lg font-bold shadow-elevated">
                <Link href="/review">
                  <PenLine className="mr-2 h-5 w-5" />
                  {locale === "bn" ? "অভিজ্ঞতা শেয়ার করুন" : "Write my review now"}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full h-14 px-10 text-lg font-bold border-2">
                <Link href="/methodology">
                   {locale === "bn" ? "পদ্ধতি জানুন" : "Learn our scoring"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
