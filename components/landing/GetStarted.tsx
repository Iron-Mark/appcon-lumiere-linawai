import Link from "next/link";
import { AppWindow, ArrowRight, Info, Puzzle } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function GetStarted() {
  return (
    <section id="get-started" aria-labelledby="start-title" className="px-5 py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="start-title"
          eyebrow="Get started"
          title="Two ways in. Same careful reading."
          align="center"
        />

        <div className="font-ui mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-2">
          <Reveal className="flex flex-col gap-4">
            <div className="flex flex-1 flex-col gap-5 rounded-2xl border border-border bg-card p-7">
              <span className="flex size-11 items-center justify-center rounded-xl bg-action-soft">
                <Puzzle className="size-5 text-action" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div>
                <h3 className="m-0 text-xl font-semibold text-ink">Browser companion</h3>
                <p className="mt-2 leading-relaxed text-pretty text-ink-muted">
                  Works on the pages you already have open — news, school portals,
                  docs, and PDFs.
                </p>
              </div>
              <ol className="m-0 flex list-none flex-col gap-1.5 rounded-xl bg-background p-4 text-sm leading-relaxed text-ink-muted">
                <li>
                  <span className="font-medium text-ink">1.</span> Run{" "}
                  <code className="rounded bg-paper-inset px-1.5 py-0.5 font-mono text-[0.8125rem] text-ink">
                    node extension/build.mjs
                  </code>
                </li>
                <li>
                  <span className="font-medium text-ink">2.</span> Chrome → Extensions →
                  Developer mode → Load unpacked →{" "}
                  <code className="rounded bg-paper-inset px-1.5 py-0.5 font-mono text-[0.8125rem] text-ink">
                    extension/
                  </code>
                </li>
              </ol>
              <Link
                href="/onboarding"
                className="mt-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-action text-base font-semibold text-paper-raised transition-colors hover:bg-action-hover"
              >
                Start on the web first
              </Link>
            </div>
            <p className="flex items-center justify-center gap-2 text-sm text-ink-muted">
              <Info className="size-4 shrink-0" aria-hidden="true" />
              <span>No Chrome Web Store listing yet — load it unpacked for now.</span>
            </p>
          </Reveal>

          <Reveal delay={80} className="flex flex-col">
            <div className="flex flex-1 flex-col gap-5 rounded-2xl border border-border bg-card p-7">
              <span className="flex size-11 items-center justify-center rounded-xl bg-action-soft">
                <AppWindow className="size-5 text-action" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div>
                <h3 className="m-0 text-xl font-semibold text-ink">Web app</h3>
                <p className="mt-2 leading-relaxed text-pretty text-ink-muted">
                  Set your preferences, then read in the workspace. Nothing to
                  install — works on shared or locked-down computers.
                </p>
              </div>
              <Link
                href="/onboarding"
                className="mt-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-action text-base font-semibold text-paper-raised transition-colors hover:bg-action-hover"
              >
                Open Linaw
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/read"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-action-border bg-transparent text-base font-semibold text-ink transition-colors hover:bg-action-soft"
              >
                Peek at the reading workspace
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
