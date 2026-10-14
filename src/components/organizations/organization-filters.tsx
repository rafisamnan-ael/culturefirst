"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/provider";
import { pick } from "@/lib/i18n/pick";
import type { OrganizationCategory, ReviewerRelationshipType } from "@/types/domain";

export function OrganizationFilters({
  categories,
  relationships,
  divisions,
}: {
  categories: OrganizationCategory[];
  relationships: ReviewerRelationshipType[];
  divisions: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const { t, locale } = useI18n();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`/organizations?${next.toString()}`);
  }

  const hasFilters = ["q", "category", "division", "perspective", "scores"].some((k) => params.get(k));

  return (
    <div className="space-y-4 rounded-lg border border-border bg-white p-4">
      <h2 className="text-sm font-semibold text-charcoal">{t("directory.filters")}</h2>
      <div>
        <label htmlFor="org-filter-search" className="mb-1.5 block text-xs font-medium text-muted-foreground">
          {t("directory.searchLabel")}
        </label>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const value = new FormData(e.currentTarget).get("q");
            update("q", String(value || ""));
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="org-filter-search"
              name="q"
              type="search"
              defaultValue={params.get("q") ?? ""}
              placeholder={t("common.searchPlaceholder")}
              className="h-10 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm text-charcoal placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Button type="submit">{t("common.search")}</Button>
        </form>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
          {t("common.category")}
          <Select
            value={params.get("category") ?? ""}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="">{t("common.allCategories")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {pick(c.name, locale)}
              </option>
            ))}
          </Select>
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
          {t("common.allDivisions")}
          <Select
            value={params.get("division") ?? ""}
            onChange={(e) => update("division", e.target.value)}
          >
            <option value="">{t("common.allDivisions")}</option>
            {divisions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
          {t("common.perspective")}
          <Select
            value={params.get("perspective") ?? ""}
            onChange={(e) => update("perspective", e.target.value)}
          >
            <option value="">{t("common.allPerspectives")}</option>
            {relationships.map((r) => (
              <option key={r.id} value={r.slug}>
                {pick(r.name, locale)}
              </option>
            ))}
          </Select>
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
          {t("directory.ratingCoverage")}
          <Select
            value={params.get("scores") ?? ""}
            onChange={(e) => update("scores", e.target.value)}
          >
            <option value="">{t("directory.all")}</option>
            <option value="1">{t("directory.hasScores")}</option>
          </Select>
        </label>
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/organizations")}
          className="text-muted-foreground"
        >
          <X className="h-3.5 w-3.5" />
          {t("directory.clearFilters")}
        </Button>
      )}
    </div>
  );
}
