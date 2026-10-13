import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ReviewWizard, type WizardBundle } from "@/components/review/review-wizard";
import { getStore } from "@/lib/data";
import { getServerT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Write a review",
  robots: { index: false, follow: false },
};

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { t } = await getServerT();
  const store = await getStore();

  const org = await store.getOrganizationBySlug(slug);
  if (!org || org.status === "merged") notFound();

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

  // Anyone can fill in and submit the review wizard — no sign-in required.
  return (
    <div className="container max-w-3xl py-10">
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href={`/organizations/${org.slug}`} className="hover:text-jade">
          {org.officialName}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal">{t("nav.writeReview")}</span>
      </nav>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-charcoal">{t("nav.writeReview")}</h1>
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
  );
}
