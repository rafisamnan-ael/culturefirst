import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Star, ExternalLink, PenLine } from "lucide-react";
import { OrganizationProfileView, type ProfilePerspective, type ProfileParameter } from "@/components/organizations/organization-profile-view";
import { OrgLogo } from "@/components/organizations/org-logo";
import { getStore } from "@/lib/data";
import { getServerT } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/pick";
import { sufficiency } from "@/lib/scoring";
import { scoreThresholds, siteUrl, brand } from "@/lib/config";
import type { Review } from "@/types/domain";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStore();
  const org = await store.getOrganizationBySlug(slug);
  if (!org) return { title: "Organization not found" };
  const title = org.bengaliName ? `${org.officialName} (${org.bengaliName})` : org.officialName;
  return {
    title,
    description: org.description.en.slice(0, 155) || `Culture reviews for ${org.officialName}.`,
    alternates: { canonical: `${siteUrl}/organizations/${org.slug}` },
    robots: org.status === "active" ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default async function OrganizationProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { t, locale } = await getServerT();
  const store = await getStore();

  const org = await store.getOrganizationBySlug(slug);
  if (!org || org.status === "merged") notFound();
  if (org.slug !== slug) permanentRedirect(`/organizations/${org.slug}`);

  const category = await store.getCategoryById(org.categoryId);
  const relationships = await store.listRelationshipsForCategory(org.categoryId);
  const aggregates = await store.getAggregates(org.id, null);

  // Build perspectives for each category relationship.
  const perspectives: ProfilePerspective[] = [];
  for (const rel of relationships) {
    const bundle = await store.getTemplateBundle(org.categoryId, rel.id);
    const aggregate = aggregates.find((a) => a.relationshipTypeId === rel.id) ?? null;
    const parameters: ProfileParameter[] = (bundle?.parameters ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      weight: p.weight,
      score: aggregate?.parameterScores[p.id] ?? null,
    }));

    const suff = sufficiency(aggregate?.eligibleCount ?? 0, scoreThresholds);
    const showHighlights = (aggregate?.eligibleCount ?? 0) >= scoreThresholds.minProvisionalReviews;
    const strengths = showHighlights ? parameters.filter((p) => (p.score ?? 0) >= 4).sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 4) : [];
    const concerns = showHighlights ? parameters.filter((p) => (p.score ?? 5) <= 2.5).sort((a, b) => (a.score ?? 0) - (b.score ?? 0)).slice(0, 4) : [];

    const reviewPage = await store.listReviews({
      organizationId: org.id,
      relationshipTypeId: rel.id,
      status: "published",
      pageSize: 10,
    });
    const reviews: Review[] = reviewPage.items;
    const responses = await store.listResponsesForReviews(reviews.map((r) => r.id));
    const responsesByReview: Record<string, typeof responses> = {};
    for (const r of reviews) {
      responsesByReview[r.id] = responses.filter((x) => x.reviewId === r.id);
    }

    perspectives.push({
      relationshipId: rel.id,
      name: rel.name,
      score: aggregate?.averageScore ?? null,
      eligibleCount: aggregate?.eligibleCount ?? 0,
      sufficiency: suff,
      questionnaireAvailable: Boolean(bundle),
      distribution: aggregate?.distribution ?? { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
      parameters,
      strengths,
      concerns,
      reviews,
      responsesByReview,
    });
  }

  // Default perspective = the one with the most eligible reviews.
  perspectives.sort((a, b) => b.eligibleCount - a.eligibleCount);

  const alternateNames = [org.bengaliName, ...org.alternateNames].filter((n): n is string => Boolean(n));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: org.officialName,
    ...(alternateNames.length ? { alternateName: alternateNames } : {}),
    ...(org.website ? { url: org.website } : {}),
    ...(org.city ? { address: { "@type": "PostalAddress", addressLocality: org.city, addressRegion: org.district, addressCountry: "BD" } } : {}),
  };

  const hasAnyAvailableBundle = perspectives.some((p) => p.questionnaireAvailable);

  return (
    <div className="container py-8 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/organizations" className="hover:text-jade">
          {t("nav.directory")}
        </Link>
        {category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/categories/${category.slug}`} className="hover:text-jade">
              {pick(category.name, locale)}
            </Link>
          </>
        )}
      </nav>

      <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <OrgLogo slug={org.slug} name={org.officialName} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
              {org.officialName}
            </h1>
            {org.bengaliName && (
              <p className="mt-0.5 text-base text-muted-foreground" lang="bn">
                {org.bengaliName}
              </p>
            )}
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {category && <Badge variant="jade">{pick(category.name, locale)}</Badge>}
              {org.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {org.city}
                  {org.district && org.district !== org.city ? `, ${org.district}` : ""}
                </span>
              )}
              <Badge variant="outline">{org.claimStatus === "claimed" ? t("org.claimed") : t("org.unclaimed")}</Badge>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2.5 sm:self-start">
          {/* Prominent Write Review CTA */}
          {hasAnyAvailableBundle ? (
            <Button asChild variant="accent" size="default" className="font-semibold shadow-sm">
              <Link href={`/organizations/${org.slug}/review`}>
                <PenLine className="h-4 w-4" />
                {t("nav.writeReview")}
              </Link>
            </Button>
          ) : (
            <Button disabled variant="outline" size="default" className="text-muted-foreground">
              {t("review.reviewsComingSoon")}
            </Button>
          )}

          {org.website ? (
            <a
              href={org.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-2 text-xs sm:text-sm font-medium text-jade hover:bg-warmgray"
            >
              <Globe className="h-4 w-4" />
              {t("org.officialWebsite")}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}

          <a
            href={
              org.googleMapsUrl ??
              `https://www.google.com/search?q=${encodeURIComponent(`${org.officialName} ${org.city ?? "Bangladesh"}`)}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-2 text-xs sm:text-sm font-medium text-charcoal shadow-card transition hover:bg-warmgray"
          >
            <Star className="h-4 w-4 text-gold" />
            {org.googlePlaceId ? t("org.viewGoogleReviews") : t("org.googleSearch")}
          </a>
        </div>
      </header>

      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {pick(org.description, locale)}
      </p>

      <div className="mt-8">
        <OrganizationProfileView
          slug={org.slug}
          perspectives={perspectives}
          googleMapsUrl={org.googleMapsUrl}
          googleReviewsVerified={Boolean(org.googlePlaceId)}
        />
      </div>

      <section className="mt-10 rounded-lg border border-border bg-white p-5">
        <h2 className="text-sm font-semibold text-charcoal">{t("org.methodologyLink")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {locale === "bn"
            ? "প্রতিটি দৃষ্টিভঙ্গি আলাদাভাবে স্কোর করা হয়। স্কোর ১–৫ স্কেলে ওজনযুক্ত গড়; “দেখিনি” উত্তর বাদ যায়। শুধু অনুমোদিত, যোগ্য রিভিউ অন্তর্ভুক্ত হয়।"
            : "Each perspective is scored separately. Scores are weighted averages on a 1–5 scale; “Not observed” answers are excluded. Only approved, eligible reviews are included."}
        </p>
        <Link href="/methodology" className="mt-3 inline-block text-sm font-medium text-jade hover:underline">
          {brand.name} {locale === "bn" ? "পদ্ধতি" : "methodology"} →
        </Link>
      </section>
    </div>
  );
}
