"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RatingInput } from "@/components/review/rating-input";
import { useI18n } from "@/lib/i18n/provider";
import { pick } from "@/lib/i18n/pick";
import { useToast } from "@/components/ui/toast";
import { submitReview } from "@/lib/actions/reviews";
import { calculateReviewScore, toAnswerInputs } from "@/lib/scoring";
import { scoreThresholds } from "@/lib/config";
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
  isAuthed,
}: {
  organization: { id: string; slug: string; officialName: string; bengaliName: string | null };
  branches: OrganizationBranch[];
  relationships: WizardRelationship[];
  bundles: Record<string, WizardBundle>;
  isAuthed: boolean;
}) {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [branchId, setBranchId] = useState<string>("");
  const [relationshipId, setRelationshipId] = useState<string>(relationships[0]?.id ?? "");
  const [period, setPeriod] = useState("");
  const [answers, setAnswers] = useState<Record<string, RatingValue>>({});
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bundle = bundles[relationshipId];

  const steps = [
    t("review.step1"),
    t("review.step2"),
    t("review.step3"),
    t("review.step4"),
    t("review.step5"),
    t("review.step6"),
    t("review.step7"),
  ];

  // Draft preservation within the session (privacy-safe: sessionStorage only).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`${DRAFT_KEY}_${organization.slug}`);
      if (raw) {
        const d = JSON.parse(raw);
        setBranchId(d.branchId ?? "");
        setRelationshipId(d.relationshipId ?? relationships[0]?.id ?? "");
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

  function canProceed(): boolean {
    if (step === 1) return !!relationshipId;
    if (step === 3) return !!liveScore?.eligible;
    if (step === 4) return body.trim().length >= 40;
    if (step === 6) return agreed;
    return true;
  }

  async function handleSubmit() {
    if (!bundle) return;
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
        UNAUTHENTICATED: "Please sign in to submit a review.",
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
      {/* Progress */}
      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {t("review.progress")} {step + 1} / {steps.length}
          </span>
          <span className="font-medium text-charcoal">{steps[step]}</span>
        </div>
        <Progress value={((step + 1) / steps.length) * 100} />
        <ol className="mt-3 hidden flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground sm:flex">
          {steps.map((s, i) => (
            <li key={s} className={i === step ? "font-medium text-jade" : i < step ? "text-charcoal" : ""}>
              {i < step && <Check className="mr-1 inline h-3 w-3" />}
              {s}
            </li>
          ))}
        </ol>
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-charcoal">{t("review.step1")}</h2>
              <div className="rounded-md border border-border bg-warmgray/50 p-4">
                <p className="font-medium text-charcoal">{organization.officialName}</p>
                {organization.bengaliName && (
                  <p className="text-sm text-muted-foreground" lang="bn">
                    {organization.bengaliName}
                  </p>
                )}
              </div>
              {branches.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="branch">{t("common.branch")}</Label>
                  <Select id="branch" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                    <option value="">{locale === "bn" ? "প্রধান কার্যালয় / নির্দিষ্ট নয়" : "Head office / not specific"}</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-charcoal">{t("review.relationshipQuestion")}</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {relationships.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRelationshipId(r.id)}
                    className={`rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                      relationshipId === r.id
                        ? "border-jade bg-jade-highlight text-navy"
                        : "border-border bg-white text-charcoal hover:bg-warmgray"
                    }`}
                  >
                    {pick(r.name, locale)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-charcoal">{t("review.periodQuestion")}</h2>
              <div className="space-y-2">
                <Label htmlFor="period">{t("review.step3")}</Label>
                <Input
                  id="period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder={t("review.periodPreset")}
                />
                <p className="text-xs text-muted-foreground">
                  {locale === "bn"
                    ? "ব্যক্তিগত পরিচয় রক্ষার জন্য মোটামুটি সময়কালই যথেষ্ট।"
                    : "An approximate period is sufficient; we avoid granular details that could identify you."}
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-charcoal">{t("review.step4")}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {locale === "bn"
                    ? "আপনি সরাসরি যে বিষয়গুলো অনুভব করেননি সেগুলো “দেখিনি” নির্বাচন করুন।"
                    : "Select “Not observed” for anything you did not directly experience."}
                </p>
              </div>
              {!bundle ? (
                <p className="text-sm text-muted-foreground">{t("org.noReviews")}</p>
              ) : (
                <div className="space-y-6">
                  {bundle.parameters.map((p) => (
                    <div key={p.id} className="space-y-3 rounded-md border border-border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Label className="text-base">{pick(p.name, locale)}</Label>
                          {p.questions.map((q) => (
                            <p key={q.id} className="mt-1 text-sm text-muted-foreground">
                              {pick(q.text, locale)}
                            </p>
                          ))}
                        </div>
                        <span className="shrink-0 text-xs font-medium text-muted-foreground">{p.weight}%</span>
                      </div>
                      <RatingInput
                        label={pick(p.name, locale)}
                        value={answers[p.id] ?? null}
                        onChange={(v) => setAnswers((prev) => ({ ...prev, [p.id]: v }))}
                      />
                    </div>
                  ))}
                  {liveScore && !liveScore.eligible && (
                    <p className="flex items-start gap-2 rounded-md bg-gold/10 p-3 text-xs text-[#7a5f2e]">
                      <Info className="mt-0.5 h-3.5 w-3.5" />
                      {t("review.needMore")}
                    </p>
                  )}
                  {liveScore?.eligible && (
                    <p className="text-sm text-jade">
                      {locale === "bn" ? "প্রাথমিক স্কোর" : "Provisional score"}: {liveScore.score?.toFixed(2)} / 5
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-charcoal">{t("review.step5")}</h2>
              <div className="space-y-2">
                <Label htmlFor="title">{t("review.titleLabel")} <span className="text-muted-foreground">({t("common.optional")})</span></Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">{t("review.bodyLabel")}</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={5000}
                  rows={8}
                  placeholder={locale === "bn" ? "আপনার বাস্তব অভিজ্ঞান বর্ণনা করুন…" : "Describe what you personally experienced…"}
                />
                <p className="text-xs text-muted-foreground">{t("review.bodyHelp")}</p>
                <p className="text-right text-xs text-muted-foreground">{body.length} / 5000</p>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-charcoal">{t("review.step6")}</h2>
              <div className="space-y-2">
                <Label htmlFor="displayName">{t("review.displayNameLabel")}</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={60}
                  placeholder={locale === "bn" ? "যেমন: একজন কর্মী" : "e.g. A former employee"}
                />
                <p className="text-xs text-muted-foreground">{t("review.displayNameHelp")}</p>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-charcoal">{t("review.rulesTitle")}</h2>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>{locale === "bn" ? "শুধু বাস্তব অভিজ্ঞতা লিখুন।" : "Write only about firsthand experience."}</li>
                <li>{locale === "bn" ? "ব্যক্তিগত নাম, ইমেইল বা ফোন নম্বর প্রকাশ করবেন না।" : "Do not publish private names, emails or phone numbers."}</li>
                <li>{locale === "bn" ? "হুমকি বা লক্ষ্যবস্তু হয়রানি নিষিদ্ধ।" : "Threats and targeted harassment are prohibited."}</li>
                <li>{locale === "bn" ? "প্রমাণহীন অভিযোগ তথ্য হিসেবে উপস্থাপন করবেন না।" : "Do not present unproven allegations as facts."}</li>
              </ul>
              <label className="flex items-start gap-3 rounded-md border border-border p-4">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border text-jade focus:ring-ring"
                />
                <span className="text-sm text-charcoal">{t("review.agree")}</span>
              </label>
              {!isAuthed && (
                <p className="rounded-md bg-navy/5 p-3 text-sm text-navy">
                  {locale === "bn" ? "জমা দিতে সাইন ইন করতে হবে।" : "You must be signed in to submit a review."}{" "}
                  <a href={`/login?next=${encodeURIComponent(`/organizations/${organization.slug}/review`)}`} className="font-medium text-jade underline">
                    {t("nav.login")}
                  </a>
                </p>
              )}
            </div>
          )}

          {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || submitting}>
          <ChevronLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
        {step < steps.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
            {t("common.next")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="accent" onClick={handleSubmit} disabled={!agreed || !isAuthed || submitting}>
            {submitting ? t("common.loading") : t("common.submit")}
          </Button>
        )}
      </div>
    </div>
  );
}
