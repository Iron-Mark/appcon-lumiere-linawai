"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";

import { useLocalAuth } from "@/components/auth/useLocalAuth";
import { preferenceSummaryLabels } from "@/components/onboarding/steps";
import { preferenceStore } from "@/lib/storage/preferences";

type AuthAccountSectionProps = {
  variant?: "settings" | "content";
};

/**
 * Flat account row. Unsigned visitors go to /account.
 * Signed-in visitors see name, email, and their preference line.
 */
export function AuthAccountSection({
  variant = "settings",
}: AuthAccountSectionProps) {
  const { ready, user, signOut } = useLocalAuth();
  const [preferenceLine, setPreferenceLine] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setPreferenceLine(null);
      return;
    }
    let cancelled = false;
    void preferenceStore.get().then((prefs) => {
      if (cancelled || !prefs) return;
      setPreferenceLine(preferenceSummaryLabels(prefs).join(" · "));
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!ready) return null;

  if (!user) {
    return (
      <div className="font-ui flex flex-col gap-3 border-b border-border py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex max-w-xl flex-col gap-1">
          <p className="m-0 text-sm font-medium text-ink">
            {variant === "content" ? "Save across devices" : "Account is optional"}
          </p>
          <p className="m-0 text-sm leading-relaxed text-ink-muted">
            Reading works without one. An account carries your preferences to
            another phone or laptop. Pasted text stays on this device.
          </p>
        </div>
        <Link
          href="/account"
          className="inline-flex min-h-11 cursor-pointer items-center text-sm font-medium text-ink underline decoration-action-border underline-offset-4 hover:text-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          Create account or sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="font-ui flex flex-col gap-3 border-b border-border py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-lg bg-action-soft text-action">
          <UserRound className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
        <p className="m-0 text-base font-medium text-ink">{user.name}</p>
        <p className="m-0 text-sm text-ink-muted">{user.email}</p>
        {preferenceLine ? (
          <p className="m-0 text-sm text-ink-muted">{preferenceLine}</p>
        ) : null}
        </div>
      </div>
      <button
        type="button"
        onClick={() => void signOut()}
        className="inline-flex min-h-11 cursor-pointer items-center self-start text-sm font-medium text-ink-muted underline decoration-border underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:ml-8"
      >
        Sign out
      </button>
    </div>
  );
}
