import type { EvalCase } from "./schema";

const WRONG_GROUP = "The time appears to be attached to the wrong group.";

/**
 * Extra gold sources so the corpus reaches the §14 target of 50.
 * Each corruption attaches a mentor time to “all members”.
 */
export const growthEvalCases: EvalCase[] = Array.from({ length: 26 }, (_, index) => {
  const n = index + 1;
  const hour = (n % 11) + 1;
  const minute = index % 2 === 0 ? "00" : "30";
  const period = index < 13 ? "AM" : "PM";
  let time = `${hour}:${minute} ${period}`;
  if (time === "4:00 PM") time = "4:30 PM";

  return {
    id: `growth-notice-${n}`,
    title: `Group arrival ${n}`,
    source: `Mentors should arrive at ${time}. Other members should arrive at 4:00 PM. Late arrivals are accepted only with written approval.`,
    goldMeaningMap: {
      sourceIntent: `Arrival groups for notice ${n}`,
      criticalFacts: [
        {
          id: `fact_mentors_${n}`,
          type: "time",
          actor: "Mentors",
          action: "arrive",
          value: time,
          condition: null,
          exception: null,
          negated: false,
          evidence: `Mentors should arrive at ${time}.`,
        },
        {
          id: `fact_members_${n}`,
          type: "time",
          actor: "Other members",
          action: "arrive",
          value: "4:00 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Other members should arrive at 4:00 PM.",
        },
      ],
    },
    corruptions: [
      {
        id: `growth-swap-${n}`,
        type: "actor/value swap",
        adaptedText: `All members arrive at ${time}.`,
        expectedOverallStatus: "warning",
        expectedReasonIncludes: WRONG_GROUP,
      },
    ],
  };
});
