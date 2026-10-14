import type { Metadata } from "next";
import { CategoryCard } from "@/components/organizations/category-card";
import { getStore } from "@/lib/data";
import { getServerT } from "@/lib/i18n/server";
import { LayoutGrid, Sparkles } from "lucide-react";

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
      {/* Colorful Header */}
      <section className="relative overflow-hidden border-b border-border bg-mesh text-soft py-16 md:py-24">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-[400px] w-[400px] rounded-full bg-jade/10 blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 h-[350px] w-[350px] rounded-full bg-navy-accent/20 blur-[100px]" />
        </div>
        
        <div className="container relative z-10 max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-bold uppercase tracking-widest text-jade-highlight">
            <Sparkles className="h-3.5 w-3.5" />
            {t("nav.categories")}
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {t("nav.categories")}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-soft/80 sm:text-xl">
            {locale === "bn"
              ? "প্রতিটি ধরনের প্রতিষ্ঠানের সংস্কৃতি ভিন্ন। কালচারফার্স্ট প্রতিটি ক্যাটাগরির জন্য আলাদা মূল্যায়ন মানদণ্ড ব্যবহার করে।"
              : "Different organizations have different cultures. CultureFirst measures each category with its own criteria rather than one universal questionnaire."}
          </p>
        </div>
      </section>

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
