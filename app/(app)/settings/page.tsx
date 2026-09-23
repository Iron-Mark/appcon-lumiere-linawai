import Link from "next/link";

/**
 * Thin settings entry — preferences already live on the reading workspace ModeBar.
 */
export default function SettingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-reading text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Settings
        </h1>
        <p className="text-sm text-ink-muted sm:text-base">
          Reading preferences — detail, wording, and delivery — are controlled
          on the reading page so they stay next to the note you are adapting.
        </p>
      </header>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="font-ui mb-4 text-sm leading-relaxed text-ink-muted">
          Open the reading workspace to change modes, or set defaults in
          onboarding if you have not saved preferences yet.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/read"
            className="font-ui inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-action px-4 text-sm font-semibold text-paper-raised transition-colors hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            Open reading preferences
          </Link>
          <Link
            href="/onboarding"
            className="font-ui inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-border bg-paper-raised px-4 text-sm font-semibold text-ink transition-colors hover:bg-paper-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            Onboarding defaults
          </Link>
        </div>
      </div>
    </main>
  );
}
