"use client";

import { useId, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type SignInDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignIn: (input: { name: string; email: string }) => Promise<void>;
};

/**
 * Optional device profile — name and email only, saved in localStorage.
 * No passwords. No cloud claim.
 */
export function SignInDialog({
  open,
  onOpenChange,
  onSignIn,
}: SignInDialogProps) {
  const nameId = useId();
  const emailId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSignIn({ name, email });
      setName("");
      setEmail("");
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save on this device. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100vh-2rem)] w-full max-w-[min(24rem,calc(100%-2rem))] gap-5 overflow-y-auto p-5 font-ui sm:max-w-[min(24rem,calc(100%-2rem))]"
        showCloseButton
      >
        <DialogHeader className="gap-2 pr-10 text-left">
          <DialogTitle className="font-reading text-lg font-semibold tracking-tight text-ink">
            Save on this device
          </DialogTitle>
          <DialogDescription className="font-ui text-sm leading-relaxed text-ink-muted">
            Optional. Leave a name and email so Linaw can keep a short list of
            pieces you want to return to, and remember preferences for a later
            browser companion. Nothing leaves this device right now.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={nameId}
              className="font-ui text-sm font-semibold text-ink"
            >
              Name
            </label>
            <Input
              id={nameId}
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="font-ui h-11 min-h-11 cursor-text rounded-lg border-border bg-paper-raised px-3 text-base text-ink focus-visible:border-action focus-visible:ring-2 focus-visible:ring-focus md:text-sm"
              placeholder="How you'd like to be addressed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={emailId}
              className="font-ui text-sm font-semibold text-ink"
            >
              Email
            </label>
            <Input
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="font-ui h-11 min-h-11 cursor-text rounded-lg border-border bg-paper-raised px-3 text-base text-ink focus-visible:border-action focus-visible:ring-2 focus-visible:ring-focus md:text-sm"
              placeholder="you@example.com"
            />
          </div>

          {error ? (
            <p
              className="font-ui m-0 text-sm text-[var(--color-warning)]"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <DialogFooter className="mx-0 mb-0 flex-col gap-2 rounded-none border-0 bg-transparent p-0 sm:flex-col sm:justify-stretch">
            <Button
              type="submit"
              disabled={busy}
              className="font-ui h-11 min-h-11 w-full cursor-pointer rounded-lg bg-action px-4 text-sm font-semibold text-paper-raised shadow-none hover:bg-action-hover focus-visible:ring-2 focus-visible:ring-focus"
            >
              {busy ? "Saving…" : "Save on this device"}
            </Button>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                className="font-ui h-11 min-h-11 w-full cursor-pointer rounded-lg border-border bg-paper-raised px-4 text-sm font-semibold text-ink shadow-none hover:bg-paper-inset hover:text-ink focus-visible:ring-2 focus-visible:ring-focus"
              >
                Continue without an account
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
