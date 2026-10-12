import { describe, it, expect } from "vitest";
import {
  calculateReviewScore,
  aggregateReviews,
  validateTemplateWeights,
  isRated,
  sufficiency,
  toAnswerInputs,
  round2,
} from "@/lib/scoring";
import type { RatingParameter, RatingValue } from "@/types/domain";
import { scoreThresholds } from "@/lib/config";

function p(id: string, weight: number): RatingParameter {
  return { id, versionId: "v1", key: id, name: { en: id, bn: "" }, description: { en: "", bn: "" }, weight, order: 0, active: true };
}

describe("scoring engine", () => {
  const params = [p("a", 20), p("b", 30), p("c", 50)];

  it("excludes not_observed from numerator and denominator", () => {
    const answers: Array<{ parameterId: string; value: RatingValue }> = [
      { parameterId: "a", value: 4 },
      { parameterId: "b", value: "not_observed" },
      { parameterId: "c", value: 3 },
      { parameterId: "d", value: 5 },
    ];
    const params = [p("a", 20), p("b", 30), p("c", 50), p("d", 0)];
    const res = calculateReviewScore(answers, params, scoreThresholds);
    expect(res.eligible).toBe(true);
    expect(res.score).toBeCloseTo((4 * 20 + 3 * 50 + 5 * 0) / (20 + 50 + 0), 2);
    expect(res.weightCoverage).toBeCloseTo(70 / 100);
  });

  it("requires minimum answered parameters", () => {
    const answers = [{ parameterId: "a", value: 4 }];
    const res = calculateReviewScore(answers, params, scoreThresholds);
    expect(res.eligible).toBe(false);
    expect(res.reason).toContain("3");
  });

  it("requires minimum weight coverage", () => {
    const answers = [{ parameterId: "a", value: 4 }, { parameterId: "b", value: 3 }, { parameterId: "d", value: 2 }];
    const testParams = [p("a", 20), p("b", 30), p("c", 50), p("d", 0)];
    const res = calculateReviewScore(answers, testParams, scoreThresholds);
    expect(res.eligible).toBe(false);
    expect(res.reason).toContain("60%");
  });

  it("validates template weights total 100%", () => {
    const ok = validateTemplateWeights(params);
    expect(ok.valid).toBe(true);
    expect(ok.total).toBe(100);
  });

  it("rejects template weights != 100", () => {
    const bad = [p("x", 30), p("y", 30)];
    const ok = validateTemplateWeights(bad);
    expect(ok.valid).toBe(false);
  });

  it("isRated helper", () => {
    expect(isRated(1)).toBe(true);
    expect(isRated(5)).toBe(true);
    expect(isRated("not_observed")).toBe(false);
  });

  it("round2 helper", () => {
    expect(round2(3.14159)).toBe(3.14);
    expect(round2(2.5)).toBe(2.5);
    expect(round2(2.005)).toBe(2.01);
  });

  it("aggregate excludes not_observed from parameter averages", () => {
    const inputs = [
      { score: 4, answers: [{ parameterId: "a", value: 4 }, { parameterId: "b", value: 3 }], relationshipTypeId: "r", templateVersionId: "v" },
      { score: 2, answers: [{ parameterId: "a", value: 2 }, { parameterId: "b", value: "not_observed" }], relationshipTypeId: "r", templateVersionId: "v" },
    ];
    const agg = aggregateReviews(inputs);
    expect(agg.eligibleCount).toBe(2);
    expect(agg.averageScore).toBe(3);
    const paramA = agg.parameterAverages.find((p) => p.parameterId === "a");
    expect(paramA?.average).toBe(3);
    const paramB = agg.parameterAverages.find((p) => p.parameterId === "b");
    expect(paramB?.count).toBe(1);
  });

  it("sufficiency thresholds", () => {
    expect(sufficiency(0, scoreThresholds)).toBe("insufficient");
    expect(sufficiency(4, scoreThresholds)).toBe("insufficient");
    expect(sufficiency(5, scoreThresholds)).toBe("provisional");
    expect(sufficiency(19, scoreThresholds)).toBe("provisional");
    expect(sufficiency(20, scoreThresholds)).toBe("published");
    expect(sufficiency(100, scoreThresholds)).toBe("published");
  });

  it("toAnswerInputs converts correctly", () => {
    const answers = [
      { id: "1", reviewId: "r", parameterId: "p1", value: 4 } as const,
      { id: "2", reviewId: "r", parameterId: "p2", value: "not_observed" } as const,
    ];
    const out = toAnswerInputs(answers);
    expect(out).toEqual([
      { parameterId: "p1", value: 4 },
      { parameterId: "p2", value: "not_observed" },
    ]);
  });
});