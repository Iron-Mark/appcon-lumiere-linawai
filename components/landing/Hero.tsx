import Link from "next/link";
import { Sindi } from "@/components/sindi";
import { Reveal } from "./Reveal";
import { HeroDemoCard } from "./HeroDemoCard";
import { OpenLinawButton } from "./OpenLinawButton";

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative overflow-x-hidden px-5 pt-14 pb-16 md:pt-20 md:pb-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in srgb, var(--color-action) 12%, transparent), transparent 70%)",
        }}
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-14 lg:gap-16">
        <div className="flex flex-col items-start text-left">
          <Reveal className="font-ui inline-flex items-center gap-2.5">
            <span
              className="inline-flex origin-left scale-[0.72]"
              aria-hidden="true"
            >
              <Sindi state="reading" line="" />
            </span>
            <span className="text-sm font-medium tracking-wide text-ink-muted">
              Personalized reading · meaning preserved
            </span>
          </Reveal>

          <Reveal delay={70} className="mt-5">
            <p className="font-reading m-0 text-2xl font-semibold tracking-tight text-ink md:text-[1.75rem]">
              Linaw AI
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-4">
            <h1
              id="hero-title"
              className="font-reading m-0 max-w-[16ch] text-[2.125rem] font-semibold leading-[1.15] tracking-[-0.03em] text-ink md:text-5xl md:leading-[1.12]"
            >
              Adapt the format. Preserve the meaning.
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="font-ui mt-5 max-w-md text-base leading-relaxed text-pretty text-ink-muted md:text-lg">
              Linaw adapts important information to how you prefer to receive
              it — then checks that critical meaning is still intact.
            </p>
          </Reveal>

          <Reveal delay={240} className="mt-8 flex flex-col items-start gap-3">
            <OpenLinawButton fullWidth />
            <p className="font-ui m-0 max-w-sm text-sm leading-relaxed text-ink-subtle">
              Prefer a guided look first?{" "}
              <a
                href="#try-it"
                className="cursor-pointer font-medium text-ink underline decoration-action-border underline-offset-4 transition-colors hover:text-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                Try the live demo
              </a>
              .
            </p>
          </Reveal>

          <Reveal delay={300} className="mt-6">
            <p className="font-ui m-0 max-w-sm text-xs leading-relaxed text-ink-subtle">
              Chrome companion is not in the Web Store. Build with{" "}
              <code className="rounded bg-paper-inset px-1 py-0.5 font-mono text-[0.75rem] text-ink">
                node extension/build.mjs
              </code>
              , then Load unpacked — see{" "}
              <code className="rounded bg-paper-inset px-1 py-0.5 font-mono text-[0.75rem] text-ink">
                extension/README.md
              </code>
              .
            </p>
          </Reveal>
        </div>

        <Reveal delay={200} className="w-full min-w-0">
          <HeroDemoCard />
          <p className="font-ui mt-3 text-center text-xs text-ink-subtle md:text-left">
            Illustrative example —{" "}
            <Link
              href="/onboarding"
              className="cursor-pointer font-medium text-ink underline decoration-action-border underline-offset-4 hover:text-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              open Linaw
            </Link>{" "}
            to adapt your own text.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
