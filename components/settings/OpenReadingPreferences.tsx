"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  DEFAULT_PREFERENCES,
  type Detail,
  type Delivery,
  type Preferences,
  type Wording,
} from "@/lib/domain";
import { preferenceStore } from "@/lib/storage/preferences";
import { ReadingPreferencesDialog } from "@/components/read/ModeBar";

/**
 * Preferences list row that opens the shared Reading preferences dialog
 * in place (no navigation to /read). Writes through PreferenceStore.
 */
export function OpenReadingPreferences() {
  const [preferences, setPreferences] =
    useState<Preferences>(DEFAULT_PREFERENCES);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await preferenceStore.get();
      if (cancelled) return;
      if (stored) setPreferences(stored);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = (next: Preferences) => {
    setPreferences(next);
    void preferenceStore.set(next).catch(() => {
      // Keep in-memory selection if local write fails.
    });
  };

  const onDetail = (detail: Detail) => {
    persist({ ...preferences, detail });
  };
  const onWording = (wording: Wording) => {
    persist({ ...preferences, wording });
  };
  const onDelivery = (delivery: Delivery) => {
    persist({ ...preferences, delivery });
  };

  return (
    <ReadingPreferencesDialog
      detail={preferences.detail}
      wording={preferences.wording}
      delivery={preferences.delivery}
      disabled={!ready}
      onDetail={onDetail}
      onWording={onWording}
      onDelivery={onDelivery}
      trigger={
        <button
          type="button"
          className="font-ui group flex w-full min-h-11 cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-action-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
        >
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-sm font-semibold text-ink">
              Reading preferences
            </span>
            <span className="text-xs leading-relaxed text-ink-muted sm:text-sm">
              Detail, wording, and delivery: edit beside the note on the reading
              page. Changes save through PreferenceStore.
            </span>
          </span>
          <ChevronRight
            className="size-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-action"
            aria-hidden="true"
          />
        </button>
      }
    />
  );
}
