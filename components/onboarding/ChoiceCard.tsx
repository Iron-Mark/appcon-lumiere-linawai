"use client";

import type { ChoiceValue, StepOption } from "./steps";
import { ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type ChoiceCardProps = {
  option: StepOption;
  name: string;
};

/**
 * Large single-select choice — same ToggleGroupItem + olive on-state as
 * the reading Preferences dialog, sized for Duolingo-style stacked cards.
 */
export function ChoiceCard({ option, name }: ChoiceCardProps) {
  const Icon = option.icon;
  const id = `${name}-${option.value}`;

  return (
    <ToggleGroupItem
      id={id}
      value={option.value}
      aria-label={option.label}
      aria-describedby={`${id}-hint`}
      className={cn(
        "group/choice h-auto min-h-11 w-full flex-none justify-start gap-4",
        "rounded-xl border-2 border-paper-inset bg-paper-raised px-5 py-4",
        "font-ui text-left text-base whitespace-normal text-ink shadow-none",
        "transition-[background-color,border-color,transform] duration-[var(--motion-base)]",
        "hover:bg-paper-raised hover:text-ink",
        "focus-visible:border-focus focus-visible:ring-[3px] focus-visible:ring-focus/40",
        "data-[state=on]:border-action-border data-[state=on]:bg-action-soft",
        "data-[state=on]:text-ink data-[state=on]:font-semibold",
        "motion-reduce:transition-none",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex size-11 shrink-0 items-center justify-center rounded-lg",
          "bg-paper-inset text-action",
          "group-data-[state=on]/choice:bg-action/15",
        )}
      >
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-[1.125rem] leading-snug font-semibold tracking-[0.01em]">
          {option.label}
        </span>
        <span
          id={`${id}-hint`}
          className="text-base leading-snug font-normal text-ink-muted"
        >
          {option.hint}
        </span>
      </span>
    </ToggleGroupItem>
  );
}

export type { ChoiceValue };
