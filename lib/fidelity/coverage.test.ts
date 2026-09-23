import { describe, expect, it } from "vitest";
import { DEFAULT_PREFERENCES, type MeaningMap } from "@/lib/domain";
import { REASON_DEADLINE_REVIEW } from "./copy";
import { runCoverageChecks } from "./coverage";

const deadlineMap: MeaningMap = {
  sourceIntent: "A confirmation deadline",
  criticalFacts: [
    {
      id: "fact_deadline",
      type: "deadline",
      actor: "Members",
      action: "confirm their seat",
      value: "Thursday at 5 PM",
      condition: null,
      exception: null,
      negated: false,
      evidence: "confirm by Thursday at 5 PM",
    },
  ],
};

describe("runCoverageChecks", () => {
  it("warns when a deadline is missing from a full note", () => {
    const checks = runCoverageChecks(
      deadlineMap,
      "Please arrive when you can.",
      { ...DEFAULT_PREFERENCES, detail: "full" },
      new Set(),
    );

    expect(checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          status: "warning",
          reason: REASON_DEADLINE_REVIEW,
        }),
      ]),
    );
  });
});
