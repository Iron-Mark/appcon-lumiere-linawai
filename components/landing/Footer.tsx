import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="font-ui border-t border-border px-5 py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2">
          <Link
            href="#top"
            className="font-reading inline-flex shrink-0 items-center text-lg font-semibold tracking-tight text-ink focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Linaw AI
            <span className="sr-only"> (back to top)</span>
          </Link>
          <span
            className="hidden text-ink-subtle sm:inline"
            aria-hidden="true"
          >
            ·
          </span>
          <p className="m-0 text-sm text-ink-muted">
            Clarify the format. Preserve the meaning.
          </p>
        </div>

        <p className="m-0 text-xs text-ink-muted">
          {`© ${year} Linaw AI. “Linaw” means clarity in Filipino.`}
        </p>
      </div>
    </footer>
  );
}
