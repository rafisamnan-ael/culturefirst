import type { Metadata } from "next";
import { CategoryCard } from "@/components/organizations/category-card";
import { getStore } from "@/lib/data";
import { getServerT } from "@/lib/i18n/server";
import { Sparkles } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categories",
  description: "Explore organization categories and the culture criteria measured for each.",
};

export default async function CategoriesPage() {
  const { t, locale } = await getServerT();
  const store = await getStore();
  const categories = await store.listCategories();
  const allOrgs = await store.listOrganizations({ pageSize: 1000 });
  const counts = new Map<string, number>();
  for (const o of allOrgs.items) counts.set(o.categoryId, (counts.get(o.categoryId) ?? 0) + 1);

  return (
    <div className="pb-20">
      <PageHero
        eyebrow={t("nav.categories")}
        icon={Sparkles}
        title={t("nav.categories")}
        subtitle={
          locale === "bn"
            ? "প্রতিটি ধরনের প্রতিষ্ঠানের সংস্কৃতি ভিন্ন। কালচারফার্স্ট প্রতিটি ক্যাটাগরির জন্য আলাদা মূল্যায়ন মানদণ্ড ব্যবহার করে।"
            : "Different organizations have different cultures. CultureFirst measures each category with its own criteria rather than one universal questionnaire."
        }
      />

      <div className="container py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} count={counts.get(c.id) ?? 0} locale={locale} />
          ))}
        </div>
      </div>
    </div>
  );
}
