"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_PREFERENCES,
  type Detail,
  type Delivery,
  type Preferences,
  type Wording,
} from "@/lib/domain";
import { preferenceStore } from "@/lib/storage/preferences";
import { ReadingPreferencesDialog } from "@/components/read/ModeBar";
import { Button } from "@/components/ui/button";

/**
 * Settings CTA that opens the shared Reading preferences dialog in place
 * (no navigation to /read). Writes through PreferenceStore.
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
        <Button
          type="button"
          className="font-ui h-11 min-h-11 cursor-pointer rounded-lg bg-action px-4 text-sm font-semibold text-paper-raised shadow-none hover:bg-action-hover focus-visible:ring-2 focus-visible:ring-focus"
        >
          Open reading preferences
        </Button>
      }
    />
  );
}
