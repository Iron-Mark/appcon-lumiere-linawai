import { describe, expect, it } from "vitest";
import { adapt } from "./fixture";
import { CAMPUS_PILOT_SOURCE } from "./fixture";

const prefs = {
  detail: "key_points" as const,
  wording: "plain" as const,
  delivery: "read" as const,
  browserBehavior: "manual" as const,
};

describe("fixture fallback for text it does not know", () => {
  it("does not return the campus example as a passing note", async () => {
    const result = await adapt({
      source:
        "The library closes at 6 PM on weekdays. Students may stay later only with a staff pass.",
      preferences: prefs,
    });

    expect(result.overallStatus).toBe("warning");
    expect(result.adaptedText).not.toContain("orientation seat");
    expect(result.adaptedText.toLowerCase()).toContain("could not clarify");
    expect(result.meaningMap.criticalFacts).toHaveLength(0);
  });

  it("still clarifies the campus sample", async () => {
    const result = await adapt({
      source: CAMPUS_PILOT_SOURCE,
      preferences: prefs,
    });

    expect(result.adaptedText.toLowerCase()).toContain("thursday");
    expect(result.overallStatus).not.toBe("warning");
  });
});
