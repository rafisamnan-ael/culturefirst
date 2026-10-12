import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/dictionary";
import { pick } from "@/lib/i18n/pick";
import type { OrganizationResponse, ReviewerRelationshipType, Review } from "@/types/domain";

export function ReviewCard({
  review,
  relationship,
  responses,
  locale,
}: {
  review: Review;
  relationship?: ReviewerRelationshipType | null;
  responses?: OrganizationResponse[];
  locale: Locale;
}) {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-semibold text-soft">
              {(review.displayName || "A").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal">{review.displayName || "Anonymous"}</p>
              <p className="text-xs text-muted-foreground">
                {relationship ? pick(relationship.name, locale) : "—"}
                {review.experiencePeriod ? ` · ${review.experiencePeriod}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {review.score !== null && (
              <Badge variant="jade" className="tabular-nums">
                {review.score.toFixed(2)} / 5
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDate(review.publishedAt || review.createdAt, locale)}
            </span>
          </div>
        </div>

        {review.title && <h4 className="font-semibold text-charcoal">{review.title}</h4>}
        <p className="whitespace-pre-line text-sm leading-relaxed text-charcoal/90" lang={review.language === "bn" ? "bn" : undefined}>
          {review.body}
        </p>

        {responses && responses.length > 0 && (
          <div className="mt-3 space-y-2 border-l-2 border-jade pl-4">
            {responses.map((r) => (
              <div key={r.id}>
                <p className="text-xs font-semibold uppercase tracking-wide text-jade">
                  {locale === "bn" ? "প্রতিষ্ঠানের প্রতিক্রিয়া" : "Organization response"}
                </p>
                <p className="text-sm text-charcoal/90">{r.body}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
