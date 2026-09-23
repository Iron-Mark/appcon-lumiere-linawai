import Link from "next/link";
import { AppWindow, Download, Info, Puzzle } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { OpenLinawButton } from "./OpenLinawButton";

const EXTENSION_STEPS = [
  {
    step: 1,
    title: "Download the extension",
    detail: (
      <>
        Get{" "}
        <a
          href="/linaw-chrome-extension.zip"
          download="linaw-chrome-extension.zip"
          className="landing-inline-link font-medium text-ink"
        >
          linaw-chrome-extension.zip
        </a>{" "}
        and unzip it on your computer.
      </>
    ),
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
            <div className="flex flex-1 flex-col gap-5 rounded-xl border border-border bg-paper-raised p-7 shadow-[0_1px_0_color-mix(in_srgb,var(--color-ink)_5%,transparent)]">
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

              <a
                href="/linaw-chrome-extension.zip"
                download="linaw-chrome-extension.zip"
                className="inline-flex h-11 min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-action-border bg-action-soft px-4 text-base font-semibold text-ink transition-colors hover:bg-action-soft/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                <Download className="size-4" aria-hidden="true" />
                Download as ZIP
              </a>

              <ol className="m-0 flex list-none flex-col gap-3 p-0">
                {EXTENSION_STEPS.map((item) => (
                  <li
                    key={item.step}
                    className="flex gap-3 rounded-lg border border-border bg-paper p-4"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-paper-inset text-xs font-semibold tabular-nums text-ink"
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
            </div>
            <p className="flex items-start justify-center gap-2 text-sm text-ink-muted">
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
