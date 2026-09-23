"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { isCloudAuthEnabled } from "@/lib/auth";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { useLocalAuth } from "@/components/auth/useLocalAuth";
import { Button } from "@/components/ui/button";

type AuthAccountSectionProps = {
  /** Slightly different framing on Settings vs My Content */
  variant?: "settings" | "content";
};

const DISMISS_KEYS = {
  content: "linaw.account-prompt.dismissed",
  settings: "linaw.account-prompt.settings.dismissed",
} as const;

const TOAST_COPY = {
  content: {
    title: "No account needed",
    body: "Want to keep a piece for later? Save a light profile on this device. You can keep reading without one.",
  },
  settings: {
    title: "No account needed",
    body: isCloudAuthEnabled()
      ? "Sign in only if you want the same preferences on another phone or laptop. Reading works without an account. Text you paste is not uploaded."
      : "Sign in only if you want to save a piece and keep preferences on this device. Landing, reading, and Meaning Check work without an account.",
  },
} as const;

/**
 * Optional account entry — never a login wall. Unsigned visitors see a
 * bottom toast (same chrome on Settings and My Content). Sign-in only for
 * saving titles and keeping preferences on this device for a later companion sync.
 */
export function AuthAccountSection({
  variant = "settings",
}: AuthAccountSectionProps) {
  const { ready, user, signIn, signOut } = useLocalAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(
      window.localStorage.getItem(DISMISS_KEYS[variant]) === "1",
    );
  }, [variant]);

  function dismissToast() {
    window.localStorage.setItem(DISMISS_KEYS[variant], "1");
    setDismissed(true);
  }

  if (!ready) return null;

  if (user) {
    if (variant !== "settings") return null;

    return (
      <section
        aria-label="Account on this device"
        className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-1 duration-500"
      >
        <div className="overflow-hidden rounded-xl border border-border bg-paper-raised">
          <div className="font-ui flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-sm font-semibold text-ink">
                Signed in as {user.name}
              </span>
              <span className="text-xs leading-relaxed text-ink-muted sm:text-sm">
                {isCloudAuthEnabled()
                  ? `${user.email}. Preferences on this account follow you to another browser. Text you paste is not uploaded.`
                  : `Preferences stay with this profile on this device (${user.email}). The Chrome companion on this browser receives the same preferences. Nothing is uploaded.`}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void signOut()}
              className="font-ui h-11 min-h-11 shrink-0 cursor-pointer rounded-lg border-border bg-paper-raised px-4 text-sm font-semibold text-ink shadow-none hover:bg-paper-inset hover:text-ink focus-visible:ring-2 focus-visible:ring-focus"
            >
              Sign out
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (dismissed) return null;

  const copy = TOAST_COPY[variant];

  return (
    <>
      <div
        role="region"
        aria-label="Save on this device"
        className="fixed inset-x-4 z-40 mx-auto w-auto max-w-lg animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none md:inset-x-auto md:right-6 md:w-full"
        style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-paper-raised p-3 shadow-sm sm:flex-row sm:items-center sm:gap-4 sm:p-4">
          <div className="min-w-0 flex-1">
            <p className="font-ui m-0 text-sm font-semibold leading-5 text-ink">
              {copy.title}
            </p>
            <p className="font-ui m-0 mt-1 text-sm leading-5 text-ink-muted">
              {copy.body}
            </p>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-1.5">
            <Button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="font-ui h-11 min-h-11 cursor-pointer rounded-lg bg-action px-3.5 text-sm font-semibold text-paper-raised shadow-none hover:bg-action-hover focus-visible:ring-2 focus-visible:ring-focus"
            >
              {isCloudAuthEnabled() ? "Sign in" : "Save on this device"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Dismiss"
              onClick={dismissToast}
              className="size-11 min-h-11 min-w-11 cursor-pointer text-ink-muted hover:bg-paper-inset hover:text-ink focus-visible:ring-2 focus-visible:ring-focus"
            >
              <X aria-hidden className="size-4" strokeWidth={1.75} />
            </Button>
          </div>
        </div>
      </div>
      <SignInDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSignIn={async (input) => {
          await signIn(input);
        }}
      />
    </>
  );
}
