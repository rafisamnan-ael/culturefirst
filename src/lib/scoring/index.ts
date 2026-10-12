import type { RatingParameter, RatingValue, ReviewAnswer } from "@/types/domain";
import type { ScoreThresholds } from "@/lib/config";

export interface AnswerInput {
  parameterId: string;
  value: RatingValue;
}

export interface ReviewScoreResult {
  score: number | null;
  answeredParameters: number;
  weightCoverage: number;
  eligible: boolean;
  reason?: string;
}

export function isRated(value: RatingValue): value is 1 | 2 | 3 | 4 | 5 {
  return typeof value === "number" && value >= 1 && value <= 5;
}

/**
 * Review Score = SUM(rating x parameter_weight) / SUM(weights_of_answered_parameters)
 *
 * Unanswered or "Not observed / Not applicable" parameters are excluded from
 * BOTH numerator and denominator. Weights are percentages that total 100 for a
 * validated template, so the result is always on the 1-5 scale.
 */
export function calculateReviewScore(
  answers: AnswerInput[],
  parameters: Pick<RatingParameter, "id" | "weight">[],
  thresholds: ScoreThresholds,
): ReviewScoreResult {
  const answerByParam = new Map(answers.map((a) => [a.parameterId, a.value]));

  let weightedSum = 0;
  let weightTotal = 0;
  let answeredParameters = 0;

  for (const param of parameters) {
    const value = answerByParam.get(param.id);
    if (value === undefined || !isRated(value)) continue;
    weightedSum += value * param.weight;
    weightTotal += param.weight;
    answeredParameters += 1;
  }

  const totalTemplateWeight = parameters.reduce((sum, p) => sum + p.weight, 0);
  const weightCoverage =
    totalTemplateWeight > 0 ? weightTotal / totalTemplateWeight : 0;

  // Nothing answered at all.
  if (answeredParameters === 0 || weightTotal === 0) {
    return {
      score: null,
      answeredParameters,
      weightCoverage,
      eligible: false,
      reason: "No parameters rated",
    };
  }

  const score = weightedSum / weightTotal;

  const enoughAnswers = answeredParameters >= thresholds.minAnsweredParameters;
  const enoughWeight = weightCoverage >= thresholds.minWeightCoverage;

  if (!enoughAnswers || !enoughWeight) {
    return {
      score: null,
      answeredParameters,
      weightCoverage,
      eligible: false,
      reason: !enoughAnswers
        ? `Fewer than ${thresholds.minAnsweredParameters} parameters rated`
        : `Less than ${Math.round(thresholds.minWeightCoverage * 100)}% of template weight covered`,
    };
  }

  return {
    score: round2(score),
    answeredParameters,
    weightCoverage,
    eligible: true,
  };
}

export function validateTemplateWeights(
  parameters: Pick<RatingParameter, "weight">[],
  tolerance = 0.001,
): { valid: boolean; total: number } {
  const total = parameters.reduce((sum, p) => sum + p.weight, 0);
  return { valid: Math.abs(total - 100) <= tolerance, total };
}

export interface AggregateInput {
  score: number;
  answers: AnswerInput[];
  relationshipTypeId: string;
  templateVersionId: string;
}

export interface ParameterAggregate {
  parameterId: string;
  average: number;
  count: number;
}

export interface AggregateResult {
  eligibleCount: number;
  averageScore: number | null;
  parameterAverages: ParameterAggregate[];
  distribution: Record<string, number>;
}

/**
 * Aggregate ONLY eligible, non-duplicate reviews that share the same template
 * version / methodology group. Parameter averages ignore "not observed".
 */
export function aggregateReviews(inputs: AggregateInput[]): AggregateResult {
  const distribution: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };

  if (inputs.length === 0) {
    return { eligibleCount: 0, averageScore: null, parameterAverages: [], distribution };
  }

  const scoreSum = inputs.reduce((sum, r) => sum + r.score, 0);
  const averageScore = round2(scoreSum / inputs.length);

  const paramAccum = new Map<string, { sum: number; count: number }>();
  for (const review of inputs) {
    const rounded = Math.min(5, Math.max(1, Math.round(review.score)));
    distribution[String(rounded)] = (distribution[String(rounded)] || 0) + 1;
    for (const answer of review.answers) {
      if (!isRated(answer.value)) continue;
      const entry = paramAccum.get(answer.parameterId) ?? { sum: 0, count: 0 };
      entry.sum += answer.value;
      entry.count += 1;
      paramAccum.set(answer.parameterId, entry);
    }
  }

  const parameterAverages: ParameterAggregate[] = [...paramAccum.entries()].map(
    ([parameterId, { sum, count }]) => ({
      parameterId,
      average: round2(sum / count),
      count,
    }),
  );

  return { eligibleCount: inputs.length, averageScore, parameterAverages, distribution };
}

export type Sufficiency = "insufficient" | "provisional" | "published";

/** Public reporting rules: 0-4 insufficient, 5-19 provisional, 20+ regular. */
export function sufficiency(
  eligibleCount: number,
  thresholds: Pick<ScoreThresholds, "minProvisionalReviews" | "minPublishedReviews">,
): Sufficiency {
  if (eligibleCount < thresholds.minProvisionalReviews) return "insufficient";
  if (eligibleCount < thresholds.minPublishedReviews) return "provisional";
  return "published";
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function toAnswerInputs(answers: ReviewAnswer[]): AnswerInput[] {
  return answers.map((a) => ({ parameterId: a.parameterId, value: a.value }));
}
