"use client";

import { cn } from "@/lib/utils";
import { pick } from "@/lib/i18n/pick";
import type { Locale } from "@/lib/i18n/dictionary";
import type { ReviewerRelationshipType } from "@/types/domain";

export function PerspectiveTabs({
  relationships,
  activeId,
  onChange,
  locale,
  counts,
}: {
  relationships: ReviewerRelationshipType[];
  activeId: string | null;
  onChange: (id: string) => void;
  locale: Locale;
  counts?: Record<string, number>;
}) {
  if (relationships.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Reviewer perspective">
      {relationships.map((rel) => {
        const active = rel.id === activeId;
        const count = counts?.[rel.id] ?? 0;
        return (
          <button
            key={rel.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(rel.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors",
              active
                ? "border-navy bg-navy text-soft"
                : "border-border bg-white text-charcoal hover:bg-warmgray",
            )}
          >
            <span>{pick(rel.name, locale)}</span>
            {counts && (
              <span className={cn("text-xs", active ? "text-soft/70" : "text-muted-foreground")}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
