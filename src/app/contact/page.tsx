import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/static-page";
import { ContactForm } from "@/components/contact/contact-form";
import { getStore } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the CultureFirst team with questions, corrections, privacy or legal requests.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const orgParam = typeof sp.org === "string" ? sp.org : undefined;
  const reason = typeof sp.reason === "string" ? sp.reason : undefined;

  let orgId: string | undefined;
  let orgName: string | undefined;
  if (orgParam) {
    const store = await getStore();
    const org =
      (await store.getOrganizationBySlug(orgParam)) ?? (await store.getOrganizationById(orgParam));
    if (org) {
      orgId = org.slug;
      orgName = org.bengaliName || org.officialName;
    }
  }

  return (
    <StaticPage slug="contact">
      <div className="mt-8">
        <ContactForm defaultTopic={reason} defaultOrgId={orgId} defaultOrgName={orgName} />
      </div>
    </StaticPage>
  );
}
