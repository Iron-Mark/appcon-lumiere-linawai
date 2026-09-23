import Link from "next/link";

const SECTION_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Preferences" },
  { href: "#verification", label: "Meaning Check" },
  { href: "#try-it", label: "Try it" },
  { href: "#get-started", label: "Get started" },
  { href: "#faq", label: "FAQ" },
];

const APP_LINKS = [
  { href: "/onboarding", label: "Open Linaw" },
  { href: "/read", label: "Reading workspace" },
];

export function Footer() {
  return (
    <footer className="font-ui border-t border-border px-5 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <Link
            href="#top"
            className="font-reading inline-flex min-h-11 items-center text-xl font-semibold tracking-tight text-ink focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Linaw AI
            <span className="sr-only"> — back to top</span>
          </Link>
          <p className="m-0 max-w-xs text-sm text-ink-muted">
            Adapt the format. Preserve the meaning.
          </p>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-col gap-6 sm:flex-row sm:gap-12"
        >
          <div>
            <p className="m-0 mb-3 text-xs font-semibold tracking-wider text-ink-subtle uppercase">
              On this page
            </p>
            <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm">
              {SECTION_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="inline-flex min-h-11 cursor-pointer items-center text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  >
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
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 cursor-pointer items-center text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-xs text-ink-muted">
        {`© ${new Date().getFullYear()} Linaw AI. “Linaw” means clarity in Filipino.`}
      </p>
    </footer>
  );
}
