import { cn } from "@/lib/utils";

export function ParameterBar({
  label,
  score,
  count,
}: {
  label: string;
  score: number | null;
  count?: number;
}) {
  const pct = score === null ? 0 : (score / 5) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-charcoal">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {score === null ? "—" : score.toFixed(2)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-warmgray">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            score === null ? "bg-warmgray" : score >= 4 ? "bg-jade" : score >= 3 ? "bg-navy" : score >= 2 ? "bg-gold" : "bg-destructive",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {count !== undefined && (
        <p className="text-xs text-muted-foreground">
          {count} {count === 1 ? "rating" : "ratings"}
        </p>
      )}
    </div>
  );
}
