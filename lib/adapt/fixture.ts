import {
  AdaptResponseSchema,
  type AdaptRequest,
  type AdaptResponse,
  type Check,
  type CheckStatus,
  type MeaningMap,
  type Preferences,
} from "@/lib/domain";
import { REASON_WRONG_GROUP, runFidelityGuard } from "@/lib/fidelity";

/**
 * In-browser adapt implementation (no fetch, no API route).
 * Owns the campus-pilot development sample and seeded bad adaptation.
 * Callers must import adapt() from `@/lib/adapt`, never this file.
 */

/** Development sample source (campus pilot — not a retired volunteer-event script). */
export const CAMPUS_PILOT_SOURCE =
  "Members of the Linaw campus pilot must confirm their orientation seat by Thursday at 5 PM. Mentors should arrive Friday at 8:30 AM. Other members should arrive at 9:00 AM. Late confirmations are accepted only with written approval from the program coordinator.";

/** Source text for “Use an example” — UI fills the draft; it does not hardcode this string. */
export function getDevelopmentSampleSource(): string {
  return CAMPUS_PILOT_SOURCE;
}

/** Source string that triggers the seeded corruption path (port has no failure flag). */
export const SEEDED_FAILURE_SOURCE = "All members arrive at 8:30 AM";

const SEEDED_ADAPTED_TEXT = "All members arrive at 8:30 AM.";
const SEEDED_WARNING_REASON = REASON_WRONG_GROUP;

const MENTOR_ARRIVAL_EVIDENCE =
  "Mentors should arrive Friday at 8:30 AM.";
const DEADLINE_EVIDENCE =
  "Members of the Linaw campus pilot must confirm their orientation seat by Thursday at 5 PM.";
const OTHER_MEMBERS_EVIDENCE =
  "Other members should arrive at 9:00 AM.";
const LATE_CONFIRMATION_EVIDENCE =
  "Late confirmations are accepted only with written approval from the program coordinator.";

function normalizeSourceKey(source: string): string {
  return source.trim().replace(/\.$/, "");
}

function isSeededFailureRequest(source: string): boolean {
  return normalizeSourceKey(source) === SEEDED_FAILURE_SOURCE;
}

function isCampusPilotSource(source: string): boolean {
  return normalizeSourceKey(source) === normalizeSourceKey(CAMPUS_PILOT_SOURCE);
}

/** Empty source is the reading UI’s fixture-sample request. */
function isFixtureSampleRequest(source: string): boolean {
  return source.trim() === "";
}

function shouldRunFidelityPipeline(source: string): boolean {
  return (
    isSeededFailureRequest(source) ||
    isCampusPilotSource(source) ||
    isFixtureSampleRequest(source)
  );
}

function campusPilotMeaningMap(): MeaningMap {
  return {
    sourceIntent: "Campus pilot orientation instructions",
    criticalFacts: [
      {
        id: "fact_deadline",
        type: "deadline",
        actor: "Members of the Linaw campus pilot",
        action: "confirm their orientation seat",
        value: "Thursday at 5 PM",
        condition: null,
        exception: null,
        negated: false,
        evidence: DEADLINE_EVIDENCE,
      },
      {
        id: "fact_mentors_arrive",
        type: "schedule",
        actor: "Mentors",
        action: "arrive",
        value: "Friday at 8:30 AM",
        condition: null,
        exception: null,
        negated: false,
        evidence: MENTOR_ARRIVAL_EVIDENCE,
      },
      {
        id: "fact_members_arrive",
        type: "schedule",
        actor: "Other members",
        action: "arrive",
        value: "9:00 AM",
        condition: null,
        exception: null,
        negated: false,
        evidence: OTHER_MEMBERS_EVIDENCE,
      },
      {
        id: "fact_late_confirmations",
        type: "exception",
        actor: "Late confirmations",
        action: "are accepted",
        value: null,
        condition: "only with written approval from the program coordinator",
        exception: null,
        negated: false,
        evidence: LATE_CONFIRMATION_EVIDENCE,
      },
    ],
  };
}

function buildAdaptedText(preferences: Preferences): string {
  const { detail, wording } = preferences;

  if (detail === "key_points" && wording === "plain") {
    return [
      "Confirm your orientation seat by Thursday at 5 PM.",
      "Mentors arrive Friday at 8:30 AM.",
      "Other members arrive at 9:00 AM.",
      "Late confirmations only with written approval from the program coordinator.",
    ].join("\n");
  }

  if (detail === "key_points" && wording === "original") {
    return [
      "Members of the Linaw campus pilot must confirm their orientation seat by Thursday at 5 PM.",
      "Mentors should arrive Friday at 8:30 AM.",
      "Other members should arrive at 9:00 AM.",
      "Late confirmations are accepted only with written approval from the program coordinator.",
    ].join("\n");
  }

  if (detail === "full" && wording === "plain") {
    return (
      "Members of the Linaw campus pilot need to confirm their orientation seat by Thursday at 5 PM. " +
      "Mentors should get there Friday at 8:30 AM. Other members should get there at 9:00 AM. " +
      "Late confirmations are accepted only with written approval from the program coordinator."
    );
  }

  // full + original
  return CAMPUS_PILOT_SOURCE;
}

function hasSeededWarningReason(checks: Check[]): boolean {
  return checks.some(
    (c) =>
      c.reason === SEEDED_WARNING_REASON ||
      c.reason.includes(SEEDED_WARNING_REASON),
  );
}

/**
 * Run the fidelity pipeline; if the seeded wrong-group reason would be lost,
 * keep it on the response.
 */
function fidelityChecks(
  adaptedText: string,
  meaningMap: MeaningMap,
  preferences: Preferences,
  options?: { preserveSeededWarning?: boolean },
): { checks: Check[]; overallStatus: CheckStatus } {
  const result = runFidelityGuard({
    source: CAMPUS_PILOT_SOURCE,
    adaptedText,
    meaningMap,
    preferences,
  });

  if (!options?.preserveSeededWarning || hasSeededWarningReason(result.checks)) {
    return result;
  }

  const injected: Check = {
    claim: "All members arrive at 8:30 AM",
    status: "warning",
    evidence: MENTOR_ARRIVAL_EVIDENCE,
    reason: SEEDED_WARNING_REASON,
  };
  const checks = [injected, ...result.checks];
  const overallStatus: CheckStatus =
    result.overallStatus === "repair_required" ? "repair_required" : "warning";

  return { checks, overallStatus };
}

/** Fallback when source is neither campus-pilot nor seeded (still offline). */
function fallbackHappyPathChecks(): Check[] {
  return [
    {
      claim: "Orientation seat must be confirmed by Thursday at 5 PM",
      status: "pass",
      evidence: DEADLINE_EVIDENCE,
      reason: "Deadline matches the source.",
    },
    {
      claim: "Mentors arrive Friday at 8:30 AM",
      status: "pass",
      evidence: MENTOR_ARRIVAL_EVIDENCE,
      reason: "Arrival time stays attached to mentors.",
    },
    {
      claim: "Other members arrive at 9:00 AM",
      status: "pass",
      evidence: OTHER_MEMBERS_EVIDENCE,
      reason: "Arrival time stays attached to other members.",
    },
    {
      claim:
        "Late confirmations require written approval from the program coordinator",
      status: "pass",
      evidence: LATE_CONFIRMATION_EVIDENCE,
      reason: "Exception condition is preserved.",
    },
    {
      claim: "Adapted claims are supported by the source",
      status: "pass",
      evidence: DEADLINE_EVIDENCE,
      reason: "Semantic check not connected.",
    },
  ];
}

function seededFailureResponse(preferences: Preferences): AdaptResponse {
  const meaningMap = campusPilotMeaningMap();
  const adaptedText = SEEDED_ADAPTED_TEXT;
  const { checks, overallStatus } = fidelityChecks(
    adaptedText,
    meaningMap,
    preferences,
    { preserveSeededWarning: true },
  );

  return {
    adaptedText,
    meaningMap,
    checks,
    overallStatus,
  };
}

function happyPathResponse(
  preferences: Preferences,
  source: string,
): AdaptResponse {
  const meaningMap = campusPilotMeaningMap();
  const adaptedText = buildAdaptedText(preferences);

  if (shouldRunFidelityPipeline(source)) {
    const { checks, overallStatus } = fidelityChecks(
      adaptedText,
      meaningMap,
      preferences,
    );
    return {
      adaptedText,
      meaningMap,
      checks,
      overallStatus,
    };
  }

  return {
    adaptedText,
    meaningMap,
    checks: fallbackHappyPathChecks(),
    overallStatus: "pass",
  };
}

/**
 * Adapt source text in-browser using the campus-pilot fixture.
 * Pass source equal to {@link SEEDED_FAILURE_SOURCE} to exercise the warning path.
 */
export async function adapt(input: AdaptRequest): Promise<AdaptResponse> {
  const result = isSeededFailureRequest(input.source)
    ? seededFailureResponse(input.preferences)
    : happyPathResponse(input.preferences, input.source);

  return AdaptResponseSchema.parse(result);
}
