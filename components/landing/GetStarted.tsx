import Link from "next/link";
import { AppWindow, Download, Info, Puzzle } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const EXTENSION_STEPS = [
  {
    step: 1,
    title: "Download the extension",
    detail:
      "Use the Download as ZIP button above, then unzip it on your computer.",
  },
  {
    step: 2,
    title: "Open Chrome extensions",
    detail: "In Chrome, go to Extensions → Manage Extensions and turn on Developer mode.",
  },
  {
    step: 3,
    title: "Load the unpacked folder",
    detail: "Choose Load unpacked, then select the folder you extracted from the ZIP.",
  },
] as const;

export function GetStarted() {
  return (
    <section
      id="get-started"
      aria-labelledby="start-title"
      className="landing-section landing-section--inset-soft"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="start-title"
          eyebrow="Get started"
          title="Web app first. Chrome companion when you need it."
          description="Same preferences either way. The web app is the main product; the companion is a thin add-on."
          align="center"
        />

        <div className="font-ui mx-auto mt-12 grid max-w-4xl gap-10 md:grid-cols-2 md:gap-0 md:divide-x md:divide-border">
          <Reveal delay={60} className="flex flex-col md:pr-10">
            <span className="flex size-11 items-center justify-center rounded-lg bg-action-soft">
              <AppWindow
                className="size-5 text-action"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </span>
            <h3 className="font-reading mt-5 text-xl font-semibold text-ink">
              Web app
            </h3>
            <p className="mt-2 leading-relaxed text-pretty text-ink-muted">
              Set detail, wording, delivery, and browser behavior, then read in
              the workspace. Nothing to install.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/read"
                className="inline-flex h-11 min-h-11 cursor-pointer items-center justify-center rounded-lg border border-border bg-transparent text-base font-semibold text-ink transition-colors hover:bg-action-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                Peek at the reading workspace
              </Link>
            </div>
          </Reveal>

          <Reveal className="flex flex-col md:pl-10">
            <span className="flex size-11 items-center justify-center rounded-lg bg-action-soft">
              <Puzzle
                className="size-5 text-action"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </span>
            <h3 className="font-reading mt-5 text-xl font-semibold text-ink">
              Chrome companion
            </h3>
            <p className="mt-2 leading-relaxed text-pretty text-ink-muted">
              A thin add-on for pages you already have open. Auto-Adapt is
              explicit opt-in, never silent.
            </p>

            <a
              href="/linaw-chrome-extension.zip"
              download="linaw-chrome-extension.zip"
              className="mt-6 inline-flex h-11 min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-action-border bg-action-soft px-4 text-base font-semibold text-ink transition-colors hover:bg-action-soft/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <Download className="size-4" aria-hidden="true" />
              Download as ZIP
            </a>

            <ol className="m-0 mt-8 flex list-none flex-col divide-y divide-border border-t border-border p-0">
              {EXTENSION_STEPS.map((item) => (
                <li key={item.step} className="flex gap-4 py-4 first:pt-5">
                  <span
                    aria-hidden="true"
                    className="font-reading shrink-0 text-2xl font-semibold tabular-nums leading-none text-ink-subtle"
                  >
                    {item.step}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-ink">{item.title}</span>
                    <span className="text-sm leading-relaxed text-ink-muted">
                      {item.detail}
                    </span>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-4 flex items-start gap-2 text-sm text-ink-muted">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                Not in the Chrome Web Store yet — download the ZIP and load it
                unpacked for now.
              </span>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
