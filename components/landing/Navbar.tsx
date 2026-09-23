import Link from "next/link";
import { OpenLinawButton } from "./OpenLinawButton";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Preferences" },
  { href: "#verification", label: "Meaning Check" },
  { href: "#try-it", label: "Try it" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  return (
    <header className="font-ui sticky top-0 z-40 border-b border-border/80 bg-paper/90 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5"
      >
        <Link
          href="#top"
          className="font-reading inline-flex min-h-11 items-center text-xl font-semibold tracking-tight text-ink focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          Linaw AI
          <span className="sr-only"> (home)</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="inline-flex min-h-11 cursor-pointer items-center rounded-md px-2.5 text-sm text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <OpenLinawButton withArrow={false} className="shrink-0 px-4 text-sm" />
      </nav>
    </header>
  );
}
