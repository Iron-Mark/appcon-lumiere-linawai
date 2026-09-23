import { Reveal } from "./Reveal";
import { OpenLinawButton } from "./OpenLinawButton";

export function ClosingCta() {
  return (
    <section
      aria-labelledby="closing-cta-title"
      className="landing-section"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
          <h2
            id="closing-cta-title"
            className="font-reading m-0 text-3xl font-semibold tracking-[-0.02em] text-balance text-ink md:text-[2.25rem] md:leading-tight"
          >
            Ready to read with clarity?
          </h2>
          <p className="font-ui m-0 max-w-lg text-base leading-relaxed text-pretty text-ink-muted md:text-lg">
            Set your preferences once, then adapt notices in the web app or with
            the Chrome companion.
          </p>
          <OpenLinawButton />
          <p className="font-ui m-0 text-sm text-ink-muted">
            Free during beta · No diagnosis · No sign-up required
          </p>
        </Reveal>
      </div>
    </section>
  );
}
