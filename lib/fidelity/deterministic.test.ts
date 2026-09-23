import { describe, expect, it } from "vitest";
import { runDeterministicChecks } from "./deterministic";
import {
  REASON_ENTITY_MISMATCH,
  REASON_OBLIGATION_CHANGED,
  REASON_VALUE_MISMATCH,
} from "./copy";
import type { MeaningMap } from "@/lib/domain";

const sampleMap: MeaningMap = {
  sourceIntent: "Unit and modality sample",
  criticalFacts: [
    {
      id: "fact_units",
      type: "quantity",
      actor: "Setup crew",
      action: "bring",
      value: "15 units",
      condition: null,
      exception: null,
      negated: false,
      evidence: "Setup crew must bring 15 units.",
    },
    {
      id: "fact_mentors",
      type: "schedule",
      actor: "Mentors",
      action: "arrive",
      value: "8:30 AM",
      condition: null,
      exception: null,
      negated: false,
      evidence: "Mentors should arrive Friday at 8:30 AM.",
    },
  ],
};

describe("deterministic Layer 1 §12 gaps", () => {
  it("flags unit amount changes", () => {
    const checks = runDeterministicChecks(
      sampleMap,
      "Setup crew must bring 18 units.",
    );
    expect(
      checks.some(
        (c) =>
          c.status === "warning" && c.reason === REASON_VALUE_MISMATCH,
      ),
    ).toBe(true);
  });

  it("flags must softened to may on the same claim", () => {
    const checks = runDeterministicChecks(
      sampleMap,
      "Setup crew may bring 15 units.",
    );
    expect(
      checks.some(
        (c) =>
          c.status === "warning" && c.reason === REASON_OBLIGATION_CHANGED,
      ),
    ).toBe(true);
  });

  it("flags an unknown group attached to a mapped time", () => {
    const checks = runDeterministicChecks(
      sampleMap,
      "Coordinator Jordan arrives at 8:30 AM.",
    );
    expect(
      checks.some(
        (c) =>
          c.status === "warning" && c.reason === REASON_ENTITY_MISMATCH,
      ),
    ).toBe(true);
  });

  it("does not invent obligation warnings when modals are simply omitted", () => {
    const checks = runDeterministicChecks(
      sampleMap,
      "Setup crew bring 15 units. Mentors arrive at 8:30 AM.",
    );
    expect(checks.every((c) => c.reason !== REASON_OBLIGATION_CHANGED)).toBe(
      true,
    );
  });
});
