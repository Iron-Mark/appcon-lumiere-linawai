import type { EvalCase } from "./schema";

/** Public advisories — short civic / health / transit notices. */
export const publicAdvisoryEvalCases: EvalCase[] = [
  {
    id: "public-heat-advisory",
    title: "Afternoon heat advisory",
    source:
      "Outdoor workers should rest from 12:00 PM. Indoor staff may continue until 5:00 PM. Water stations stay open only when volunteers are present.",
    goldMeaningMap: {
      sourceIntent: "Heat advisory rest window and water-station rule",
      criticalFacts: [
        {
          id: "fact_outdoor_rest",
          type: "schedule",
          actor: "Outdoor workers",
          action: "rest",
          value: "12:00 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Outdoor workers should rest from 12:00 PM.",
        },
        {
          id: "fact_indoor_continue",
          type: "schedule",
          actor: "Indoor staff",
          action: "may continue",
          value: "5:00 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Indoor staff may continue until 5:00 PM.",
        },
        {
          id: "fact_water",
          type: "condition",
          actor: "Water stations",
          action: "stay open",
          value: null,
          condition: "only when volunteers are present",
          exception: null,
          negated: false,
          evidence:
            "Water stations stay open only when volunteers are present.",
        },
      ],
    },
    corruptions: [
      {
        id: "actor-value-swap-rest",
        type: "actor/value swap",
        adaptedText: "Everyone rest from 12:00 PM.",
        expectedOverallStatus: "warning",
        expectedReasonIncludes:
          "The time appears to be attached to the wrong group.",
      },
    ],
  },
  {
    id: "public-bridge-closure",
    title: "Night bridge closure",
    source:
      "Private vehicles must not cross the north bridge after 10:00 PM. Buses may use the south detour until 11:30 PM. Pedestrians cross only with a marshal escort.",
    goldMeaningMap: {
      sourceIntent: "Bridge closure ban, bus detour, pedestrian escort",
      criticalFacts: [
        {
          id: "fact_vehicle_ban",
          type: "prohibition",
          actor: "Private vehicles",
          action: "cross the north bridge",
          value: "after 10:00 PM",
          condition: null,
          exception: null,
          negated: true,
          evidence:
            "Private vehicles must not cross the north bridge after 10:00 PM.",
        },
        {
          id: "fact_buses",
          type: "schedule",
          actor: "Buses",
          action: "may use the south detour",
          value: "11:30 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Buses may use the south detour until 11:30 PM.",
        },
        {
          id: "fact_pedestrians",
          type: "condition",
          actor: "Pedestrians",
          action: "cross",
          value: null,
          condition: "only with a marshal escort",
          exception: null,
          negated: false,
          evidence: "Pedestrians cross only with a marshal escort.",
        },
      ],
    },
    corruptions: [
      {
        id: "flipped-negation-bridge",
        type: "flipped negation",
        adaptedText: "Private vehicles cross the north bridge after 10:00 PM.",
        expectedOverallStatus: "repair_required",
        expectedReasonIncludes:
          "A restriction or negation may have changed.",
      },
    ],
  },
  {
    id: "public-clinic-vaccine",
    title: "Community clinic vaccine hours",
    source:
      "Seniors should arrive at 8:00 AM. Other adults should arrive at 9:30 AM. Same-day slots are released only if supply remains.",
    goldMeaningMap: {
      sourceIntent: "Clinic arrival windows and same-day slot rule",
      criticalFacts: [
        {
          id: "fact_seniors",
          type: "schedule",
          actor: "Seniors",
          action: "arrive",
          value: "8:00 AM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Seniors should arrive at 8:00 AM.",
        },
        {
          id: "fact_other_adults",
          type: "schedule",
          actor: "Other adults",
          action: "arrive",
          value: "9:30 AM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Other adults should arrive at 9:30 AM.",
        },
        {
          id: "fact_same_day",
          type: "condition",
          actor: "Same-day slots",
          action: "are released",
          value: null,
          condition: "only if supply remains",
          exception: null,
          negated: false,
          evidence: "Same-day slots are released only if supply remains.",
        },
      ],
    },
    corruptions: [
      {
        id: "dropped-condition-slots",
        type: "dropped condition",
        adaptedText: "Same-day slots are released at 8:00 AM.",
        expectedOverallStatus: "warning",
        expectedReasonIncludes: "Important condition may have changed.",
      },
    ],
  },
  {
    id: "public-boil-water",
    title: "Boil-water advisory",
    source:
      "Residents must boil tap water for 3 minutes. Bottled water distribution opens at 6:00 AM. Ice from unboiled water is not allowed for drinking.",
    goldMeaningMap: {
      sourceIntent: "Boil-water duration, distribution time, ice ban",
      criticalFacts: [
        {
          id: "fact_boil_minutes",
          type: "quantity",
          actor: "Residents",
          action: "boil tap water",
          value: "3",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Residents must boil tap water for 3 minutes.",
        },
        {
          id: "fact_distribution",
          type: "schedule",
          actor: "Bottled water distribution",
          action: "opens",
          value: "6:00 AM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Bottled water distribution opens at 6:00 AM.",
        },
        {
          id: "fact_ice_ban",
          type: "prohibition",
          actor: "Ice from unboiled water",
          action: "is not allowed",
          value: null,
          condition: null,
          exception: null,
          negated: true,
          evidence:
            "Ice from unboiled water is not allowed for drinking.",
        },
      ],
    },
    corruptions: [
      {
        id: "changed-number-boil",
        type: "changed number",
        adaptedText: "Residents must boil tap water for 8 minutes.",
        expectedOverallStatus: "warning",
        expectedReasonIncludes:
          "A date, time, or number may not match the source.",
      },
    ],
  },
];
