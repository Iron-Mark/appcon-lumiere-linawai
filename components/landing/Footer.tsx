import Link from "next/link";

const SECTION_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#verification", label: "Meaning Check" },
  { href: "#try-it", label: "Try it" },
  { href: "#get-started", label: "Get started" },
  { href: "#faq", label: "FAQ" },
];

const APP_LINKS = [
  { href: "/onboarding", label: "Open Linaw" },
  { href: "/read", label: "Reading workspace" },
  {
    href: "/linaw-chrome-extension.zip",
    label: "Download extension (ZIP)",
    download: "linaw-chrome-extension.zip",
  },
];

export function Footer() {
  return (
    <footer className="font-ui border-t border-border px-5 py-12 md:py-14">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-border bg-paper-inset/30">
        <div className="flex flex-col gap-10 px-6 py-10 md:flex-row md:items-start md:justify-between md:px-10">
          <div className="flex max-w-sm flex-col gap-3">
            <Link
              href="#top"
              className="font-reading inline-flex min-h-11 items-center text-xl font-semibold tracking-tight text-ink focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Linaw AI
              <span className="sr-only"> (back to top)</span>
            </Link>
            <p className="m-0 text-sm leading-relaxed text-ink-muted">
              Adapt the format. Preserve the meaning.
            </p>
            <p className="m-0 text-sm leading-relaxed text-ink-muted">
              Web app first. Chrome companion available as a ZIP download until
              the Web Store listing is live.
            </p>
          </div>
          <nav
            aria-label="Footer"
            className="grid gap-8 sm:grid-cols-2 sm:gap-12"
          >
            <div>
              <p className="m-0 mb-3 text-xs font-semibold tracking-wider text-ink-subtle uppercase">
                On this page
              </p>
              <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm">
                {SECTION_LINKS.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="landing-nav-link px-0">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="m-0 mb-3 text-xs font-semibold tracking-wider text-ink-subtle uppercase">
                App
              </p>
              <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm">
                {APP_LINKS.map((link) => (
                  <li key={link.label}>
                    {"download" in link ? (
                      <a
                        href={link.href}
                        download={link.download}
                        className="landing-nav-link px-0"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="landing-nav-link px-0">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
        <div className="border-t border-border px-6 py-4 md:px-10">
          <p className="m-0 text-xs text-ink-muted">
            {`© ${new Date().getFullYear()} Linaw AI. “Linaw” means clarity in Filipino.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
