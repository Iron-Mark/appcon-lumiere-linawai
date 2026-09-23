"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { SignInDialog } from "@/components/auth/SignInDialog";
import { useLocalAuth } from "@/components/auth/useLocalAuth";
import { Button } from "@/components/ui/button";

type AuthAccountSectionProps = {
  /** Slightly different framing on Settings vs My Content */
  variant?: "settings" | "content";
};

const ACCOUNT_TOAST_DISMISS_KEY = "linaw.account-prompt.dismissed";

/**
 * Optional account entry — never a login wall. Sign-in only for saving titles
 * and keeping preferences on this device for a later companion sync.
 */
export function AuthAccountSection({
  variant = "settings",
}: AuthAccountSectionProps) {
  const { ready, user, signIn, signOut } = useLocalAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (variant !== "content") return;
    setDismissed(window.localStorage.getItem(ACCOUNT_TOAST_DISMISS_KEY) === "1");
  }, [variant]);

  function dismissToast() {
    window.localStorage.setItem(ACCOUNT_TOAST_DISMISS_KEY, "1");
    setDismissed(true);
  }

  if (variant === "content") {
    if (!ready || user || dismissed) return null;

    return (
      <>
        <div
          role="region"
          aria-label="Save on this device"
          className="fixed inset-x-4 z-40 mx-auto w-auto max-w-lg animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none md:inset-x-auto md:right-6 md:w-full"
          style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-start gap-3 rounded-xl border border-border bg-paper-raised p-3 shadow-sm sm:items-center sm:gap-4 sm:p-4">
            <div className="min-w-0 flex-1">
              <p className="font-ui m-0 text-sm font-semibold leading-5 text-ink">
                No account needed
              </p>
              <p className="font-ui m-0 mt-1 text-sm leading-5 text-ink-muted">
                Want to keep a piece for later? Save a light profile on this
                device. You can keep reading without one.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                type="button"
                onClick={() => setDialogOpen(true)}
                className="font-ui h-11 min-h-11 cursor-pointer rounded-lg bg-action px-3.5 text-sm font-semibold text-paper-raised shadow-none hover:bg-action-hover focus-visible:ring-2 focus-visible:ring-focus"
              >
                Save on this device
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

  const headingId = "settings-account-heading";

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-1 duration-500"
    >
      <h2
        id={headingId}
        className="font-reading text-lg font-semibold text-ink"
      >
        On this device
      </h2>

      <div className="overflow-hidden rounded-xl border border-border bg-paper-raised">
        <div className="font-ui flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-sm font-semibold text-ink">
              {ready && user ? `Signed in as ${user.name}` : "No account needed"}
            </span>
            <span className="text-xs leading-relaxed text-ink-muted sm:text-sm">
              {ready && user
                ? `We'll keep a short list of pieces you save, and your preferences, on this device (${user.email}). A future companion can sync later — nothing is uploaded from here today.`
                : "Sign in only if you want to save a piece and keep preferences for later. Landing, reading, and Meaning Check work without an account."}
            </span>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {ready && user ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => void signOut()}
                className="font-ui h-11 min-h-11 cursor-pointer rounded-lg border-border bg-paper-raised px-4 text-sm font-semibold text-ink shadow-none hover:bg-paper-inset hover:text-ink focus-visible:ring-2 focus-visible:ring-focus"
              >
                Sign out
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => setDialogOpen(true)}
                className="font-ui h-11 min-h-11 cursor-pointer rounded-lg bg-action px-4 text-sm font-semibold text-paper-raised shadow-none hover:bg-action-hover focus-visible:ring-2 focus-visible:ring-focus"
              >
                Save on this device
              </Button>
            )}
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
    </section>
  );
}
