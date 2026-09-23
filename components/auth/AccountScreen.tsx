"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";

import { HeroDemoCard } from "@/components/landing/HeroDemoCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { isCloudAuthEnabled } from "@/lib/auth";
import { savePiece } from "@/lib/content/pieces";
import {
  clearPendingPieceSave,
  readPendingPieceSave,
} from "@/lib/content/pendingSave";
import { useLocalAuth } from "./useLocalAuth";

function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/settings";
  return raw;
}

export function AccountScreen() {
  const cloud = isCloudAuthEnabled();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const { ready, user, signIn } = useLocalAuth();
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-up");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const creating = !cloud || mode === "sign-up";

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    void (async () => {
      const pending = readPendingPieceSave();
      if (pending) {
        try {
          const piece = await savePiece(pending);
          clearPendingPieceSave();
          if (!cancelled) {
            router.replace(`/read?piece=${encodeURIComponent(piece.id)}`);
          }
          return;
        } catch {
          if (!cancelled) router.replace("/read");
          return;
        }
      }
      if (!cancelled) router.replace(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [next, ready, router, user]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn({
        name,
        email,
        password: cloud ? password : undefined,
        mode: cloud ? mode : "sign-up",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "That email or password did not work. Try again.",
      );
      emailRef.current?.focus();
      setBusy(false);
    }
  }

  if (ready && user) {
    return (
      <p className="font-ui px-5 py-16 text-sm text-ink-muted">Taking you back…</p>
    );
  }

  const fieldClass =
    "font-ui h-11 min-h-11 rounded-lg border-border bg-paper pl-10 text-base text-ink focus-visible:border-action focus-visible:ring-2 focus-visible:ring-focus md:text-sm";

  return (
    <div className="grid min-h-[calc(100dvh-3.5rem)] md:min-h-dvh md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <aside className="order-2 hidden flex-col justify-center gap-8 bg-paper px-8 py-12 md:order-1 md:flex lg:px-14">
        <p className="font-reading m-0 max-w-sm text-2xl font-semibold tracking-tight text-ink">
          Preferences follow this account. Text you paste does not.
        </p>
        <div className="max-w-xl">
          <HeroDemoCard />
        </div>
      </aside>

      <section className="order-1 flex flex-col justify-center bg-paper-raised px-5 py-10 md:order-2 md:px-10 lg:px-16">
        <form
          className="mx-auto flex w-full max-w-sm flex-col gap-5"
          onSubmit={handleSubmit}
          aria-busy={busy}
          noValidate={false}
        >
          <div className="flex flex-col gap-2">
            <h1 className="font-reading m-0 text-3xl font-semibold tracking-tight text-ink">
              {creating ? "Create an account" : "Welcome back"}
            </h1>
            <p className="font-ui m-0 text-base leading-relaxed text-ink-muted">
              Optional. Reading works without one.
            </p>
          </div>

          {creating ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor={nameId} className="font-ui text-sm font-medium text-ink">
                Name
              </label>
              <div className="relative">
                <UserRound
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
                  aria-hidden="true"
                />
                <Input
                  id={nameId}
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <label htmlFor={emailId} className="font-ui text-sm font-medium text-ink">
              Email
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
                aria-hidden="true"
              />
            <Input
              ref={emailRef}
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={fieldClass}
            />
            </div>
          </div>

          {cloud ? (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={passwordId}
                className="font-ui text-sm font-medium text-ink"
              >
                Password
              </label>
              <div className="relative">
                <LockKeyhole
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
                  aria-hidden="true"
                />
                <Input
                  id={passwordId}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={creating ? "new-password" : "current-password"}
                  required
                  minLength={6}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={creating ? `${passwordId}-hint` : error ? errorId : undefined}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={`${fieldClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-0 right-0 flex size-11 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {creating ? (
                <p
                  id={`${passwordId}-hint`}
                  className="font-ui m-0 text-sm text-ink-muted"
                >
                  At least 6 characters.
                </p>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p id={errorId} className="font-ui m-0 text-sm text-warning" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={busy}
            className="font-ui h-11 min-h-11 w-full cursor-pointer rounded-lg bg-action text-base font-semibold text-paper-raised shadow-none hover:bg-action-hover focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy
              ? creating
                ? "Creating account…"
                : "Signing in…"
              : creating
                ? "Create account"
                : "Sign in"}
          </Button>

          {cloud ? (
            <p className="font-ui m-0 text-sm leading-relaxed text-ink-muted">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode((current) =>
                    current === "sign-up" ? "sign-in" : "sign-up",
                  );
                }}
                className="inline-flex min-h-11 cursor-pointer items-center font-medium text-ink underline decoration-action-border underline-offset-4 hover:text-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                {creating
                  ? "Already have an account? Sign in"
                  : "Need an account? Create one"}
              </button>
            </p>
          ) : null}

          <Separator className="bg-border" />

          <a
            href={next}
            className="inline-flex min-h-11 cursor-pointer items-center font-ui text-sm text-ink-muted underline decoration-border underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Continue without an account
          </a>
        </form>
      </section>
    </div>
  );
}
