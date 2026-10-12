import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ClaimForm } from "@/components/review/claim-form";
import { getStore } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Claim organization",
  robots: { index: false, follow: false },
};

export default async function ClaimPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await getStore();
  const org = await store.getOrganizationBySlug(slug);
  if (!org) notFound();

  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="container max-w-xl py-12">
        <p className="text-sm text-muted-foreground">
          Please <a href="/login" className="text-jade underline">sign in</a> to claim this organization.
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-xl py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-charcoal">Claim {org.officialName}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Verified representatives can submit public responses to reviews. They cannot delete reviews, change scores, or recover reviewer identities.
      </p>
      <div className="mt-8">
        <ClaimForm organizationId={org.id} organizationName={org.slug} />
      </div>
    </div>
  );
}
