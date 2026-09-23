import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AuthAccountSection } from "@/components/auth";
import { OpenReadingPreferences } from "@/components/settings/OpenReadingPreferences";
import { Button } from "@/components/ui/button";

/**
 * Thin settings entry — preferences live in PreferenceStore and are edited
 * on the reading workspace (and first set in onboarding). Optional device
 * profile lives in the auth port; nothing here is a login wall.
 */
export default function SettingsPage() {
  return (
    <main className="relative mx-auto flex w-full max-w-xl flex-col gap-8 px-5 py-8 sm:px-8 sm:py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--color-action)_10%,transparent),transparent_70%)]"
      />

      <header className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-1 duration-500">
        <h1 className="font-reading text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Settings
        </h1>
        <p className="font-ui max-w-prose text-sm leading-relaxed text-ink-muted sm:text-base">
          Linaw keeps your communication preferences in one place — the shared
          PreferenceStore — so the reading workspace and companion stay in sync.
          This page explains where to change them; it does not store page
          content. An account is optional.
        </p>
      </header>

      <AuthAccountSection variant="settings" />

      <section
        aria-labelledby="settings-preferences-heading"
        className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-1 duration-500 [animation-delay:80ms]"
      >
        <h2
          id="settings-preferences-heading"
          className="font-reading text-lg font-semibold text-ink"
        >
          Preferences
        </h2>
        <ul className="overflow-hidden rounded-xl border border-border bg-paper-raised">
          <li className="border-b border-border">
            <Link
              href="/read"
              className="font-ui group flex min-h-11 cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-action-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-semibold text-ink">
                  Reading preferences
                </span>
                <span className="text-xs leading-relaxed text-ink-muted sm:text-sm">
                  Detail, wording, and delivery — edit beside the note on the
                  reading page. Changes save through PreferenceStore.
                </span>
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-action"
                aria-hidden="true"
              />
            </Link>
          </li>
          <li>
            <Link
              href="/onboarding"
              className="font-ui group flex min-h-11 cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-action-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-semibold text-ink">
                  Onboarding defaults
                </span>
                <span className="text-xs leading-relaxed text-ink-muted sm:text-sm">
                  Set or revisit your starting preference profile if you have
                  not saved one yet.
                </span>
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-action"
                aria-hidden="true"
              />
            </Link>
          </li>
        </ul>
      </section>

      <section
        aria-labelledby="settings-privacy-heading"
        className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-1 duration-500 [animation-delay:160ms]"
      >
        <h2
          id="settings-privacy-heading"
          className="font-reading text-lg font-semibold text-ink"
        >
          Privacy
        </h2>
        <ul className="overflow-hidden rounded-xl border border-border bg-paper-raised">
          <li>
            <div className="font-ui flex min-h-11 items-start gap-3 px-4 py-3.5">
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-semibold text-ink">
                  Auto-Adapt
                </span>
                <span className="text-xs leading-relaxed text-ink-muted sm:text-sm">
                  Opt-in only. Default is Manual — Linaw waits for you to
                  trigger an adaptation. Auto-Adapt never runs silently, and
                  this page does not send or store webpage content.
                </span>
              </span>
              <span className="mt-0.5 shrink-0 rounded-md bg-action-soft px-2.5 py-1 text-xs font-semibold text-action">
                Opt-in
              </span>
            </div>
          </li>
        </ul>
      </section>

      <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-bottom-1 duration-500 [animation-delay:240ms]">
        <OpenReadingPreferences />
        <Button
          asChild
          variant="outline"
          className="font-ui h-11 min-h-11 cursor-pointer rounded-lg border-border bg-paper-raised px-4 text-sm font-semibold text-ink shadow-none hover:bg-paper-inset hover:text-ink focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Link href="/onboarding">Onboarding defaults</Link>
        </Button>
      </div>
    </main>
  );
}
