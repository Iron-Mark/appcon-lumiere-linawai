import Link from "next/link";
import { AppWindow, Info, Puzzle } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { OpenLinawButton } from "./OpenLinawButton";

export function GetStarted() {
  return (
    <section
      id="get-started"
      aria-labelledby="start-title"
      className="border-t border-border bg-paper-inset/30 px-5 py-20 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="start-title"
          eyebrow="Get started"
          title="Web app first. Chrome companion when you need it."
          description="Same preferences either way. The web app is the main product; the companion is a thin add-on."
          align="center"
        />

        <div className="font-ui mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
          <Reveal delay={60} className="flex flex-col">
            <div className="flex flex-1 flex-col gap-5 rounded-xl border border-border bg-paper-raised p-7 shadow-[0_1px_0_color-mix(in_srgb,var(--color-ink)_5%,transparent)]">
              <span className="flex size-11 items-center justify-center rounded-lg bg-action-soft">
                <AppWindow
                  className="size-5 text-action"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </span>
              <div>
                <h3 className="font-reading m-0 text-xl font-semibold text-ink">
                  Web app
                </h3>
                <p className="mt-2 leading-relaxed text-pretty text-ink-muted">
                  Set detail, wording, delivery, and browser behavior, then
                  read in the workspace. Nothing to install.
                </p>
              </div>
              <div className="mt-auto flex flex-col gap-3">
                <OpenLinawButton fullWidth />
                <Link
                  href="/read"
                  className="inline-flex h-11 min-h-11 cursor-pointer items-center justify-center rounded-lg border border-border bg-transparent text-base font-semibold text-ink transition-colors hover:bg-action-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  Peek at the reading workspace
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal className="flex flex-col gap-4">
            <div className="flex flex-1 flex-col gap-5 rounded-xl border border-border bg-paper-raised p-7">
              <span className="flex size-11 items-center justify-center rounded-lg bg-action-soft">
                <Puzzle
                  className="size-5 text-action"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </span>
              <div>
                <h3 className="font-reading m-0 text-xl font-semibold text-ink">
                  Chrome companion
                </h3>
                <p className="mt-2 leading-relaxed text-pretty text-ink-muted">
                  A thin add-on for pages you already have open. Auto-Adapt is
                  explicit opt-in, never silent.
                </p>
              </div>
              <ol className="m-0 flex list-none flex-col gap-1.5 rounded-lg bg-paper p-4 text-sm leading-relaxed text-ink-muted">
                <li>
                  <span className="font-medium text-ink">1.</span> Run{" "}
                  <code className="rounded bg-paper-inset px-1.5 py-0.5 font-mono text-[0.8125rem] text-ink">
                    node extension/build.mjs
                  </code>
                </li>
                <li>
                  <span className="font-medium text-ink">2.</span> Chrome →
                  Extensions → Developer mode → Load unpacked →{" "}
                  <code className="rounded bg-paper-inset px-1.5 py-0.5 font-mono text-[0.8125rem] text-ink">
                    extension/
                  </code>
                </li>
                <li>
                  <span className="font-medium text-ink">3.</span> Steps in{" "}
                  <code className="rounded bg-paper-inset px-1.5 py-0.5 font-mono text-[0.8125rem] text-ink">
                    extension/README.md
                  </code>
                </li>
              </ol>
            </div>
            <p className="flex items-start justify-center gap-2 text-sm text-ink-muted">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                Not in the Chrome Web Store yet; load it unpacked for now.
              </span>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
