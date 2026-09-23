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

      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-14 lg:gap-16">
        <div className="flex min-w-0 flex-col items-start text-left">
          <Reveal className="font-ui inline-flex items-center gap-2.5 rounded-full border border-border/70 bg-paper-raised/80 px-3 py-1.5">
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
            <h1
              id="hero-title"
              className="font-reading m-0 max-w-[16ch] text-[2.125rem] font-semibold leading-[1.15] tracking-[-0.03em] text-ink md:text-5xl md:leading-[1.12]"
            >
              Adapt the format. Preserve the meaning.
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="font-ui mt-5 max-w-md text-base leading-relaxed text-pretty text-ink-muted md:text-lg md:leading-[1.65]">
              Linaw adapts important information to how you prefer to receive
              it, then checks that critical meaning is still intact.
            </p>
          </Reveal>

          <Reveal delay={240} className="mt-8 w-full max-w-md">
            <div className="flex flex-col gap-3">
              <OpenLinawButton fullWidth />
              <p className="font-ui m-0 text-sm text-ink-muted">
                Free during beta · No diagnosis · No sign-up required
              </p>
              <p className="font-ui m-0 text-sm leading-relaxed text-ink-muted">
                Prefer a guided look first?{" "}
                <a href="#try-it" className="landing-inline-link">
                  Try the live demo
                </a>
                {" "}
                or{" "}
                <a href="#get-started" className="landing-inline-link">
                  get the Chrome companion
                </a>
                .
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200} className="w-full min-w-0">
          <HeroDemoCard />
        </Reveal>
      </div>
    </section>
  );
}
