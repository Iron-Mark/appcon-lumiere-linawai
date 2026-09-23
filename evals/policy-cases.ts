import type { EvalCase } from "./schema";

/**
 * Procedural / policy excerpts — a canon source category not covered by
 * school, campus-org, workplace, or public-advisory cases.
 */
export const policyEvalCases: EvalCase[] = [
  {
    id: "policy-dorm-quiet-hours",
    title: "Residence hall quiet-hours policy",
    source:
      "Residents must keep noise low after 10:00 PM on weeknights. RAs may issue warnings until 11:30 PM. Overnight guests are allowed only with a signed host form.",
    goldMeaningMap: {
      sourceIntent: "Dorm quiet hours, RA warning window, overnight guest rule",
      criticalFacts: [
        {
          id: "fact_quiet_hours",
          type: "schedule",
          actor: "Residents",
          action: "keep noise low",
          value: "10:00 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence:
            "Residents must keep noise low after 10:00 PM on weeknights.",
        },
        {
          id: "fact_ra_warnings",
          type: "schedule",
          actor: "RAs",
          action: "may issue warnings",
          value: "11:30 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "RAs may issue warnings until 11:30 PM.",
        },
        {
          id: "fact_overnight_guests",
          type: "exception",
          actor: "Overnight guests",
          action: "are allowed",
          value: null,
          condition: "only with a signed host form",
          exception: "a signed host form",
          negated: false,
          evidence:
            "Overnight guests are allowed only with a signed host form.",
        },
      ],
    },
    corruptions: [
      {
        id: "faithful-quiet-hours",
        type: "faithful paraphrase",
        adaptedText:
          "Residents must keep noise low after 10:00 PM on weeknights. RAs may issue warnings until 11:30 PM. Overnight guests are allowed only with a signed host form.",
        expectedOverallStatus: "pass",
      },
      {
        id: "actor-value-swap-quiet",
        type: "actor/value swap",
        adaptedText: "Everyone keep noise low after 10:00 PM.",
        expectedOverallStatus: "warning",
        expectedReasonIncludes:
          "The time appears to be attached to the wrong group.",
      },
    ],
  },
  {
    id: "policy-lab-equipment-checkout",
    title: "Shared lab equipment checkout policy",
    source:
      "Graduate students may reserve equipment for 4 hours. Undergraduates may reserve equipment for 2 hours. Walk-in checkouts are accepted only if the bay is free.",
    goldMeaningMap: {
      sourceIntent: "Lab reservation lengths and walk-in condition",
      criticalFacts: [
        {
          id: "fact_grad_hours",
          type: "quantity",
          actor: "Graduate students",
          action: "may reserve equipment",
          value: "4",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Graduate students may reserve equipment for 4 hours.",
        },
        {
          id: "fact_undergrad_hours",
          type: "quantity",
          actor: "Undergraduates",
          action: "may reserve equipment",
          value: "2",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Undergraduates may reserve equipment for 2 hours.",
        },
        {
          id: "fact_walkin",
          type: "condition",
          actor: "Walk-in checkouts",
          action: "are accepted",
          value: null,
          condition: "only if the bay is free",
          exception: null,
          negated: false,
          evidence:
            "Walk-in checkouts are accepted only if the bay is free.",
        },
      ],
    },
    corruptions: [
      {
        id: "changed-number-grad-hours",
        type: "changed number",
        adaptedText: "Graduate students may reserve equipment for 8 hours.",
        expectedOverallStatus: "warning",
        expectedReasonIncludes:
          "A date, time, or number may not match the source.",
      },
      {
        id: "dropped-condition-walkin",
        type: "dropped condition",
        adaptedText: "Walk-in checkouts are accepted at noon.",
        expectedOverallStatus: "warning",
        expectedReasonIncludes: "Important condition may have changed.",
      },
    ],
  },
  {
    id: "policy-data-retention",
    title: "Research data retention policy",
    source:
      "Principal investigators must not delete project datasets after 30 days. Lab managers may archive copies until day 90. Exceptions require written IRB approval.",
    goldMeaningMap: {
      sourceIntent: "Data deletion ban, archive window, IRB exception",
      criticalFacts: [
        {
          id: "fact_delete_ban",
          type: "prohibition",
          actor: "Principal investigators",
          action: "delete project datasets",
          value: "30",
          condition: null,
          exception: null,
          negated: true,
          evidence:
            "Principal investigators must not delete project datasets after 30 days.",
        },
        {
          id: "fact_archive_window",
          type: "quantity",
          actor: "Lab managers",
          action: "may archive copies",
          value: "90",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Lab managers may archive copies until day 90.",
        },
        {
          id: "fact_irb",
          type: "exception",
          actor: "Exceptions",
          action: "require",
          value: null,
          condition: null,
          exception: "written IRB approval",
          negated: false,
          evidence: "Exceptions require written IRB approval.",
        },
      ],
    },
    corruptions: [
      {
        id: "flipped-negation-delete",
        type: "flipped negation",
        adaptedText:
          "Principal investigators delete project datasets after 30 days.",
        expectedOverallStatus: "repair_required",
        expectedReasonIncludes:
          "A restriction or negation may have changed.",
      },
    ],
  },
  {
    id: "policy-tuition-refund",
    title: "Tuition refund request policy",
    source:
      "Students must file refund requests by Friday at 3:00 PM. Advisers should review drafts by Thursday at 12:00 PM. Late requests are accepted only with registrar approval.",
    goldMeaningMap: {
      sourceIntent: "Refund filing deadline, adviser review, late exception",
      criticalFacts: [
        {
          id: "fact_student_deadline",
          type: "deadline",
          actor: "Students",
          action: "file refund requests",
          value: "Friday at 3:00 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence:
            "Students must file refund requests by Friday at 3:00 PM.",
        },
        {
          id: "fact_adviser_review",
          type: "deadline",
          actor: "Advisers",
          action: "review drafts",
          value: "Thursday at 12:00 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Advisers should review drafts by Thursday at 12:00 PM.",
        },
        {
          id: "fact_late_refund",
          type: "exception",
          actor: "Late requests",
          action: "are accepted",
          value: null,
          condition: "only with registrar approval",
          exception: "registrar approval",
          negated: false,
          evidence:
            "Late requests are accepted only with registrar approval.",
        },
      ],
    },
    corruptions: [
      {
        id: "faithful-tuition-refund",
        type: "faithful paraphrase",
        adaptedText:
          "Students must file refund requests by Friday at 3:00 PM. Advisers should review drafts by Thursday at 12:00 PM. Late requests are accepted only with registrar approval.",
        expectedOverallStatus: "pass",
      },
      {
        id: "dropped-deadline-students",
        type: "dropped critical fact",
        adaptedText:
          "Advisers should review drafts by Thursday at 12:00 PM. Late requests are accepted only with registrar approval.",
        expectedOverallStatus: "warning",
        expectedReasonIncludes:
          "A deadline or schedule detail may be missing.",
      },
    ],
  },
];
