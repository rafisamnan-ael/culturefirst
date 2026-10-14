"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";
import type { RatingValue } from "@/types/domain";
import { ratingScale } from "@/lib/config";

export function RatingInput({
  value,
  onChange,
  label,
}: {
  value: RatingValue | null;
  onChange: (value: RatingValue) => void;
  label: string;
}) {
  const { t, locale } = useI18n();

  const isSelected = value !== null;
  const isNotObserved = value === "not_observed";

  return (
    <fieldset className="space-y-2.5">
      <legend className="sr-only">{label}</legend>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* 1-5 Star buttons */}
        <div
          role="radiogroup"
          aria-label={label}
          className="grid grid-cols-5 gap-1.5 sm:flex sm:gap-2"
        >
          {ratingScale.map((r) => {
            const active = value === r.value;
            const text = locale === "bn" ? r.bn : r.en;
            return (
              <button
                key={r.value}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={`${r.value} - ${text}`}
                onClick={() => onChange(r.value as RatingValue)}
                className={cn(
                  "group relative flex min-h-[50px] flex-col items-center justify-center rounded-lg border px-2 py-2 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade sm:min-w-[4.25rem] sm:px-3 sm:py-2.5",
                  active
                    ? "border-jade bg-jade text-white shadow-sm ring-1 ring-jade"
                    : "border-border bg-white text-charcoal hover:border-jade/50 hover:bg-jade-highlight/30 active:scale-95"
                )}
              >
                <div className="flex items-center gap-1">
                  <Star
                    className={cn(
                      "h-4 w-4 transition-transform group-hover:scale-110",
                      active ? "fill-gold text-gold" : "fill-transparent text-muted-foreground"
                    )}
                  />
                  <span className={cn("text-base font-bold", active ? "text-white" : "text-charcoal")}>
                    {r.value}
                  </span>
                </div>
                <span
                  className={cn(
                    "mt-0.5 text-[11px] font-medium leading-tight",
                    active ? "text-white/90" : "text-muted-foreground"
                  )}
                >
                  {text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Not observed / Not applicable button */}
        <button
          type="button"
          role="radio"
          aria-checked={isNotObserved}
          aria-label={t("review.notObserved")}
          onClick={() => onChange("not_observed")}
          className={cn(
            "flex min-h-[44px] items-center justify-center rounded-lg border px-3.5 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade sm:min-w-[7.5rem] sm:self-stretch",
            isNotObserved
              ? "border-charcoal bg-warmgray font-semibold text-charcoal shadow-sm ring-1 ring-charcoal"
              : "border-border/80 bg-soft/50 text-muted-foreground hover:border-border hover:bg-warmgray/60 hover:text-charcoal active:scale-95"
          )}
        >
          {t("review.notObserved")}
        </button>
      </div>
    </fieldset>
  );
}
