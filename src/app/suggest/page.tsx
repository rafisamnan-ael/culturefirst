import type { Metadata } from "next";
import { Lightbulb } from "lucide-react";
import { getStore } from "@/lib/data";
import { getServerT } from "@/lib/i18n/server";
import { SuggestOrganizationForm } from "@/components/review/suggest-organization-form";
import { PageHero } from "@/components/layout/page-hero";

export const metadata: Metadata = { title: "Suggest an organization" };

export default async function SuggestPage() {
  const store = await getStore();
  const { locale } = await getServerT();
  const categories = (await store.listCategories()).filter((c) => !c.isFallback);

  return (
    <div>
      <PageHero
        eyebrow={locale === "bn" ? "প্রস্তাব" : "Suggest"}
        icon={Lightbulb}
        title={locale === "bn" ? "একটি প্রতিষ্ঠান প্রস্তাব করুন" : "Suggest an organization"}
        subtitle={
          locale === "bn"
            ? "কোনো প্রতিষ্ঠান না থাকলে এখানে প্রস্তাব করুন। অ্যাডমিন যাচাই করার পরেই এটি তালিকায় আসবে।"
            : "If an organization is missing, suggest it here. It will appear only after an administrator has verified it."
        }
        size="compact"
      />
      <div className="container max-w-2xl py-12">
        <div className="animate-fade-up rounded-2xl border border-border bg-white p-6 shadow-lux">
          <SuggestOrganizationForm categories={categories} />
        </div>
      </div>
    </div>
  );
}
