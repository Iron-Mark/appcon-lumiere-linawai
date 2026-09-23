import Link from "next/link";

const LINKS = [
  { href: "#how-it-works", label: "How it Works" },
  { href: "#features", label: "Features" },
  { href: "#verification", label: "Verification" },
  { href: "#try-it", label: "Try it" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  return (
    <header className="font-ui sticky top-0 z-40 border-b border-border bg-paper/85 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5"
      >
        <Link
          href="#top"
          className="inline-flex items-baseline gap-0.5 text-xl font-semibold tracking-tight text-ink"
        >
          <span>Linaw</span>
          <span aria-hidden="true" className="text-action">
            .
          </span>
          <span className="sr-only">home</span>
        </Link>
        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-ink-muted transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <Link
          href="/onboarding"
          className="inline-flex h-10 items-center rounded-full bg-action px-4 text-sm font-semibold text-paper-raised transition-colors hover:bg-action-hover"
        >
          Open Linaw
        </Link>
      </nav>
    </header>
  );
}
