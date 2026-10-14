import { Star } from "lucide-react";
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

export function ScoreStars({
  score,
  size = "md",
}: {
  score: number;
  size?: "sm" | "md" | "lg";
}) {
  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size];

  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill =
          score >= star
            ? "fill-gold text-gold"
            : score >= star - 0.5
            ? "fill-gold/50 text-gold"
            : "fill-transparent text-border";
        return <Star key={star} className={cn(iconSizes, fill)} />;
      })}
    </div>
  );
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

  if (eligibleCount === 0) {
    return (
      <div className="flex flex-col gap-1">
        <span className={cn("font-semibold text-muted-foreground", sizes[size])}>—</span>
        <span className="text-xs font-medium text-muted-foreground">{t("org.noReviewsYet")}</span>
      </div>
    );
  }

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
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-2">
        <span className={cn("font-bold tabular-nums tracking-tight", scoreColor(score), sizes[size])}>
          {score.toFixed(2)}
        </span>
        <span className="text-sm font-medium text-muted-foreground">/ 5</span>
        <ScoreStars score={score} size={size} />
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
