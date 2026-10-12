import Link from "next/link";
import { Building2, HeartHandshake, Landmark, GraduationCap, School, Banknote, Store, CircleHelp, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { pick } from "@/lib/i18n/pick";
import type { Locale } from "@/lib/i18n/dictionary";
import type { OrganizationCategory } from "@/types/domain";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  building: Building2,
  hospital: Stethoscope,
  graduation: GraduationCap,
  landmark: Landmark,
  "heart-handshake": HeartHandshake,
  school: School,
  banknote: Banknote,
  store: Store,
  "circle-help": CircleHelp,
};

export function CategoryCard({
  category,
  count,
  locale,
}: {
  category: OrganizationCategory;
  count?: number;
  locale: Locale;
}) {
  const Icon = icons[category.icon] ?? Building2;
  return (
    <Link href={`/categories/${category.slug}`} className="block">
      <Card className="h-full transition-shadow hover:shadow-elevated">
        <CardContent className="flex h-full flex-col gap-3 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-jade-highlight text-navy">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-charcoal">{pick(category.name, locale)}</h3>
            <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
              {pick(category.description, locale)}
            </p>
          </div>
          {count !== undefined && (
            <p className="mt-auto text-xs font-medium text-jade">
              {count} {locale === "bn" ? "প্রতিষ্ঠান" : "organizations"}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
