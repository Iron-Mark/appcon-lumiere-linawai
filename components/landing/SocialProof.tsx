import {
  MeaningCheck,
  NoticeSheet,
  TaglishLines,
} from "@/components/illustrations";
import { SunMark } from "@/components/sindi";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const USE_CASES = [
  {
    art: NoticeSheet,
    title: "Campus notices",
    quote:
      "Enrollment memos and adviser updates are easier to scan when the conditions stay visible.",
    persona: "Class adviser",
  },
  {
    art: MeaningCheck,
    title: "HR and policy updates",
    quote:
      "Plain-language summaries help, but only if deadlines and approval rules do not disappear.",
    persona: "People ops lead",
  },
  {
    art: TaglishLines,
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
      <div className="relative mx-auto flex max-w-6xl flex-col items-center">
        <SunMark className="mb-3 size-14 opacity-40" />
        <SectionHeading
          id="proof-title"
          eyebrow="Built for real notices"
          title="When the wording changes, the meaning should not."
          description="Linaw is designed for the notices people actually receive — school, work, and community updates where one missed condition matters."
          align="center"
        />

        <div className="mt-12 grid w-full divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {USE_CASES.map((item, index) => (
            <Reveal
              key={item.title}
              delay={index * 60}
              className="md:px-8 md:first:pl-0 md:last:pr-0"
            >
              <article className="font-ui flex flex-col gap-4 py-8 md:py-0">
                <item.art className="h-16 w-28" />
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
