import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/onboarding", label: "Open Linaw", type: "internal" as const },
  { href: "#get-started", label: "Get started", type: "anchor" as const },
  {
    href: "/linaw-chrome-extension.zip",
    label: "Chrome extension (ZIP)",
    download: "linaw-chrome-extension.zip",
    type: "download" as const,
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="font-ui border-t border-border px-5 py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
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
              Adapt the format. Preserve the meaning.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-1 p-0 text-sm">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  {link.type === "download" ? (
                    <a
                      href={link.href}
                      download={link.download}
                      className="landing-inline-link"
                    >
                      {link.label}
                    </a>
                  ) : link.type === "anchor" ? (
                    <a href={link.href} className="landing-inline-link">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="landing-inline-link">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="m-0 text-xs text-ink-muted">
          {`© ${year} Linaw AI. “Linaw” means clarity in Filipino.`}
        </p>
      </div>
    </footer>
  );
}
