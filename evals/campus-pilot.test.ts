import { describe, expect, it } from "vitest";
import {
  REASON_NLI_DISCONNECTED,
  REASON_WRONG_GROUP,
  runFidelityGuard,
  runNliSlot,
  runRelationshipChecks,
} from "@/lib/fidelity";
import {
  CAMPUS_PILOT_PREFERENCES,
  campusPilotEvalCase,
} from "./campus-pilot";
import { EvalCaseSchema } from "./schema";

describe("evals/campus-pilot (§14 shape)", () => {
  it("parses the gold source, Meaning Map, and seeded corruption", () => {
    const parsed = EvalCaseSchema.parse(campusPilotEvalCase);
    expect(parsed.source).toContain("orientation seat");
    expect(parsed.goldMeaningMap.criticalFacts.length).toBeGreaterThanOrEqual(3);
    expect(parsed.corruptions).toHaveLength(1);
    expect(parsed.corruptions[0].adaptedText).toBe(
      "All members arrive at 8:30 AM.",
    );
  });
});

describe("Fidelity Guard — seeded relationship corruption", () => {
  const { source, goldMeaningMap, corruptions } = campusPilotEvalCase;
  const corruption = corruptions[0];

  it("flags the actor/value swap in the relationship layer", () => {
    const relationship = runRelationshipChecks(
      goldMeaningMap,
      corruption.adaptedText,
    );
    const warning = relationship.find((c) => c.status === "warning");
    expect(warning).toBeDefined();
    expect(warning?.reason).toBe(REASON_WRONG_GROUP);
  });

  it("pipeline overallStatus is warning with the expected reason", () => {
    const result = runFidelityGuard({
      source,
      adaptedText: corruption.adaptedText,
      meaningMap: goldMeaningMap,
      preferences: CAMPUS_PILOT_PREFERENCES,
    });

    expect(result.overallStatus).toBe(corruption.expectedOverallStatus);
    expect(
      result.checks.some(
        (c) =>
          c.status === "warning" &&
          c.reason.includes(corruption.expectedReasonIncludes!),
      ),
    ).toBe(true);
  });

  it("NLI slot stays neutral and disconnected (no model call)", () => {
    const nli = runNliSlot({
      source,
      adaptedText: corruption.adaptedText,
    });
    expect(nli.label).toBe("neutral");
    expect(nli.reason).toBe(REASON_NLI_DISCONNECTED);
    expect(nli.check.reason).toBe(REASON_NLI_DISCONNECTED);
    expect(nli.check.claim.toLowerCase()).toContain("neutral");
  });

  it("never uses forbidden certainty copy", () => {
    const result = runFidelityGuard({
      source,
      adaptedText: corruption.adaptedText,
      meaningMap: goldMeaningMap,
      preferences: CAMPUS_PILOT_PREFERENCES,
    });
    const blob = result.checks.map((c) => c.reason).join(" ").toLowerCase();
    expect(blob).not.toMatch(/100%\s*verified/);
    expect(blob).not.toMatch(/guaranteed/);
  });
});
