import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  FileText,
  Hand,
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

export type StepId = keyof Preferences;

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
  options: readonly [StepOption, StepOption];
};

export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  {
    id: "detail",
    question: "How much detail?",
    promptIdle: "Choose how much of the source to keep.",
    lineFor: (value) =>
      value === "full"
        ? "Full — keep more of the source."
        : "Key Points — focus on the essentials.",
    options: [
      {
        value: "full",
        label: "Full",
        hint: "Keep the complete adapted text.",
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
    question: "How should it sound?",
    promptIdle: "Choose the wording that feels clearest.",
    lineFor: (value) =>
      value === "original"
        ? "Original — keep the source wording."
        : "Plain Language — simpler words.",
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
    ],
  },
  {
    id: "delivery",
    question: "How do you want it delivered?",
    promptIdle: "Read it or listen to it.",
    lineFor: (value) =>
      value === "read"
        ? "Read — show the adapted text."
        : "Listen — speak the adapted text.",
    options: [
      {
        value: "read",
        label: "Read",
        hint: "Show the adapted text on screen.",
        icon: BookOpen,
      },
      {
        value: "listen",
        label: "Listen",
        hint: "Speak the adapted text aloud.",
        icon: Volume2,
      },
    ],
  },
  {
    id: "browserBehavior",
    question: "How should the browser behave?",
    promptIdle: "Auto-Adapt stays off until you choose it.",
    lineFor: (value) =>
      value === "auto_adapt"
        ? "Auto-Adapt — adapt pages when you ask the extension."
        : "Manual — you choose when to adapt.",
    options: [
      {
        value: "auto_adapt",
        label: "Auto-Adapt",
        hint: "Let the extension adapt when you opt in.",
        icon: Wand2,
      },
      {
        value: "manual",
        label: "Manual",
        hint: "You decide when to adapt a page.",
        icon: Hand,
      },
    ],
  },
] as const;

export type DraftPreferences = Partial<Preferences>;
