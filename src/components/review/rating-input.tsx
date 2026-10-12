"use client";

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
  const options: Array<{ value: RatingValue; text: string; short: string }> = [
    ...ratingScale.map((r) => ({
      value: r.value as RatingValue,
      text: locale === "bn" ? r.bn : r.en,
      short: String(r.value),
    })),
    { value: "not_observed", text: t("review.notObserved"), short: "N/A" },
  ];

  return (
    <fieldset className="space-y-2">
      <legend className="sr-only">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt.value;
          const isNa = opt.value === "not_observed";
          return (
            <button
              key={String(opt.value)}
              type="button"
              aria-pressed={active}
              title={opt.text}
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex min-w-[2.75rem] flex-col items-center justify-center rounded-md border px-3 py-2 text-sm transition-colors",
                isNa && "min-w-[5.5rem]",
                active
                  ? "border-jade bg-jade-highlight text-navy"
                  : "border-border bg-white text-charcoal hover:bg-warmgray",
              )}
            >
              <span className="font-semibold">{opt.short}</span>
              {!isNa && <span className="hidden text-[10px] leading-tight text-muted-foreground sm:block">{opt.text}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
