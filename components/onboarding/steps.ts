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

export type ChoiceValue = Detail | Wording | Delivery | BrowserBehavior;

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

export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  {
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
  },
  {
    id: "wording",
    question: "What kind of wording feels easiest for you?",
    promptIdle: "You can stay close to the original, or use everyday words.",
    lineFor: (value) =>
      value === "original"
        ? "Original: keep the source wording."
        : value === "taglish"
          ? "Taglish: the everyday mix, with dates and rules kept as is."
          : "Plain Language: simpler words.",
    options: [
      {
        value: "original",
        label: "Original",
        hint: "Stay close to the source wording.",
        icon: Quote,
      },
      {
        value: "plain",
        label: "Plain Language",
        hint: "Use clearer, everyday words.",
        icon: MessageSquareText,
      },
      {
        value: "taglish",
        label: "Taglish",
        hint: "Tagalog–English, the way people actually talk.",
        icon: Languages,
      },
    ],
  },
  {
    id: "delivery",
    question: "Would you rather read it, or hear it?",
    promptIdle: "Either way, the words stay the same.",
    lineFor: (value) =>
      value === "read"
        ? "Read: the note stays on the page."
        : "Listen: Linaw reads the note aloud.",
    options: [
      {
        value: "read",
        label: "Read",
        hint: "Keep the note on the page.",
        icon: BookOpen,
      },
      {
        value: "listen",
        label: "Listen",
        hint: "Speak the clarified text aloud.",
        icon: Volume2,
      },
    ],
  },
  {
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
  },
] as const;

export type DraftPreferences = Partial<Preferences>;
