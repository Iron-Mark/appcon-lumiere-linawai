import Link from "next/link";
import { Menu } from "lucide-react";
import { OpenLinawButton } from "./OpenLinawButton";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#verification", label: "Meaning Check" },
  { href: "#try-it", label: "Try it" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  return (
    <header className="font-ui sticky top-0 z-40 border-b border-border/80 bg-paper/90 backdrop-blur-md supports-[backdrop-filter]:bg-paper/80">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:gap-4"
      >
        <Link
          href="#top"
          className="font-reading inline-flex min-h-11 shrink-0 items-center gap-2.5 text-xl font-semibold tracking-tight text-ink focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          <img
            src="/linaw-logo-transparent.png"
            alt="Linaw AI logo"
            className="h-8 w-8 rounded-md object-contain"
          />
          <span>Linaw AI</span>
          <span className="sr-only"> (home)</span>
        </Link>

        <ul className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="landing-nav-link">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <details className="group relative md:hidden">
            <summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-paper-inset hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus [&::-webkit-details-marker]:hidden">
              <Menu className="size-5" aria-hidden="true" />
              <span className="sr-only">Open navigation menu</span>
            </summary>
            <ul
              role="list"
              className="absolute right-0 top-[calc(100%+0.25rem)] z-50 min-w-[12.5rem] rounded-lg border border-border bg-paper-raised py-1.5 shadow-[0_12px_32px_-16px_color-mix(in_srgb,var(--color-ink)_22%,transparent)]"
            >
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="landing-nav-link w-full rounded-none px-4"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </details>

          <OpenLinawButton withArrow={false} className="px-4 text-sm" />
        </div>
      </nav>
    </header>
  );
}
