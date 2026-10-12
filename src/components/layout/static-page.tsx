import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { staticPages } from "@/content/pages";
import { getServerT } from "@/lib/i18n/server";
import { ratingScale } from "@/lib/config";

export async function StaticPage({
  slug,
  showThresholds = false,
  children,
}: {
  slug: string;
  showThresholds?: boolean;
  children?: React.ReactNode;
}) {
  const { t, locale } = await getServerT();
  const page = staticPages[slug];
  if (!page) return null;

  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-charcoal">{page.title[locale]}</h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">{page.intro[locale]}</p>

      {showThresholds && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-white p-5">
            <h2 className="text-sm font-semibold text-charcoal">
              {locale === "bn" ? "রেটিং স্কেল" : "Rating scale"}
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {ratingScale.map((r) => (
                <li key={r.value} className="flex items-center justify-between">
                  <span className="text-charcoal/90">{locale === "bn" ? r.bn : r.en}</span>
                  <span className="tabular-nums text-muted-foreground">{r.value}</span>
                </li>
              ))}
              <li className="flex items-center justify-between border-t border-border pt-1.5">
                <span className="text-charcoal/90">{t("review.notObserved")}</span>
                <span className="text-muted-foreground">—</span>
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-white p-5">
            <h2 className="text-sm font-semibold text-charcoal">
              {locale === "bn" ? "প্রকাশের নিয়ম" : "Publication rules"}
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <li>{locale === "bn" ? "০–৪ যোগ্য রিভিউ: “পর্যাপ্ত তথ্য নেই”।" : "0–4 eligible reviews: “Insufficient data”."}</li>
              <li>{locale === "bn" ? "৫–১৯: সাময়িক স্কোর ও সতর্কীকরণ।" : "5–19: provisional score with a disclosure."}</li>
              <li>{locale === "bn" ? "২০+: নিয়মিত স্কোর, নমুনা আকারসহ।" : "20+: regular score with sample size shown."}</li>
            </ul>
          </div>
        </div>
      )}

      {children}

      <div className="mt-10 space-y-8">
        {page.sections.map((section) => (
          <section key={section.heading.en}>
            <h2 className="text-xl font-semibold text-charcoal">{section.heading[locale]}</h2>
            {section.body.map((p, i) => (
              <p key={i} className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {p[locale]}
              </p>
            ))}
            {section.legal && (
              <p className="mt-3 flex items-start gap-2 rounded-md border border-gold/40 bg-gold/10 p-3 text-xs text-[#7a5f2e]">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {locale === "bn"
                  ? "এই বিষয়টি প্রকাশের আগে যোগ্য আইনি পর্যালোচনা প্রয়োজন।"
                  : "This item requires qualified legal review before public launch."}
              </p>
            )}
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-lg border border-border bg-white p-5">
        <p className="text-sm text-muted-foreground">
          {locale === "bn" ? "প্রশ্ন আছে?" : "Have a question?"}{" "}
          <Link href="/contact" className="font-medium text-jade hover:underline">
            {t("nav.contact")}
          </Link>
        </p>
      </div>
    </div>
  );
}
