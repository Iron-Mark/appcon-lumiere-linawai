"use client";

import type { KeyboardEvent } from "react";
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
  const Icon = option.icon;
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
      style={{
        display: "flex",
        width: "100%",
        alignItems: "flex-start",
        gap: "1rem",
        padding: "1.25rem 1.35rem",
        textAlign: "left",
        cursor: "pointer",
        borderRadius: "0.75rem",
        border: selected
          ? "2px solid var(--color-action-border)"
          : "2px solid var(--color-paper-inset)",
        background: selected
          ? "var(--color-action-soft)"
          : "var(--color-paper-raised)",
        color: "var(--color-ink)",
        fontFamily: "var(--font-ui)",
        fontSize: "1rem",
        lineHeight: 1.45,
        transition:
          "background var(--motion-base) ease, border-color var(--motion-base) ease, transform var(--motion-fast) ease",
        transform: selected ? "scale(0.98)" : "scale(1)",
        boxShadow: selected
          ? "none"
          : "0 1px 0 color-mix(in srgb, var(--color-ink) 6%, transparent)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2.75rem",
          height: "2.75rem",
          flexShrink: 0,
          borderRadius: "0.5rem",
          background: selected
            ? "color-mix(in srgb, var(--color-action) 14%, var(--color-paper-raised))"
            : "var(--color-paper-inset)",
          color: "var(--color-action)",
        }}
      >
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: "0.35rem", minWidth: 0 }}>
        <span
          id={`${id}-label`}
          style={{
            fontWeight: 600,
            fontSize: "1.125rem",
            letterSpacing: "0.01em",
          }}
        >
          {option.label}
        </span>
        <span
          id={`${id}-hint`}
          style={{
            color: "var(--color-ink-muted)",
            fontSize: "1rem",
            lineHeight: 1.45,
          }}
        >
          {option.hint}
        </span>
      </span>
    </button>
  );
}
