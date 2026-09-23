import Link from "next/link";

const SECTION_LINKS = [
  { href: "#how-it-works", label: "How it Works" },
  { href: "#features", label: "Features" },
  { href: "#verification", label: "Verification" },
  { href: "#try-it", label: "Try it" },
  { href: "#faq", label: "FAQ" },
];

const APP_LINKS = [
  { href: "/onboarding", label: "Open Linaw" },
  { href: "/read", label: "Reading workspace" },
  { href: "/todo", label: "Backend checklist" },
];

export function Footer() {
  return (
    <footer className="font-ui border-t border-border px-5 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <Link
            href="#top"
            className="inline-flex items-baseline gap-0.5 text-xl font-semibold tracking-tight text-ink"
          >
            <span>Linaw</span>
            <span aria-hidden="true" className="text-action">
              .
            </span>
            <span className="sr-only">back to top</span>
          </Link>
          <p className="m-0 text-sm text-ink-muted">Clear reading, without losing the point.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-6 sm:flex-row sm:gap-12">
          <div>
            <p className="m-0 mb-3 text-xs font-semibold tracking-wider text-ink-subtle uppercase">
              Product
            </p>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-sm">
              {SECTION_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-ink-muted transition-colors hover:text-ink">
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
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-sm">
              {APP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-ink-muted transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-xs text-ink-muted">
        {`© ${new Date().getFullYear()} Linaw. "Linaw" means clarity in Filipino.`}
      </p>
    </footer>
  );
}
