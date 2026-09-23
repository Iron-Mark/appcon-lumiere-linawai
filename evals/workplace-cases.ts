import type { EvalCase } from "./schema";

/** Workplace memos — short internal notices. */
export const workplaceEvalCases: EvalCase[] = [
  {
    id: "workplace-fire-drill",
    title: "Office fire drill schedule",
    source:
      "Floor wardens should assemble at 9:00 AM. All other staff should assemble at 9:20 AM. Re-entry is allowed only with clearance from security.",
    goldMeaningMap: {
      sourceIntent: "Fire drill assembly times and re-entry rule",
      criticalFacts: [
        {
          id: "fact_wardens",
          type: "schedule",
          actor: "Floor wardens",
          action: "assemble",
          value: "9:00 AM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Floor wardens should assemble at 9:00 AM.",
        },
        {
          id: "fact_other_staff",
          type: "schedule",
          actor: "All other staff",
          action: "assemble",
          value: "9:20 AM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "All other staff should assemble at 9:20 AM.",
        },
        {
          id: "fact_reentry",
          type: "exception",
          actor: "Re-entry",
          action: "is allowed",
          value: null,
          condition: "only with clearance from security",
          exception: "clearance from security",
          negated: false,
          evidence:
            "Re-entry is allowed only with clearance from security.",
        },
      ],
    },
    corruptions: [
      {
        id: "actor-value-swap-wardens",
        type: "actor/value swap",
        adaptedText: "Everyone assemble at 9:00 AM.",
        expectedOverallStatus: "warning",
        expectedReasonIncludes:
          "The time appears to be attached to the wrong group.",
      },
    ],
  },
  {
    id: "workplace-expense-cutoff",
    title: "Expense report cutoff",
    source:
      "Managers must approve expense reports by Friday at 4:00 PM. Staff should submit drafts by Thursday at 12:00 PM. Late filings are accepted only with finance director approval.",
    goldMeaningMap: {
      sourceIntent: "Expense cutoff times and late-filing exception",
      criticalFacts: [
        {
          id: "fact_manager_deadline",
          type: "deadline",
          actor: "Managers",
          action: "approve expense reports",
          value: "Friday at 4:00 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence:
            "Managers must approve expense reports by Friday at 4:00 PM.",
        },
        {
          id: "fact_staff_deadline",
          type: "deadline",
          actor: "Staff",
          action: "submit drafts",
          value: "Thursday at 12:00 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Staff should submit drafts by Thursday at 12:00 PM.",
        },
        {
          id: "fact_late_filings",
          type: "exception",
          actor: "Late filings",
          action: "are accepted",
          value: null,
          condition: "only with finance director approval",
          exception: "finance director approval",
          negated: false,
          evidence:
            "Late filings are accepted only with finance director approval.",
        },
      ],
    },
    corruptions: [
      {
        id: "dropped-condition-late-filings",
        type: "dropped condition",
        adaptedText: "Late filings are accepted on Friday.",
        expectedOverallStatus: "warning",
        expectedReasonIncludes: "Important condition may have changed.",
      },
    ],
  },
  {
    id: "workplace-server-window",
    title: "Server maintenance window",
    source:
      "Engineers must not restart production servers after 2:00 PM. On-call leads may intervene until 6:00 PM. Planned jobs are capped at 2 restarts.",
    goldMeaningMap: {
      sourceIntent: "Production restart ban, on-call window, restart cap",
      criticalFacts: [
        {
          id: "fact_restart_ban",
          type: "prohibition",
          actor: "Engineers",
          action: "restart production servers",
          value: "after 2:00 PM",
          condition: null,
          exception: null,
          negated: true,
          evidence:
            "Engineers must not restart production servers after 2:00 PM.",
        },
        {
          id: "fact_oncall",
          type: "schedule",
          actor: "On-call leads",
          action: "may intervene",
          value: "6:00 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "On-call leads may intervene until 6:00 PM.",
        },
        {
          id: "fact_restart_cap",
          type: "quantity",
          actor: "Planned jobs",
          action: "are capped at",
          value: "2",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Planned jobs are capped at 2 restarts.",
        },
      ],
    },
    corruptions: [
      {
        id: "flipped-negation-restart",
        type: "flipped negation",
        adaptedText: "Engineers restart production servers after 2:00 PM.",
        expectedOverallStatus: "repair_required",
        expectedReasonIncludes:
          "A restriction or negation may have changed.",
      },
    ],
  },
  {
    id: "workplace-badge-pickup",
    title: "New-hire badge pickup",
    source:
      "HR partners hand out badges at 10:30 AM. New hires should arrive at 10:00 AM. Temporary badges are issued only with a manager request.",
    goldMeaningMap: {
      sourceIntent: "Badge pickup times and temporary badge rule",
      criticalFacts: [
        {
          id: "fact_hr_handoff",
          type: "schedule",
          actor: "HR partners",
          action: "hand out badges",
          value: "10:30 AM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "HR partners hand out badges at 10:30 AM.",
        },
        {
          id: "fact_new_hires",
          type: "schedule",
          actor: "New hires",
          action: "arrive",
          value: "10:00 AM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "New hires should arrive at 10:00 AM.",
        },
        {
          id: "fact_temp_badges",
          type: "condition",
          actor: "Temporary badges",
          action: "are issued",
          value: null,
          condition: "only with a manager request",
          exception: null,
          negated: false,
          evidence:
            "Temporary badges are issued only with a manager request.",
        },
      ],
    },
    corruptions: [
      {
        id: "peer-actor-badge-swap",
        type: "actor/value swap",
        adaptedText: "New hires hand out badges at 10:30 AM.",
        expectedOverallStatus: "warning",
        expectedReasonIncludes:
          "The time appears to be attached to the wrong group.",
      },
    ],
  },
  {
    id: "workplace-parking-lottery",
    title: "Parking lottery allotment",
    source:
      "Day-shift staff may claim 4 reserved spots. Night-shift staff may claim 2 reserved spots. Overflow parking opens at 7:45 AM.",
    goldMeaningMap: {
      sourceIntent: "Parking allotment counts and overflow open time",
      criticalFacts: [
        {
          id: "fact_day_spots",
          type: "quantity",
          actor: "Day-shift staff",
          action: "may claim",
          value: "4",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Day-shift staff may claim 4 reserved spots.",
        },
        {
          id: "fact_night_spots",
          type: "quantity",
          actor: "Night-shift staff",
          action: "may claim",
          value: "2",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Night-shift staff may claim 2 reserved spots.",
        },
        {
          id: "fact_overflow",
          type: "schedule",
          actor: "Overflow parking",
          action: "opens",
          value: "7:45 AM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Overflow parking opens at 7:45 AM.",
        },
      ],
    },
    corruptions: [
      {
        id: "changed-number-day-spots",
        type: "changed number",
        adaptedText: "Day-shift staff may claim 6 reserved spots.",
        expectedOverallStatus: "warning",
        expectedReasonIncludes:
          "A date, time, or number may not match the source.",
      },
    ],
  },
];
