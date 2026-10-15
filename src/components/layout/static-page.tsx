import Link from "next/link";
import { AlertTriangle, Sparkles } from "lucide-react";
import { staticPages } from "@/content/pages";
import { getServerT } from "@/lib/i18n/server";
import { ratingScale } from "@/lib/config";
import { PageHero } from "@/components/layout/page-hero";

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
    <div className="pb-20">
      <PageHero
        eyebrow={page.title[locale]}
        icon={Sparkles}
        title={page.title[locale]}
        subtitle={page.intro[locale]}
      />

      <div className="container max-w-3xl py-12">
        {showThresholds && (
          <div className="mb-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/40 bg-white shadow-soft p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal">
                {locale === "bn" ? "রেটিং স্কেল" : "Rating scale"}
              </h2>
              <ul className="mt-4 space-y-2 text-sm">
                {ratingScale.map((r) => (
                  <li key={r.value} className="flex items-center justify-between">
                    <span className="text-charcoal/90 font-medium">{locale === "bn" ? r.bn : r.en}</span>
                    <span className="tabular-nums font-bold text-jade bg-jade-highlight px-2 rounded">{r.value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border/40 bg-white shadow-soft p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal">
                {locale === "bn" ? "প্রকাশের নিয়ম" : "Publication rules"}
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-jade font-bold">0–4:</span> {locale === "bn" ? "“পর্যাপ্ত তথ্য নেই”।" : "“Insufficient data”."}</li>
                <li className="flex gap-2"><span className="text-jade font-bold">5–19:</span> {locale === "bn" ? "সাময়িক স্কোর ও সতর্কীকরণ।" : "Provisional score with disclosure."}</li>
                <li className="flex gap-2"><span className="text-jade font-bold">20+:</span> {locale === "bn" ? "নিয়মিত স্কোর।" : "Regular score with sample size."}</li>
              </ul>
            </div>
          </div>
        )}

        {children}

        <div className="mt-10 space-y-12">
          {page.sections.map((section) => (
            <section key={section.heading.en}>
              <h2 className="text-2xl font-bold text-charcoal">{section.heading[locale]}</h2>
              {section.body.map((p, i) => (
                <p key={i} className="mt-4 text-base leading-relaxed text-muted-foreground">
                  {p[locale]}
                </p>
              ))}
              {section.legal && (
                <p className="mt-6 flex items-start gap-3 rounded-xl border border-gold/40 bg-gold/5 p-4 text-sm text-[#7a5f2e]">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  {locale === "bn"
                    ? "এই বিষয়টি প্রকাশের আগে যোগ্য আইনি পর্যালোচনা প্রয়োজন।"
                    : "This item requires qualified legal review before public launch."}
                </p>
              )}
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-border/40 bg-warmgray/50 p-8">
          <p className="text-sm text-charcoal font-semibold">
            {locale === "bn" ? "প্রশ্ন আছে?" : "Have a question?"}{" "}
            <Link href="/contact" className="text-jade hover:underline font-bold">
              {t("nav.contact")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
