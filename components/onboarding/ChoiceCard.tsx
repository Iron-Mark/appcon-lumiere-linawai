"use client";

import type { KeyboardEvent } from "react";
import { Check } from "lucide-react";
import type { ChoiceValue, StepOption } from "./steps";

type ChoiceCardProps = {
  option: StepOption;
  selected: boolean;
  name: string;
  onSelect: (value: ChoiceValue) => void;
};

export function ChoiceCard({
  option,
  selected,
  name,
  onSelect,
}: ChoiceCardProps) {
  const id = `${name}-${option.value}`;

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(option.value);
    }
  }

  return (
    <button
      type="button"
      id={id}
      role="radio"
      aria-checked={selected}
      aria-labelledby={`${id}-label`}
      aria-describedby={`${id}-hint`}
      onClick={() => onSelect(option.value)}
      onKeyDown={handleKeyDown}
      className={`onboarding-choice${selected ? " is-selected" : ""}`}
    >
      <span className="onboarding-choice-body">
        <span className="onboarding-choice-title">
          <span id={`${id}-label`}>{option.label}</span>
          <Check
            className="onboarding-choice-check"
            size={18}
            strokeWidth={2.25}
            aria-hidden="true"
          />
        </span>
        <span id={`${id}-hint`} className="onboarding-choice-hint">
          {option.hint}
        </span>
      </span>
    </button>
  );
}
