import type { EvalCase } from "./schema";

/** Campus organization notices — clubs, orgs, student events. */
export const campusOrgEvalCases: EvalCase[] = [
  {
    id: "campus-org-debate-rehearsal",
    title: "Debate club rehearsal call time",
    source:
      "Team captains should arrive Wednesday at 5:00 PM. Other members should arrive at 5:30 PM. Guests may watch only with a captain’s invitation.",
    goldMeaningMap: {
      sourceIntent: "Debate rehearsal arrival times and guest rule",
      criticalFacts: [
        {
          id: "fact_captains",
          type: "schedule",
          actor: "Team captains",
          action: "arrive",
          value: "Wednesday at 5:00 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Team captains should arrive Wednesday at 5:00 PM.",
        },
        {
          id: "fact_other_members",
          type: "schedule",
          actor: "Other members",
          action: "arrive",
          value: "5:30 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Other members should arrive at 5:30 PM.",
        },
        {
          id: "fact_guests",
          type: "condition",
          actor: "Guests",
          action: "may watch",
          value: null,
          condition: "only with a captain’s invitation",
          exception: null,
          negated: false,
          evidence: "Guests may watch only with a captain’s invitation.",
        },
      ],
    },
    corruptions: [
      {
        id: "actor-value-swap-captains",
        type: "actor/value swap",
        adaptedText: "All members arrive at 5:00 PM.",
        expectedOverallStatus: "warning",
        expectedReasonIncludes:
          "The time appears to be attached to the wrong group.",
      },
    ],
  },
  {
    id: "campus-org-volunteer-shift",
    title: "Campus clean-up volunteer shifts",
    source:
      "Morning volunteers start at 8:00 AM. Afternoon volunteers start at 1:00 PM. Tools are released only if a waiver is signed.",
    goldMeaningMap: {
      sourceIntent: "Volunteer shift start times and tool waiver",
      criticalFacts: [
        {
          id: "fact_morning",
          type: "schedule",
          actor: "Morning volunteers",
          action: "start",
          value: "8:00 AM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Morning volunteers start at 8:00 AM.",
        },
        {
          id: "fact_afternoon",
          type: "schedule",
          actor: "Afternoon volunteers",
          action: "start",
          value: "1:00 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Afternoon volunteers start at 1:00 PM.",
        },
        {
          id: "fact_waiver",
          type: "condition",
          actor: "Tools",
          action: "are released",
          value: null,
          condition: "only if a waiver is signed",
          exception: null,
          negated: false,
          evidence: "Tools are released only if a waiver is signed.",
        },
      ],
    },
    corruptions: [
      {
        id: "dropped-condition-waiver",
        type: "dropped condition",
        adaptedText: "Tools are released at 8:00 AM.",
        expectedOverallStatus: "warning",
        expectedReasonIncludes: "Important condition may have changed.",
      },
    ],
  },
  {
    id: "campus-org-radio-booth",
    title: "Campus radio booth booking",
    source:
      "Hosts must not leave the booth unlocked after 9:00 PM. Producers may stay until 10:00 PM. Extra guests are limited to 3 people.",
    goldMeaningMap: {
      sourceIntent: "Radio booth lock rule, producer hours, guest cap",
      criticalFacts: [
        {
          id: "fact_unlocked_ban",
          type: "prohibition",
          actor: "Hosts",
          action: "leave the booth unlocked",
          value: "after 9:00 PM",
          condition: null,
          exception: null,
          negated: true,
          evidence:
            "Hosts must not leave the booth unlocked after 9:00 PM.",
        },
        {
          id: "fact_producers",
          type: "schedule",
          actor: "Producers",
          action: "may stay",
          value: "10:00 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Producers may stay until 10:00 PM.",
        },
        {
          id: "fact_guest_cap",
          type: "quantity",
          actor: "Extra guests",
          action: "are limited to",
          value: "3",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Extra guests are limited to 3 people.",
        },
      ],
    },
    corruptions: [
      {
        id: "flipped-negation-booth",
        type: "flipped negation",
        adaptedText: "Hosts leave the booth unlocked after 9:00 PM.",
        expectedOverallStatus: "repair_required",
        expectedReasonIncludes:
          "A restriction or negation may have changed.",
      },
    ],
  },
  {
    id: "campus-org-film-screening",
    title: "Student film screening doors",
    source:
      "Ushers open doors at 6:15 PM. Cast members arrive at 5:45 PM. Refunds are issued only with a printed ticket stub.",
    goldMeaningMap: {
      sourceIntent: "Screening door times and refund exception",
      criticalFacts: [
        {
          id: "fact_ushers",
          type: "schedule",
          actor: "Ushers",
          action: "open doors",
          value: "6:15 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Ushers open doors at 6:15 PM.",
        },
        {
          id: "fact_cast",
          type: "schedule",
          actor: "Cast members",
          action: "arrive",
          value: "5:45 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Cast members arrive at 5:45 PM.",
        },
        {
          id: "fact_refunds",
          type: "exception",
          actor: "Refunds",
          action: "are issued",
          value: null,
          condition: "only with a printed ticket stub",
          exception: "a printed ticket stub",
          negated: false,
          evidence: "Refunds are issued only with a printed ticket stub.",
        },
      ],
    },
    corruptions: [
      {
        id: "peer-actor-time-swap",
        type: "actor/value swap",
        adaptedText: "Ushers arrive at 5:45 PM.",
        expectedOverallStatus: "warning",
        expectedReasonIncludes:
          "The time appears to be attached to the wrong group.",
      },
    ],
  },
  {
    id: "campus-org-blood-drive",
    title: "Blood drive donor windows",
    source:
      "First-time donors check in by 10:00 AM. Returning donors check in by 2:00 PM. Snacks are given only when screening is complete.",
    goldMeaningMap: {
      sourceIntent: "Blood drive check-in windows and snack condition",
      criticalFacts: [
        {
          id: "fact_first_time",
          type: "deadline",
          actor: "First-time donors",
          action: "check in",
          value: "10:00 AM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "First-time donors check in by 10:00 AM.",
        },
        {
          id: "fact_returning",
          type: "deadline",
          actor: "Returning donors",
          action: "check in",
          value: "2:00 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Returning donors check in by 2:00 PM.",
        },
        {
          id: "fact_snacks",
          type: "condition",
          actor: "Snacks",
          action: "are given",
          value: null,
          condition: "only when screening is complete",
          exception: null,
          negated: false,
          evidence: "Snacks are given only when screening is complete.",
        },
      ],
    },
    corruptions: [
      {
        id: "wrong-time-first-donors",
        type: "wrong time",
        adaptedText: "First-time donors check in by 11:30 AM.",
        expectedOverallStatus: "warning",
        expectedReasonIncludes:
          "A date, time, or number may not match the source.",
      },
    ],
  },
];
