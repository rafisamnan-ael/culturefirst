import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreDisplay } from "@/components/organizations/score-display";
import { pick } from "@/lib/i18n/pick";
import type { Locale } from "@/lib/i18n/dictionary";
import type { OrgScoreCard } from "@/lib/data/store";
import type { Organization, OrganizationCategory } from "@/types/domain";

export function OrganizationCard({
  organization,
  category,
  scoreCard,
  locale,
}: {
  organization: Organization;
  category?: OrganizationCategory | null;
  scoreCard?: OrgScoreCard | null;
  locale: Locale;
}) {
  return (
    <Card className="group h-full border-border/60 transition duration-300 hover:-translate-y-0.5 hover:border-jade/20 hover:shadow-soft">
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-navy to-navy-secondary text-soft shadow-card transition group-hover:shadow-soft">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <Link
              href={`/organizations/${organization.slug}`}
              className="line-clamp-2 font-semibold text-charcoal hover:text-jade"
            >
              {organization.officialName}
            </Link>
            {organization.bengaliName && (
              <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground" lang="bn">
                {organization.bengaliName}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {category && <Badge variant="jade">{pick(category.name, locale)}</Badge>}
          {organization.city && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {organization.city}
            </span>
          )}
        </div>

        <div className="mt-auto border-t border-border pt-3">
          {scoreCard ? (
            <ScoreDisplay
              score={scoreCard.score}
              eligibleCount={scoreCard.eligibleCount}
              sufficiency={scoreCard.sufficiency}
              locale={locale}
              size="sm"
            />
          ) : (
            <ScoreDisplay
              score={null}
              eligibleCount={0}
              sufficiency="insufficient"
              locale={locale}
              size="sm"
              showSample={false}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
