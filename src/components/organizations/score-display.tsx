import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/lib/i18n/dictionary";
import { translate } from "@/lib/i18n/dictionary";

export type Sufficiency = "insufficient" | "provisional" | "published";

export function scoreColor(score: number | null): string {
  if (score === null) return "text-muted-foreground";
  if (score >= 4) return "text-jade";
  if (score >= 3) return "text-navy";
  if (score >= 2) return "text-gold";
  return "text-destructive";
}

export function ScoreDisplay({
  score,
  eligibleCount,
  sufficiency,
  locale,
  size = "md",
  showSample = true,
}: {
  score: number | null;
  eligibleCount: number;
  sufficiency: Sufficiency;
  locale: Locale;
  size?: "sm" | "md" | "lg";
  showSample?: boolean;
}) {
  const t = (k: string) => translate(k, locale);
  const sizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-5xl",
  } as const;

  if (sufficiency === "insufficient" || score === null) {
    return (
      <div className="flex flex-col gap-1">
        <span className={cn("font-semibold text-muted-foreground", sizes[size])}>—</span>
        <span className="text-xs font-medium text-muted-foreground">{t("org.insufficient")}</span>
        {showSample && (
          <span className="text-xs text-muted-foreground">{eligibleCount} {t("org.eligibleReviews")}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-1.5">
        <span className={cn("font-semibold tabular-nums", scoreColor(score), sizes[size])}>
          {score.toFixed(2)}
        </span>
        <span className="text-sm text-muted-foreground">/ 5</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {sufficiency === "provisional" && (
          <Badge variant="gold">{t("org.provisional")}</Badge>
        )}
        {showSample && (
          <span className="text-xs text-muted-foreground">
            {eligibleCount} {t("org.eligibleReviews")}
          </span>
        )}
      </div>
    </div>
  );
}
