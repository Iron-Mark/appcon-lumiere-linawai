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

  // Taglish: everyday Tagalog–English mix. Dates, times, roles, and the
  // approval condition stay verbatim so Meaning Check can compare them.
  if (detail === "key_points" && wording === "taglish") {
    return [
      "Kumpirmahin ang orientation seat mo by Thursday at 5 PM.",
      "Mentors, dumating ng Friday at 8:30 AM.",
      "Other members, dumating ng 9:00 AM.",
      "Late confirmations, tatanggapin lang only with written approval from the program coordinator.",
    ].join("\n");
  }

  if (detail === "full" && wording === "taglish") {
    return (
      "Members of the Linaw campus pilot, kumpirmahin ninyo ang orientation seat ninyo by Thursday at 5 PM. " +
      "Mentors, dumating ng Friday at 8:30 AM. Other members, dumating ng 9:00 AM. " +
      "Late confirmations ay tatanggapin lang only with written approval from the program coordinator."
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
async function fidelityChecks(
  adaptedText: string,
  meaningMap: MeaningMap,
  preferences: Preferences,
  options?: { preserveSeededWarning?: boolean },
): Promise<{ checks: Check[]; overallStatus: CheckStatus }> {
  const result = await runFidelityGuard({
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

const UNAVAILABLE_NOTE =
  "Linaw could not clarify this message. The live model did not return a note, so this is not a rewrite of what you pasted. Your original text is still in the source.";

/** Offline path for text that is not the campus sample. Never invent that sample. */
function unavailableResponse(source: string): AdaptResponse {
  const excerpt = source.trim().slice(0, 240);
  return {
    adaptedText: UNAVAILABLE_NOTE,
    meaningMap: {
      sourceIntent: "Clarification was not produced for this message.",
      criticalFacts: [],
    },
    checks: [
      {
        claim: "A clarified note was produced from this text",
        status: "warning",
        evidence: excerpt,
        reason:
          "The live model did not return a note. This is not a clarification of what you pasted.",
      },
    ],
    overallStatus: "warning",
  };
}

async function seededFailureResponse(
  preferences: Preferences,
): Promise<AdaptResponse> {
  const meaningMap = campusPilotMeaningMap();
  const adaptedText = SEEDED_ADAPTED_TEXT;
  const { checks, overallStatus } = await fidelityChecks(
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

async function happyPathResponse(
  preferences: Preferences,
  source: string,
): Promise<AdaptResponse> {
  const meaningMap = campusPilotMeaningMap();
  const adaptedText = buildAdaptedText(preferences);

  if (shouldRunFidelityPipeline(source)) {
    const { checks, overallStatus } = await fidelityChecks(
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

  return unavailableResponse(source);
}

/**
 * Adapt source text in-browser using the campus-pilot fixture.
 * Pass source equal to {@link SEEDED_FAILURE_SOURCE} to exercise the warning path.
 */
export async function adapt(input: AdaptRequest): Promise<AdaptResponse> {
  const result = isSeededFailureRequest(input.source)
    ? await seededFailureResponse(input.preferences)
    : await happyPathResponse(input.preferences, input.source);

  return AdaptResponseSchema.parse(result);
}
