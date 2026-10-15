import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, Clock, PenLine } from "lucide-react";
import { ReviewWizard, type WizardBundle } from "@/components/review/review-wizard";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/layout/page-hero";
import { getStore } from "@/lib/data";
import { getServerT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Write a review",
  robots: { index: false, follow: false },
};

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { t, locale } = await getServerT();
  const store = await getStore();

  const org = await store.getOrganizationBySlug(slug);
  if (!org || org.status === "merged") notFound();
  if (org.slug !== slug) permanentRedirect(`/organizations/${org.slug}/review`);

  const branches = await store.listBranches(org.id);
  const relationships = await store.listRelationshipsForCategory(org.categoryId);
  const bundles: Record<string, WizardBundle> = {};

  for (const rel of relationships) {
    const bundle = await store.getTemplateBundle(org.categoryId, rel.id);
    if (!bundle) continue;
    bundles[rel.id] = {
      versionId: bundle.version.id,
      version: bundle.version.version,
      parameters: bundle.parameters.map((p) => ({
        id: p.id,
        key: p.key,
        name: p.name,
        weight: p.weight,
        questions: p.questions.map((q) => ({ id: q.id, text: q.text, required: q.required })),
      })),
    };
  }

  // Unavailable questionnaire state: friendly explanation without sending into dead-end form
  if (Object.keys(bundles).length === 0) {
    return (
      <div>
        <PageHero
          eyebrow={t("nav.writeReview")}
          icon={PenLine}
          title={org.officialName}
          subtitle={t("review.reviewsComingSoonDesc")}
          size="compact"
        />
        <div className="container max-w-2xl py-12">
          <div className="relative animate-scale-in overflow-hidden rounded-2xl border border-border bg-white p-8 text-center shadow-lux">
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold/10 blur-2xl" />
            <div className="relative space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold">
                <Clock className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-charcoal sm:text-2xl">
                  {t("review.reviewsComingSoon")}
                </h2>
                <p className="mx-auto max-w-md text-sm text-muted-foreground">
                  {t("review.reviewsComingSoonDesc")}
                </p>
              </div>
              <div className="pt-2">
                <Button asChild variant="outline">
                  <Link href={`/organizations/${org.slug}`}>
                    {t("review.backToOrg")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        eyebrow={t("nav.writeReview")}
        icon={PenLine}
        title={org.officialName}
        subtitle={locale === "bn" ? "আপনার অভিজ্ঞতা শেয়ার করে অন্যদের সঠিক প্রতিষ্ঠান বেছে নিতে সাহায্য করুন।" : "Share your experience to help others choose the right organization."}
        size="compact"
      >
        <Link
          href={`/organizations/${org.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-soft/70 transition-colors hover:text-jade-highlight"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("review.backToOrg")}
        </Link>
      </PageHero>

      <div className="container max-w-3xl py-8 sm:py-12">
        <div className="animate-fade-up">
          <ReviewWizard
            organization={{
              id: org.id,
              slug: org.slug,
              officialName: org.officialName,
              bengaliName: org.bengaliName,
            }}
            branches={branches}
            relationships={relationships.map((r) => ({ id: r.id, name: r.name }))}
            bundles={bundles}
          />
        </div>
      </div>
    </div>
  );
}
