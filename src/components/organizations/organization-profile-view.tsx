"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ExternalLink, Flag, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreDisplay, scoreColor, type Sufficiency } from "@/components/organizations/score-display";
import { ParameterBar } from "@/components/organizations/parameter-bar";
import { PerspectiveTabs } from "@/components/organizations/perspective-tabs";
import { ReviewCard } from "@/components/organizations/review-card";
import { useI18n } from "@/lib/i18n/provider";
import { pick } from "@/lib/i18n/pick";
import type { Bilingual, OrganizationResponse, Review } from "@/types/domain";

export interface ProfileParameter {
  id: string;
  name: Bilingual;
  weight: number;
  score: number | null;
}

export interface ProfilePerspective {
  relationshipId: string;
  name: Bilingual;
  score: number | null;
  eligibleCount: number;
  sufficiency: Sufficiency;
  questionnaireAvailable: boolean;
  distribution: Record<string, number>;
  parameters: ProfileParameter[];
  strengths: ProfileParameter[];
  concerns: ProfileParameter[];
  reviews: Review[];
  responsesByReview: Record<string, OrganizationResponse[]>;
}

export function OrganizationProfileView({
  slug,
  perspectives,
  googleMapsUrl,
}: {
  slug: string;
  perspectives: ProfilePerspective[];
  googleMapsUrl: string | null;
}) {
  const { t, locale } = useI18n();
  const [activeId, setActiveId] = useState<string | null>(perspectives[0]?.relationshipId ?? null);
  const active = useMemo(
    () => perspectives.find((p) => p.relationshipId === activeId) ?? perspectives[0] ?? null,
    [perspectives, activeId],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of perspectives) c[p.relationshipId] = p.eligibleCount;
    return c;
  }, [perspectives]);

  const chartData = active
    ? [1, 2, 3, 4, 5].map((n) => ({
        rating: String(n),
        count: active.distribution[String(n)] ?? 0,
      }))
    : [];

  return (
    <div className="space-y-8">
      {/* Perspective tabs */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("common.perspective")}
        </h2>
        <PerspectiveTabs
          relationships={perspectives.map((p) => ({ id: p.relationshipId, name: p.name } as never))}
          activeId={activeId}
          onChange={setActiveId}
          locale={locale}
          counts={counts}
        />
      </section>

      {!active ? (
        <p className="text-sm text-muted-foreground">{t("org.noReviews")}</p>
      ) : !active.questionnaireAvailable ? (
        <div className="rounded-lg border border-border bg-white p-6">
          <p className="text-sm text-muted-foreground">{t("org.questionnaireUnavailable")}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("org.cultureScore")} · {pick(active.name, locale)}
                </p>
                <div className="mt-4">
                  <ScoreDisplay
                    score={active.score}
                    eligibleCount={active.eligibleCount}
                    sufficiency={active.sufficiency}
                    locale={locale}
                    size="lg"
                  />
                </div>
                {active.sufficiency === "provisional" && (
                  <p className="mt-4 rounded-md bg-gold/10 p-3 text-xs text-[#7a5f2e]">
                    {t("org.lowSample")}
                  </p>
                )}
                {active.score !== null && (
                  <div className="mt-5 h-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F0" vertical={false} />
                        <XAxis dataKey="rating" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis hide allowDecimals={false} />
                        <Tooltip cursor={{ fill: "#EEF1F0" }} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry) => (
                            <Cell
                              key={entry.rating}
                              fill={
                                Number(entry.rating) >= 4 ? "#4D8E83" : Number(entry.rating) >= 3 ? "#203D52" : "#C5A46A"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardContent className="p-6">
                <h3 className="font-semibold text-charcoal">{t("org.parameterBreakdown")}</h3>
                <div className="mt-4 space-y-4">
                  {active.parameters.map((p) => (
                    <ParameterBar key={p.id} label={pick(p.name, locale)} score={p.score} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {(active.strengths.length > 0 || active.concerns.length > 0) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {active.strengths.length > 0 && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-jade">{t("org.strengths")}</h3>
                    <ul className="mt-2 space-y-1 text-sm text-charcoal/90">
                      {active.strengths.map((p) => (
                        <li key={p.id} className="flex items-center justify-between gap-3">
                          <span>{pick(p.name, locale)}</span>
                          <span className={`tabular-nums ${scoreColor(p.score)}`}>{p.score?.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {active.concerns.length > 0 && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-destructive">{t("org.concerns")}</h3>
                    <ul className="mt-2 space-y-1 text-sm text-charcoal/90">
                      {active.concerns.map((p) => (
                        <li key={p.id} className="flex items-center justify-between gap-3">
                          <span>{pick(p.name, locale)}</span>
                          <span className={`tabular-nums ${scoreColor(p.score)}`}>{p.score?.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-charcoal">{t("org.recentReviews")}</h3>
              <Button asChild size="sm">
                <Link href={`/organizations/${slug}/review`}>
                  <PenLine className="h-4 w-4" />
                  {t("nav.writeReview")}
                </Link>
              </Button>
            </div>
            {active.reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("org.noReviews")}</p>
            ) : (
              <div className="space-y-4">
                {active.reviews.map((r) => (
                  <ReviewCard
                    key={r.id}
                    review={r}
                    relationship={{ id: active.relationshipId, name: active.name } as never}
                    responses={active.responsesByReview[r.id]}
                    locale={locale}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Google + report */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-charcoal">
              {googleMapsUrl ? t("org.viewOnGoogle") : t("org.googleSearch")}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">{t("org.googleSeparate")}</p>
            <div className="mt-3">
              <Button asChild variant="outline" size="sm">
                <a
                  href={
                    googleMapsUrl ??
                    `https://www.google.com/search?q=${encodeURIComponent(slug + " Bangladesh")}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  {googleMapsUrl ? t("org.viewOnGoogle") : t("org.googleSearch")}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-charcoal">{t("org.reportIncorrect")}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {locale === "bn"
                ? "তথ্য ভুল হলে প্রশাসনকে জানান।"
                : "Tell our administrators if directory information is incorrect."}
            </p>
            <div className="mt-3">
              <Button asChild variant="outline" size="sm">
                <Link href={`/contact?org=${encodeURIComponent(slug)}&reason=incorrect-info`}>
                  <Flag className="h-4 w-4" />
                  {t("org.reportIncorrect")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
