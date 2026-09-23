"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

type ErrorToastProps = {
  message: string | null;
  onDismiss: () => void;
  /** Auto-dismiss delay; pauses while hovered or focused. */
  durationMs?: number;
  /** Recovery action, e.g. Retry. Toasts with an action stay up longer. */
  action?: { label: string; onClick: () => void } | null;
};

/**
 * Bottom-right toast for recoverable errors. Does not steal focus;
 * announced via role="alert". One toast at a time — a new message
 * replaces the current one and restarts the timer.
 */
export function ErrorToast({
  message,
  onDismiss,
  durationMs: durationProp,
  action = null,
}: ErrorToastProps) {
  const durationMs = durationProp ?? (action ? 10000 : 6000);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (!message) return;
    const start = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (!pausedRef.current) onDismiss();
      }, durationMs);
    };
    start();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [message, durationMs, onDismiss]);

  const pause = () => {
    pausedRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
  };
  const resume = () => {
    pausedRef.current = false;
    timerRef.current = setTimeout(onDismiss, Math.min(durationMs, 2500));
  };

  if (!message) return null;

  return (
    <div
      key={message}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      className="font-ui animate-in fade-in-0 slide-in-from-bottom-3 duration-300 ease-out fill-mode-both motion-reduce:animate-none"
      style={{
        position: "fixed",
        right: "max(1rem, env(safe-area-inset-right))",
        bottom: "max(1rem, env(safe-area-inset-bottom))",
        zIndex: 60,
        display: "flex",
        alignItems: "flex-start",
        gap: "0.65rem",
        width: "min(24rem, calc(100vw - 2rem))",
        padding: "0.85rem 0.75rem 0.85rem 0.95rem",
        borderRadius: "0.85rem",
        background: "var(--color-paper-raised)",
        border: "1px solid var(--color-paper-inset)",
        borderLeft: "3px solid var(--color-warning-border)",
        boxShadow:
          "0 1px 2px color-mix(in srgb, var(--color-ink) 8%, transparent), 0 18px 44px -20px color-mix(in srgb, var(--color-ink) 35%, transparent)",
        color: "var(--color-ink)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          width: "1.75rem",
          height: "1.75rem",
          borderRadius: 999,
          background: "var(--color-warning-soft)",
          color: "var(--color-warning)",
        }}
      >
        <AlertTriangle size={15} strokeWidth={2.25} />
      </span>
      <div style={{ flex: 1, minWidth: 0, paddingTop: "0.2rem" }}>
        <p
          style={{
            margin: 0,
            fontSize: "0.9375rem",
            lineHeight: 1.45,
          }}
        >
          {message}
        </p>
        {action ? (
          <button
            type="button"
            onClick={action.onClick}
            className="cursor-pointer rounded-md transition-colors duration-150 hover:bg-action-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 motion-reduce:transition-none"
            style={{
              marginTop: "0.5rem",
              marginLeft: "-0.4rem",
              minHeight: "2.25rem",
              padding: "0.3rem 0.65rem",
              border: "1px solid var(--color-action-border)",
              background: "transparent",
              color: "var(--color-action)",
              fontFamily: "var(--font-ui)",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {action.label}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="cursor-pointer rounded-md text-ink-subtle transition-colors duration-150 hover:bg-paper-inset hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 motion-reduce:transition-none"
        style={{
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "1.75rem",
          height: "1.75rem",
          border: 0,
          background: "transparent",
          padding: 0,
        }}
      >
        <X size={15} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}
