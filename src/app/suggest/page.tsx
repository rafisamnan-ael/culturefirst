import type { Metadata } from "next";
import { getStore } from "@/lib/data";
import { SuggestOrganizationForm } from "@/components/review/suggest-organization-form";

export const metadata: Metadata = { title: "Suggest an organization" };

export default async function SuggestPage() {
  const store = await getStore();
  const categories = (await store.listCategories()).filter((c) => !c.isFallback);

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-charcoal">Suggest an organization</h1>
      <p className="mt-2 text-sm text-muted-foreground">If an organization is missing, suggest it here. It will appear only after an administrator has verified it.</p>
      <div className="mt-6">
        <SuggestOrganizationForm categories={categories} />
      </div>
    </div>
  );
}
