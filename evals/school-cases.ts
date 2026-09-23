import type { EvalCase } from "./schema";

/** School notices — short, realistic admin/classroom messages. */
export const schoolEvalCases: EvalCase[] = [
  {
    id: "school-science-fair-forms",
    title: "Science fair form deadline",
    source:
      "Grade 10 students must submit science fair forms by Monday at 3:00 PM. Advisers should collect forms at 2:00 PM. Late forms are accepted only with a signed note from a parent.",
    goldMeaningMap: {
      sourceIntent: "Science fair form deadline and collection schedule",
      criticalFacts: [
        {
          id: "fact_submit_deadline",
          type: "deadline",
          actor: "Grade 10 students",
          action: "submit science fair forms",
          value: "Monday at 3:00 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence:
            "Grade 10 students must submit science fair forms by Monday at 3:00 PM.",
        },
        {
          id: "fact_advisers_collect",
          type: "schedule",
          actor: "Advisers",
          action: "collect forms",
          value: "2:00 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Advisers should collect forms at 2:00 PM.",
        },
        {
          id: "fact_late_forms",
          type: "exception",
          actor: "Late forms",
          action: "are accepted",
          value: null,
          condition: "only with a signed note from a parent",
          exception: "a signed note from a parent",
          negated: false,
          evidence:
            "Late forms are accepted only with a signed note from a parent.",
        },
      ],
    },
    corruptions: [
      {
        id: "actor-value-swap-collect",
        type: "actor/value swap",
        adaptedText: "All students collect forms at 2:00 PM.",
        expectedOverallStatus: "warning",
        expectedReasonIncludes:
          "The time appears to be attached to the wrong group.",
      },
    ],
  },
  {
    id: "school-library-hours",
    title: "Library shortened hours",
    source:
      "The school library closes at 4:00 PM on exam week. Students may borrow up to 2 books. Overnight holds are not allowed without librarian approval.",
    goldMeaningMap: {
      sourceIntent: "Exam-week library hours and borrowing limits",
      criticalFacts: [
        {
          id: "fact_close_time",
          type: "schedule",
          actor: "The school library",
          action: "closes",
          value: "4:00 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "The school library closes at 4:00 PM on exam week.",
        },
        {
          id: "fact_borrow_limit",
          type: "quantity",
          actor: "Students",
          action: "borrow",
          value: "2",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Students may borrow up to 2 books.",
        },
        {
          id: "fact_overnight_ban",
          type: "prohibition",
          actor: "Overnight holds",
          action: "are not allowed",
          value: null,
          condition: "without librarian approval",
          exception: "librarian approval",
          negated: true,
          evidence:
            "Overnight holds are not allowed without librarian approval.",
        },
      ],
    },
    corruptions: [
      {
        id: "changed-number-borrow",
        type: "changed number",
        adaptedText: "Students may borrow up to 5 books.",
        expectedOverallStatus: "warning",
        expectedReasonIncludes:
          "A date, time, or number may not match the source.",
      },
    ],
  },
  {
    id: "school-field-trip-bus",
    title: "Field trip bus departure",
    source:
      "Chaperones should board the bus at 7:15 AM. Students should board at 7:45 AM. Trips leave only if attendance is complete.",
    goldMeaningMap: {
      sourceIntent: "Field trip boarding times and departure condition",
      criticalFacts: [
        {
          id: "fact_chaperones_board",
          type: "schedule",
          actor: "Chaperones",
          action: "board the bus",
          value: "7:15 AM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Chaperones should board the bus at 7:15 AM.",
        },
        {
          id: "fact_students_board",
          type: "schedule",
          actor: "Students",
          action: "board",
          value: "7:45 AM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Students should board at 7:45 AM.",
        },
        {
          id: "fact_leave_condition",
          type: "condition",
          actor: "Trips",
          action: "leave",
          value: null,
          condition: "only if attendance is complete",
          exception: null,
          negated: false,
          evidence: "Trips leave only if attendance is complete.",
        },
      ],
    },
    corruptions: [
      {
        id: "dropped-condition-leave",
        type: "dropped condition",
        adaptedText: "Trips leave at 7:45 AM.",
        expectedOverallStatus: "warning",
        expectedReasonIncludes: "Important condition may have changed.",
      },
    ],
  },
  {
    id: "school-lab-after-hours",
    title: "Science lab after-hours rule",
    source:
      "Students must not enter the science lab after 5:00 PM. Teachers may stay until 6:30 PM. Equipment loans require a signed pass.",
    goldMeaningMap: {
      sourceIntent: "After-hours lab access and loan rule",
      criticalFacts: [
        {
          id: "fact_students_ban",
          type: "prohibition",
          actor: "Students",
          action: "enter the science lab",
          value: "after 5:00 PM",
          condition: null,
          exception: null,
          negated: true,
          evidence: "Students must not enter the science lab after 5:00 PM.",
        },
        {
          id: "fact_teachers_stay",
          type: "schedule",
          actor: "Teachers",
          action: "may stay",
          value: "6:30 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Teachers may stay until 6:30 PM.",
        },
        {
          id: "fact_loan_pass",
          type: "condition",
          actor: "Equipment loans",
          action: "require",
          value: null,
          condition: "a signed pass",
          exception: null,
          negated: false,
          evidence: "Equipment loans require a signed pass.",
        },
      ],
    },
    corruptions: [
      {
        id: "flipped-negation-lab",
        type: "flipped negation",
        adaptedText: "Students enter the science lab after 5:00 PM.",
        expectedOverallStatus: "repair_required",
        expectedReasonIncludes:
          "A restriction or negation may have changed.",
      },
    ],
  },
  {
    id: "school-parent-conference",
    title: "Parent–teacher conference slots",
    source:
      "Homeroom teachers meet families from 1:00 PM. Subject teachers meet families from 2:30 PM. Walk-ins are accepted only with the principal’s approval.",
    goldMeaningMap: {
      sourceIntent: "Parent conference schedule and walk-in exception",
      criticalFacts: [
        {
          id: "fact_homeroom",
          type: "schedule",
          actor: "Homeroom teachers",
          action: "meet families",
          value: "1:00 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Homeroom teachers meet families from 1:00 PM.",
        },
        {
          id: "fact_subject",
          type: "schedule",
          actor: "Subject teachers",
          action: "meet families",
          value: "2:30 PM",
          condition: null,
          exception: null,
          negated: false,
          evidence: "Subject teachers meet families from 2:30 PM.",
        },
        {
          id: "fact_walkins",
          type: "exception",
          actor: "Walk-ins",
          action: "are accepted",
          value: null,
          condition: "only with the principal’s approval",
          exception: "the principal’s approval",
          negated: false,
          evidence:
            "Walk-ins are accepted only with the principal’s approval.",
        },
      ],
    },
    corruptions: [
      {
        id: "wrong-time-homeroom",
        type: "wrong time",
        adaptedText: "Homeroom teachers meet families from 3:00 PM.",
        expectedOverallStatus: "warning",
        expectedReasonIncludes:
          "A date, time, or number may not match the source.",
      },
    ],
  },
];
