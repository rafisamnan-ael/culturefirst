"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Info, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RatingInput } from "@/components/review/rating-input";
import { useI18n } from "@/lib/i18n/provider";
import { pick } from "@/lib/i18n/pick";
import { useToast } from "@/components/ui/toast";
import { submitReview } from "@/lib/actions/reviews";
import { calculateReviewScore, toAnswerInputs } from "@/lib/scoring";
import { scoreThresholds } from "@/lib/config";
import { cn } from "@/lib/utils";
import type { Bilingual, OrganizationBranch, RatingValue } from "@/types/domain";

export interface WizardQuestion {
  id: string;
  text: Bilingual;
  required: boolean;
}
export interface WizardParameter {
  id: string;
  key: string;
  name: Bilingual;
  weight: number;
  questions: WizardQuestion[];
}
export interface WizardBundle {
  versionId: string;
  version: number;
  parameters: WizardParameter[];
}
export interface WizardRelationship {
  id: string;
  name: Bilingual;
}

const DRAFT_KEY = "cf_review_draft";

export function ReviewWizard({
  organization,
  branches,
  relationships,
  bundles,
}: {
  organization: { id: string; slug: string; officialName: string; bengaliName: string | null };
  branches: OrganizationBranch[];
  relationships: WizardRelationship[];
  bundles: Record<string, WizardBundle>;
}) {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const router = useRouter();

  const [stage, setStage] = useState(1);
  const [relationshipId, setRelationshipId] = useState<string>(relationships[0]?.id ?? "");
  const [branchId, setBranchId] = useState<string>("");
  const [period, setPeriod] = useState("");
  const [answers, setAnswers] = useState<Record<string, RatingValue>>({});
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bundle = bundles[relationshipId];

  const stages = [
    t("review.step2"), // About experience
    t("review.step4"), // Rate
    t("review.step5"), // Write & Submit
  ];

  // Draft preservation within the session (privacy-safe: sessionStorage only).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`${DRAFT_KEY}_${organization.slug}`);
      if (raw) {
        const d = JSON.parse(raw);
        setRelationshipId(d.relationshipId ?? relationships[0]?.id ?? "");
        setBranchId(d.branchId ?? "");
        setPeriod(d.period ?? "");
        setAnswers(d.answers ?? {});
        setTitle(d.title ?? "");
        setBody(d.body ?? "");
        setDisplayName(d.displayName ?? "");
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        `${DRAFT_KEY}_${organization.slug}`,
        JSON.stringify({ branchId, relationshipId, period, answers, title, body, displayName }),
      );
    } catch {
      /* ignore */
    }
  }, [branchId, relationshipId, period, answers, title, body, displayName, organization.slug]);

  const liveScore = useMemo(() => {
    if (!bundle) return null;
    return calculateReviewScore(
      toAnswerInputs(
        bundle.parameters.map((p, i) => ({
          id: String(i),
          reviewId: "",
          parameterId: p.id,
          value: answers[p.id] ?? "not_observed",
        })),
      ),
      bundle.parameters,
      scoreThresholds,
    );
  }, [bundle, answers]);

  const answeredCount = bundle?.parameters.filter(p => answers[p.id] !== undefined && answers[p.id] !== null).length ?? 0;
  const totalQuestions = bundle?.parameters.length ?? 0;

  function canProceed(): boolean {
    if (stage === 1) return !!relationshipId && !!period;
    if (stage === 2) return !!liveScore?.eligible;
    return true;
  }

  async function handleSubmit() {
    if (!bundle) return;
    if (!agreed) {
      setError(locale === "bn" ? "দয়া করে কমিউনিটি নির্দেশিকা মেনে নিন।" : "Please agree to the community guidelines.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const payload = {
      organizationId: organization.id,
      branchId: branchId || null,
      relationshipTypeId: relationshipId,
      title: title || null,
      body,
      experiencePeriod: period || null,
      displayName: displayName || null,
      language: locale,
      answers: bundle.parameters.map((p) => ({ parameterId: p.id, value: answers[p.id] ?? "not_observed" })),
    };
    const result = await submitReview(payload);
    setSubmitting(false);
    if (!result.ok) {
      const messages: Record<string, string> = {
        RATE_LIMITED: "You have submitted too many reviews recently. Please try again later.",
        DUPLICATE_REVIEW: "You already have an active review for this organization and perspective.",
        NO_TEMPLATE: "No rating template is configured for this perspective yet.",
      };
      setError(messages[result.error] ?? result.error);
      return;
    }
    try {
      sessionStorage.removeItem(`${DRAFT_KEY}_${organization.slug}`);
    } catch {
      /* ignore */
    }
    toast({ kind: "success", title: t("review.submitted") });
    router.push("/dashboard");
  }

  return (
    <div className="space-y-6">
      {/* Organization Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-charcoal">{organization.officialName}</h1>
        {organization.bengaliName && (
          <p className="text-lg text-muted-foreground" lang="bn">{organization.bengaliName}</p>
        )}
      </div>

      {/* Progress */}
      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider font-semibold">
          <span>{t("review.progress")} {stage} / 3</span>
          <span className="text-jade">{stages[stage - 1]}</span>
        </div>
        <Progress value={(stage / 3) * 100} className="h-2" />
      </div>

      <Card className="border-border/60 shadow-soft">
        <CardContent className="p-6">
          {stage === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-4">
                <Label className="text-base font-semibold">{t("review.relationshipQuestion")}</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {relationships.map((r) => {
                    const isSelected = relationshipId === r.id;
                    const available = !!bundles[r.id];
                    return (
                      <button
                        key={r.id}
                        type="button"
                        disabled={!available}
                        onClick={() => {
                          if (available) {
                            setRelationshipId(r.id);
                            // Reset answers if perspective changes
                            if (relationshipId !== r.id) setAnswers({});
                          }
                        }}
                        className={cn(
                          "relative flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all duration-200",
                          !available && "opacity-50 grayscale cursor-not-allowed",
                          isSelected 
                            ? "border-jade bg-jade-highlight shadow-sm ring-1 ring-jade/20" 
                            : "border-border bg-white hover:border-jade/30 hover:bg-warmgray/30"
                        )}
                      >
                        <span className={cn("text-sm font-bold", isSelected ? "text-navy" : "text-charcoal")}>
                          {pick(r.name, locale)}
                        </span>
                        {!available && (
                          <span className="mt-1 text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                            {t("org.tabInsufficient")}
                          </span>
                        )}
                        {isSelected && (
                          <div className="absolute right-3 top-3 rounded-full bg-jade p-1">
                            <Check className="h-3 w-3 text-white" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="period" className="text-base font-semibold">{t("review.periodQuestion")}</Label>
                <Input
                  id="period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder={t("review.periodPreset")}
                  className="h-12 border-2 focus-visible:ring-jade"
                />
                <p className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="h-3.5 w-3.5 shrink-0 text-jade mt-0.5" />
                  {locale === "bn"
                    ? "ব্যক্তিগত পরিচয় রক্ষার জন্য মোটামুটি সময়কালই যথেষ্ট।"
                    : "An approximate period is sufficient; we avoid granular details that could identify you."}
                </p>
              </div>
            </div>
          )}

          {stage === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-charcoal">{t("review.step4")}</h2>
                  <p className="text-sm text-muted-foreground">
                    {answeredCount} {locale === "bn" ? "টির উত্তর দেওয়া হয়েছে" : "of"} {totalQuestions} {locale === "bn" ? "প্রশ্ন" : "questions answered"}
                  </p>
                </div>
                {liveScore?.eligible && (
                   <div className="flex items-center gap-1.5 rounded-full bg-jade/10 px-3 py-1 text-jade">
                     <Star className="h-4 w-4 fill-current" />
                     <span className="text-sm font-bold">{liveScore.score?.toFixed(2)}</span>
                   </div>
                )}
              </div>

              {!bundle ? (
                <div className="rounded-lg bg-warmgray/30 p-8 text-center">
                  <p className="text-sm text-muted-foreground">{t("org.noReviews")}</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {bundle.parameters.map((p) => (
                    <div key={p.id} className="py-6 first:pt-0 last:pb-0">
                      <div className="mb-4">
                        <Label className="text-base font-bold text-charcoal">{pick(p.name, locale)}</Label>
                        {p.questions.map((q) => (
                          <p key={q.id} className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {pick(q.text, locale)}
                          </p>
                        ))}
                      </div>
                      <RatingInput
                        label={pick(p.name, locale)}
                        value={answers[p.id] ?? null}
                        onChange={(v) => setAnswers((prev) => ({ ...prev, [p.id]: v }))}
                      />
                    </div>
                  ))}
                </div>
              )}

              {liveScore && !liveScore.eligible && (
                <div className="rounded-xl bg-gold/10 p-4 border border-gold/20">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 shrink-0 text-gold" />
                    <div>
                      <p className="text-sm font-semibold text-[#7a5f2e]">{locale === "bn" ? "আরও রেটিং প্রয়োজন" : "More ratings needed"}</p>
                      <p className="mt-1 text-xs text-[#7a5f2e]/80 leading-relaxed">
                        {t("review.needMore")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {stage === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-bold">{t("review.titleLabel")} <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input 
                    id="title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    maxLength={140} 
                    className="h-11 border-2"
                    placeholder={locale === "bn" ? "আপনার অভিজ্ঞতার একটি সংক্ষিপ্ত শিরোনাম দিন" : "Give your experience a short headline"} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body" className="text-base font-bold">{t("review.bodyLabel")} <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    maxLength={5000}
                    rows={6}
                    className="border-2 resize-none"
                    placeholder={locale === "bn" ? "কী ভালো ছিল? কী আরও উন্নত করা যেত? আপনার অভিজ্ঞতা বিস্তারিত লিখুন..." : "What went well? What could be improved? Write about your experience..."}
                  />
                  <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    <span>{t("review.bodyHelp")}</span>
                    <span className={cn(body.length > 4500 ? "text-destructive" : "")}>{body.length} / 5000</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/60">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-base font-bold">{t("review.displayNameLabel")} <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={60}
                    className="h-11 border-2"
                    placeholder={locale === "bn" ? "যেমন: একজন বর্তমান কর্মী" : "e.g. A current employee"}
                  />
                  <p className="text-xs text-muted-foreground">{t("review.displayNameHelp")}</p>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal">{t("review.rulesTitle")}</h3>
                  <ul className="grid gap-2 text-sm text-muted-foreground">
                    {[
                      locale === "bn" ? "শুধু বাস্তব অভিজ্ঞতা লিখুন।" : "Write only about firsthand experience.",
                      locale === "bn" ? "ব্যক্তিগত তথ্য (নাম, ইমেইল) প্রকাশ করবেন না।" : "No private info (names, emails).",
                      locale === "bn" ? "হুমকি বা হয়রানি নিষিদ্ধ।" : "No threats or harassment.",
                    ].map((rule, idx) => (
                      <li key={idx} className="flex gap-2">
                        <Check className="h-4 w-4 shrink-0 text-jade mt-0.5" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>

                  <label className={cn(
                    "flex items-start gap-4 rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer",
                    agreed ? "border-jade bg-jade-highlight shadow-sm" : "border-border bg-white hover:border-jade/30"
                  )}>
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => {
                        setAgreed(e.target.checked);
                        if (e.target.checked) setError(null);
                      }}
                      className="mt-1 h-5 w-5 rounded border-2 border-border text-jade focus:ring-jade"
                    />
                    <span className="text-sm font-medium leading-tight text-charcoal">{t("review.agree")}</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-lg bg-destructive/10 p-4 text-sm font-medium text-destructive animate-in shake duration-300">
               <Info className="h-5 w-5 shrink-0" />
               <p>{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4 pt-2">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => setStage((s) => Math.max(1, s - 1))} 
          disabled={stage === 1 || submitting}
          className="flex-1 h-12 rounded-xl border-2 font-bold"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          {t("common.back")}
        </Button>
        
        {stage < 3 ? (
          <Button 
            size="lg"
            onClick={() => setStage((s) => s + 1)} 
            disabled={!canProceed()}
            className="flex-1 h-12 rounded-xl bg-navy hover:bg-navy-secondary font-bold"
          >
            {t("common.next")}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        ) : (
          <Button 
            variant="accent" 
            size="lg"
            onClick={handleSubmit} 
            disabled={!agreed || submitting}
            className="flex-[1.5] h-12 rounded-xl font-bold shadow-elevated"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {t("common.loading")}
              </span>
            ) : t("common.submit")}
          </Button>
        )}
      </div>
    </div>
  );
}
