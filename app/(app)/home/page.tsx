import Link from "next/link";
import { BookOpen, SlidersHorizontal, Sparkles } from "lucide-react";

const START_CARDS = [
  {
    href: "/read",
    title: "Open reading workspace",
    preview:
      "Paste a message, adapt the format, and keep Meaning Check beside the note. Nothing is stored until you explicitly save.",
    icon: BookOpen,
    meta: "Start here",
  },
  {
    href: "/read#meaning-check",
    title: "Review Meaning Checks",
    preview:
      "Checks live on the reading page. Open a note, run Adapt, then scan the rail for warnings and evidence.",
    icon: Sparkles,
    meta: "On Read",
  },
  {
    href: "/settings",
    title: "Reading preferences",
    preview:
      "Detail, wording, and delivery controls stay on the reading page. Settings explains where to find them.",
    icon: SlidersHorizontal,
    meta: "Preferences",
  },
] as const;

/**
 * In-app home — card layout inspired by document libraries, without permanent content storage.
 */
export default function HomeLibraryPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-reading text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Home
          </h1>
          <p className="max-w-xl text-sm text-ink-muted sm:text-base">
            Jump into reading. Linaw does not keep a content library unless you
            choose to save something later.
          </p>
        </div>
        <Link
          href="/read"
          className="font-ui inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-action px-4 text-sm font-semibold text-paper-raised transition-colors hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <span aria-hidden>+</span>
          Start reading
        </Link>
      </header>

      <section aria-label="Ways to start" className="flex flex-col gap-4">
        <h2 className="font-ui text-xs font-semibold uppercase tracking-[0.08em] text-ink-subtle">
          Today
        </h2>
        <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {START_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <li key={card.href}>
                <Link
                  href={card.href}
                  className="group flex h-full min-h-[11rem] cursor-pointer flex-col gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-none transition-colors hover:border-action-border/40 hover:bg-paper-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-ui text-xs font-medium uppercase tracking-wide text-ink-subtle">
                      {card.meta}
                    </span>
                    <Icon
                      aria-hidden
                      className="size-4 text-ink-subtle transition-colors group-hover:text-action"
                      strokeWidth={1.75}
                    />
                  </div>
                  <h3 className="font-reading text-lg font-semibold leading-snug text-ink">
                    {card.title}
                  </h3>
                  <p className="font-ui line-clamp-3 flex-1 text-sm leading-relaxed text-ink-muted">
                    {card.preview}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
