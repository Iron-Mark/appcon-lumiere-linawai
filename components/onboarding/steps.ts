import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  FileText,
  Hand,
  Languages,
  List,
  MessageSquareText,
  Quote,
  Volume2,
  Wand2,
} from "lucide-react";
import type {
  BrowserBehavior,
  Delivery,
  Detail,
  Preferences,
  Wording,
} from "@/lib/domain";

/** Steps are the choice dimensions only — sync metadata like `updatedAt` is not a step. */
export type StepId = Exclude<keyof Preferences, "updatedAt">;

/** Wording choices offered in onboarding, including optional Taglish. */
export type OnboardingWording = Wording;

export type ChoiceValue = Detail | OnboardingWording | Delivery | BrowserBehavior;

export type StepOption<T extends ChoiceValue = ChoiceValue> = {
  value: T;
  label: string;
  hint: string;
  icon: LucideIcon;
};

export type OnboardingStep = {
  id: StepId;
  question: string;
  promptIdle: string;
  lineFor: (value: ChoiceValue) => string;
  /** Two or more choices; keyboard cycling wraps around the list. */
  options: readonly [StepOption, StepOption, ...StepOption[]];
};

export type DraftPreferences = Partial<Preferences>;

export const ONBOARDING_STEP_IDS: readonly StepId[] = [
  "detail",
  "wording",
  "delivery",
  "browserBehavior",
] as const;

export const TOTAL_ONBOARDING_STEPS = ONBOARDING_STEP_IDS.length;

function isKeyPoints(draft: DraftPreferences): boolean {
  return draft.detail === "key_points";
}

function isPlain(draft: DraftPreferences): boolean {
  return draft.wording === "plain";
}

function isListen(draft: DraftPreferences): boolean {
  return draft.delivery === "listen";
}

function detailStep(): OnboardingStep {
  return {
    id: "detail",
    question: "How much of a message would you like to read?",
    promptIdle: "Some people want every line. Others want the essentials.",
    lineFor: (value) =>
      value === "full"
        ? "Full: keep more of the source."
        : "Key Points: focus on the essentials.",
    options: [
      {
        value: "full",
        label: "Full",
        hint: "Keep the complete clarified text.",
        icon: FileText,
      },
      {
        value: "key_points",
        label: "Key Points",
        hint: "Surface the essentials first.",
        icon: List,
      },
    ],
  };
}

function wordingStep(draft: DraftPreferences): OnboardingStep {
  const keyPoints = isKeyPoints(draft);
  return {
    id: "wording",
    question: keyPoints
      ? "How should those key points be worded?"
      : "How should the full message be worded?",
    promptIdle: keyPoints
      ? "The sample stays short. Pick the wording that feels easiest."
      : "The sample keeps the complete message. Pick wording that feels easiest.",
    lineFor: (value) =>
      value === "original"
        ? keyPoints
          ? "Original: short list, close to the source words."
          : "Original: keep the source wording."
        : value === "plain"
          ? keyPoints
            ? "Plain Language: the same short list, in everyday words."
            : "Plain Language: simpler words."
          : keyPoints
            ? "Taglish: the same short list, in everyday Taglish."
            : "Taglish: everyday Tagalog and English, with terms kept intact.",
    options: [
      {
        value: "original",
        label: "Original",
        hint: keyPoints
          ? "Keep the short list close to the source words."
          : "Stay close to the source wording.",
        icon: Quote,
      },
      {
        value: "plain",
        label: "Plain Language",
        hint: keyPoints
          ? "Say the same short list in everyday words."
          : "Use clearer, everyday words.",
        icon: MessageSquareText,
      },
      {
        value: "taglish",
        label: "Taglish",
        hint: "Everyday Tagalog and English. Dates and conditions stay as written.",
        icon: Languages,
      },
    ],
  };
}

function deliveryStep(draft: DraftPreferences): OnboardingStep {
  const keyPoints = isKeyPoints(draft);
  const plain = isPlain(draft);
  const subject = keyPoints
    ? plain
      ? "those plain-language key points"
      : "those key points"
    : plain
      ? "that plain-language message"
      : "the full message";

  return {
    id: "delivery",
    question: `Would you rather read ${subject}, or hear ${keyPoints ? "them" : "it"}?`,
    promptIdle: keyPoints
      ? "Either way, the short list stays the same."
      : "Either way, the words stay the same.",
    lineFor: (value) =>
      value === "read"
        ? keyPoints
          ? "Read: the key points stay on the page."
          : "Read: the note stays on the page."
        : keyPoints
          ? "Listen: Linaw reads the key points aloud."
          : "Listen: Linaw reads the note aloud.",
    options: [
      {
        value: "read",
        label: "Read",
        hint: keyPoints
          ? "Keep the key points on the page."
          : "Keep the note on the page.",
        icon: BookOpen,
      },
      {
        value: "listen",
        label: "Listen",
        hint: keyPoints
          ? "Speak the key points aloud."
          : "Speak the clarified text aloud.",
        icon: Volume2,
      },
    ],
  };
}

function browserBehaviorStep(draft: DraftPreferences): OnboardingStep {
  if (isListen(draft)) {
    return {
      id: "browserBehavior",
      question: "When should the browser extension clarify a page?",
      promptIdle:
        "Listen still plays the clarified note aloud here. Auto-Clarify is only about the extension.",
      lineFor: (value) =>
        value === "auto_adapt"
          ? "Auto-Clarify is for the extension. Clarify here is still read aloud."
          : "Manual extension. Clarify here is still read aloud when you ask.",
      options: [
        {
          value: "auto_adapt",
          label: "Auto-Clarify",
          hint: "After you opt in, the extension can clarify pages for you.",
          icon: Wand2,
        },
        {
          value: "manual",
          label: "Manual",
          hint: "You decide when the extension clarifies. Listen still works on this page.",
          icon: Hand,
        },
      ],
    };
  }

  return {
    id: "browserBehavior",
    question: "When you are on a page, should Linaw wait for you?",
    promptIdle: "Auto-Clarify stays off until you choose it.",
    lineFor: (value) =>
      value === "auto_adapt"
        ? "Auto-Clarify: clarify pages when you ask the extension."
        : "Manual: you choose when to clarify.",
    options: [
      {
        value: "auto_adapt",
        label: "Auto-Clarify",
        hint: "Let the extension clarify when you opt in.",
        icon: Wand2,
      },
      {
        value: "manual",
        label: "Manual",
        hint: "You decide when to clarify a page.",
        icon: Hand,
      },
    ],
  };
}

/**
 * Resolve the step at `index` using choices so far.
 * Prior answers change the question, hints, and Sindi lines. Stored values stay the same.
 */
export function resolveOnboardingStep(
  index: number,
  draft: DraftPreferences = {},
): OnboardingStep {
  const id = ONBOARDING_STEP_IDS[index] ?? "detail";
  switch (id) {
    case "wording":
      return wordingStep(draft);
    case "delivery":
      return deliveryStep(draft);
    case "browserBehavior":
      return browserBehaviorStep(draft);
    case "detail":
    default:
      return detailStep();
  }
}

/** Default steps with an empty draft (no prior answers). Prefer `resolveOnboardingStep` in the flow. */
export const ONBOARDING_STEPS: readonly OnboardingStep[] =
  ONBOARDING_STEP_IDS.map((_, index) => resolveOnboardingStep(index, {}));

/** Resolve the draft value for a step only if it is still an offered choice. */
export function choiceForStep(
  step: OnboardingStep,
  draft: DraftPreferences,
): ChoiceValue | undefined {
  const value = draft[step.id];
  if (value === undefined) return undefined;
  return step.options.some((option) => option.value === value)
    ? (value as ChoiceValue)
    : undefined;
}

/** Short labels for a saved profile line (empty /read, ModeBar-style). */
export function preferenceSummaryLabels(prefs: Pick<
  Preferences,
  "detail" | "wording" | "delivery"
>): string[] {
  const detail = prefs.detail === "key_points" ? "Key Points" : "Full";
  const wording =
    prefs.wording === "plain"
      ? "Plain Language"
      : prefs.wording === "taglish"
        ? "Taglish"
        : "Original";
  const delivery = prefs.delivery === "listen" ? "Listen" : "Read";
  return [detail, wording, delivery];
}
