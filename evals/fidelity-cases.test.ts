import { describe, expect, it } from "vitest";
import { runFidelityGuard } from "@/lib/fidelity";
import { EVAL_PREFERENCES } from "./preferences";
import { EVAL_SOURCE_COUNT, allEvalCases } from "./registry";
import { EvalCaseSchema } from "./schema";

describe("evals fidelity corpus", () => {
  it(`registers ${EVAL_SOURCE_COUNT} sources toward the §14 growth target`, () => {
    expect(EVAL_SOURCE_COUNT).toBe(20);
    expect(allEvalCases.map((c) => c.id)).toContain("campus-pilot-v0");
  });

  it("keeps unique case ids", () => {
    const ids = allEvalCases.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe.each(allEvalCases)("eval case $id", (evalCase) => {
  it("matches the gold Meaning Map + seeded corruption schema", () => {
    const parsed = EvalCaseSchema.parse(evalCase);
    expect(parsed.goldMeaningMap.criticalFacts.length).toBeGreaterThanOrEqual(2);
    expect(parsed.corruptions.length).toBeGreaterThanOrEqual(1);
  });

  it.each(evalCase.corruptions)(
    "runFidelityGuard flags corruption $id ($type)",
    async (corruption) => {
      const result = await runFidelityGuard({
        source: evalCase.source,
        adaptedText: corruption.adaptedText,
        meaningMap: evalCase.goldMeaningMap,
        preferences: EVAL_PREFERENCES,
      });

      expect(result.overallStatus).toBe(corruption.expectedOverallStatus);

      if (corruption.expectedReasonIncludes) {
        expect(
          result.checks.some(
            (c) =>
              c.status !== "pass" &&
              c.reason.includes(corruption.expectedReasonIncludes!),
          ),
        ).toBe(true);
      }

      const blob = result.checks.map((c) => c.reason).join(" ").toLowerCase();
      expect(blob).not.toMatch(/100%\s*verified/);
      expect(blob).not.toMatch(/guaranteed/);
    },
  );
});
