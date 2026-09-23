import { describe, expect, it } from "vitest";
import { exampleFor } from "./example";
import {
  preferenceSummaryLabels,
  resolveOnboardingStep,
} from "./steps";

describe("resolveOnboardingStep", () => {
  it("keeps wording values while changing copy after Key Points", () => {
    const step = resolveOnboardingStep(1, { detail: "key_points" });
    expect(step.id).toBe("wording");
    expect(step.question).toMatch(/key points/i);
    expect(step.options.map((o) => o.value)).toEqual([
      "original",
      "plain",
      "taglish",
    ]);
    expect(step.options[0].hint).toMatch(/short list/i);
  });

  it("names the full message after Full", () => {
    const step = resolveOnboardingStep(1, { detail: "full" });
    expect(step.question).toMatch(/full message/i);
  });

  it("explains Listen vs extension on the last step", () => {
    const listen = resolveOnboardingStep(3, {
      detail: "key_points",
      wording: "plain",
      delivery: "listen",
    });
    expect(listen.promptIdle).toMatch(/extension/i);
    expect(listen.promptIdle).toMatch(/Listen/i);
    expect(listen.options.map((o) => o.value)).toEqual([
      "auto_adapt",
      "manual",
    ]);

    const read = resolveOnboardingStep(3, {
      detail: "full",
      wording: "original",
      delivery: "read",
    });
    expect(read.promptIdle).not.toMatch(/Listen/i);
  });
});

describe("exampleFor", () => {
  it("keeps Key Points samples short after Detail", () => {
    const example = exampleFor("wording", "plain", {
      detail: "key_points",
    });
    expect(example.list).toBe(true);
    expect(example.blocks.length).toBeGreaterThan(1);
    expect(example.blocks.every((line) => line.length < 80)).toBe(true);
  });

  it("keeps Full samples longer", () => {
    const example = exampleFor("wording", "original", { detail: "full" });
    expect(example.list).toBe(false);
    expect(example.blocks.join(" ").length).toBeGreaterThan(120);
  });
});

describe("preferenceSummaryLabels", () => {
  it("formats a short defaults line", () => {
    expect(
      preferenceSummaryLabels({
        detail: "key_points",
        wording: "plain",
        delivery: "read",
      }),
    ).toEqual(["Key Points", "Plain Language", "Read"]);
  });
});
