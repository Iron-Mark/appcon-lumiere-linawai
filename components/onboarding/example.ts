import type { ChoiceValue, DraftPreferences, StepId } from "./steps";

const SOURCE = [
  "Members of the Linaw campus pilot must confirm their orientation seat by Thursday at 5 PM.",
  "Mentors should arrive Friday at 8:30 AM. Other members should arrive at 9:00 AM.",
  "Late confirmations are accepted only with written approval from the program coordinator.",
];

const KEY_POINTS = [
  "Confirm your orientation seat by Thursday at 5 PM.",
  "Mentors arrive Friday at 8:30 AM.",
  "Other members arrive at 9:00 AM.",
  "Late confirmations need written approval.",
];

const PLAIN = [
  "Please confirm your orientation seat by Thursday at 5 PM.",
  "Mentors arrive on Friday at 8:30 AM. Other members arrive at 9:00 AM.",
  "If you confirm late, you need written approval from the program coordinator.",
];

const PLAIN_POINTS = [
  "Confirm your seat by Thursday at 5 PM.",
  "Mentors arrive Friday at 8:30 AM.",
  "Everyone else arrives at 9:00 AM.",
  "A late confirmation needs written approval.",
];

export type ChoiceExampleData = {
  kicker: string;
  blocks: string[];
  list: boolean;
  spoken: boolean;
};

export const EXAMPLE_MEASURE_SETS = {
  source: SOURCE,
  plain: PLAIN,
  keyPoints: KEY_POINTS,
  plainPoints: PLAIN_POINTS,
} as const;

function detailBlocks(
  draft: DraftPreferences,
  detail: "full" | "key_points",
): ChoiceExampleData {
  const plain = draft.wording === "plain";
  if (detail === "key_points") {
    return {
      kicker: plain ? "Key points, in everyday words" : "Key points",
      blocks: plain ? PLAIN_POINTS : KEY_POINTS,
      list: true,
      spoken: false,
    };
  }
  return {
    kicker: plain ? "The full message, in everyday words" : "The full message",
    blocks: plain ? PLAIN : SOURCE,
    list: false,
    spoken: false,
  };
}

function sampleFromDraft(draft: DraftPreferences): ChoiceExampleData {
  const detail = draft.detail === "key_points" ? "key_points" : "full";
  return detailBlocks(draft, detail);
}

export function exampleFor(
  stepId: StepId,
  selected: ChoiceValue | undefined,
  draft: DraftPreferences,
): ChoiceExampleData {
  if (!selected) {
    if (stepId === "detail") {
      return {
        kicker: "A sample message",
        blocks: SOURCE,
        list: false,
        spoken: false,
      };
    }
    return sampleFromDraft(draft);
  }

  if (stepId === "detail") {
    return detailBlocks(
      draft,
      selected === "key_points" ? "key_points" : "full",
    );
  }

  if (stepId === "wording") {
    const next = {
      ...draft,
      wording: selected === "plain" ? "plain" : "original",
    } as DraftPreferences;
    return detailBlocks(
      next,
      draft.detail === "key_points" ? "key_points" : "full",
    );
  }

  if (stepId === "delivery") {
    const next = {
      ...draft,
      delivery: selected === "listen" ? "listen" : "read",
    } as DraftPreferences;
    const example = detailBlocks(
      next,
      draft.detail === "key_points" ? "key_points" : "full",
    );
    return {
      ...example,
      kicker:
        selected === "listen"
          ? "Linaw would read this aloud"
          : example.kicker,
      spoken: selected === "listen",
    };
  }

  const sample = detailBlocks(
    draft,
    draft.detail === "key_points" ? "key_points" : "full",
  );

  if (draft.delivery === "listen") {
    return {
      ...sample,
      kicker:
        selected === "auto_adapt"
          ? "Clarify here is read aloud. After you opt in, a page can look like this"
          : "Clarify here is read aloud. You choose when a page looks like this",
    };
  }

  return {
    ...sample,
    kicker:
      selected === "auto_adapt"
        ? "After you opt in, a page you open can look like this"
        : "You choose the message, then it can look like this",
  };
}
