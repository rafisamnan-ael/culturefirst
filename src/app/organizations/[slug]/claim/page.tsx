import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import { ClaimForm } from "@/components/review/claim-form";
import { PageHero } from "@/components/layout/page-hero";
import { getStore } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { getServerT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Claim organization",
  robots: { index: false, follow: false },
};

export default async function ClaimPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { locale } = await getServerT();
  const store = await getStore();
  const org = await store.getOrganizationBySlug(slug);
  if (!org) notFound();
  if (org.slug !== slug) permanentRedirect(`/organizations/${org.slug}/claim`);

  const claimTitle = `${locale === "bn" ? "দাবি করুন:" : "Claim"} ${org.officialName}`;

  const user = await getCurrentUser();
  if (!user) {
    return (
      <div>
        <PageHero eyebrow="Claim" icon={BadgeCheck} title={claimTitle} size="compact" />
        <div className="container max-w-xl py-12">
          <p className="text-sm text-muted-foreground">
            Please <a href="/login" className="text-jade underline">sign in</a> to claim this organization.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        eyebrow="Claim"
        icon={BadgeCheck}
        title={claimTitle}
        subtitle={
          locale === "bn"
            ? "যাচাইকৃত প্রতিনিধিরা রিভিউতে প্রকাশ্য উত্তর দিতে পারবেন। তাঁরা রিভিউ মুছতে বা স্কোর বদলাতে পারবেন না।"
            : "Verified representatives can submit public responses to reviews. They cannot delete reviews, change scores, or recover reviewer identities."
        }
        size="compact"
      />
      <div className="container max-w-xl py-12">
        <div className="animate-fade-up rounded-2xl border border-border bg-white p-6 shadow-lux">
          <ClaimForm organizationId={org.id} organizationName={org.slug} />
        </div>
      </div>
    </div>
  );
}
