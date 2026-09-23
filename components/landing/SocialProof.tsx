import { GraduationCap, Megaphone, Users } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const USE_CASES = [
  {
    icon: GraduationCap,
    title: "Campus notices",
    quote:
      "Enrollment memos and adviser updates are easier to scan when the conditions stay visible.",
    persona: "Class adviser",
  },
  {
    icon: Megaphone,
    title: "HR and policy updates",
    quote:
      "Plain-language summaries help, but only if deadlines and approval rules do not disappear.",
    persona: "People ops lead",
  },
  {
    icon: Users,
    title: "Family-facing updates",
    quote:
      "Parents can read in English or Taglish without losing who needs to sign what by Friday.",
    persona: "Parent coordinator",
  },
] as const;

export function SocialProof() {
  return (
    <section
      aria-labelledby="proof-title"
      className="landing-section landing-section--inset"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="proof-title"
          eyebrow="Built for real notices"
          title="When the wording changes, the meaning should not."
          description="Linaw is designed for the notices people actually receive — school, work, and community updates where one missed condition matters."
          align="center"
        />

        <div className="mt-12 grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {USE_CASES.map((item, index) => (
            <Reveal key={item.title} delay={index * 60}>
              <article className="font-ui flex flex-col gap-4 py-8 md:px-8 md:py-0 md:first:pl-0 md:last:pr-0">
                <span className="flex size-11 items-center justify-center rounded-lg bg-action-soft">
                  <item.icon
                    className="size-5 text-action"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="font-reading m-0 text-lg font-semibold text-ink">
                    {item.title}
                  </h3>
                  <blockquote className="m-0 border-none p-0 text-sm leading-relaxed text-ink-muted">
                    <p className="m-0 text-pretty">&ldquo;{item.quote}&rdquo;</p>
                  </blockquote>
                  <p className="m-0 text-sm font-medium text-ink-subtle">
                    — {item.persona}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
