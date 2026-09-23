import { DEFAULT_PREFERENCES, type Preferences } from "@/lib/domain";
import type { EvalCase } from "./schema";

/** Campus-pilot development sample (spec 05 / 06). */
export const CAMPUS_PILOT_SOURCE =
  "Members of the Linaw campus pilot must confirm their orientation seat by Thursday at 5 PM. Mentors should arrive Friday at 8:30 AM. Other members should arrive at 9:00 AM. Late confirmations are accepted only with written approval from the program coordinator.";

export const CAMPUS_PILOT_SEEDED_BAD =
  "All members arrive at 8:30 AM.";

/** Default prefs for exercising Key Points coverage. */
export const CAMPUS_PILOT_PREFERENCES: Preferences = {
  ...DEFAULT_PREFERENCES,
  detail: "key_points",
  wording: "plain",
  delivery: "read",
  browserBehavior: "manual",
};

/**
 * §14-shaped eval case: one gold source, Meaning Map, one seeded corruption.
 */
export const campusPilotEvalCase: EvalCase = {
  id: "campus-pilot-v0",
  title: "Linaw campus pilot orientation notice",
  source: CAMPUS_PILOT_SOURCE,
  goldMeaningMap: {
    sourceIntent: "Campus pilot orientation confirmation and arrival instructions",
    criticalFacts: [
      {
        id: "fact_deadline_confirm",
        type: "deadline",
        actor: "Members of the Linaw campus pilot",
        action: "confirm their orientation seat",
        value: "Thursday at 5 PM",
        condition: null,
        exception: null,
        negated: false,
        evidence:
          "Members of the Linaw campus pilot must confirm their orientation seat by Thursday at 5 PM.",
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
        evidence: "Mentors should arrive Friday at 8:30 AM.",
      },
      {
        id: "fact_others_arrive",
        type: "schedule",
        actor: "Other members",
        action: "arrive",
        value: "9:00 AM",
        condition: null,
        exception: null,
        negated: false,
        evidence: "Other members should arrive at 9:00 AM.",
      },
      {
        id: "fact_late_approval",
        type: "exception",
        actor: "Late confirmations",
        action: "are accepted",
        value: null,
        condition: "only with written approval from the program coordinator",
        exception: "written approval from the program coordinator",
        negated: false,
        evidence:
          "Late confirmations are accepted only with written approval from the program coordinator.",
      },
    ],
  },
  corruptions: [
    {
      id: "actor-value-swap-830",
      type: "actor/value swap",
      adaptedText: CAMPUS_PILOT_SEEDED_BAD,
      expectedOverallStatus: "warning",
      expectedReasonIncludes:
        "The time appears to be attached to the wrong group.",
    },
  ],
};
