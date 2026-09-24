import {
  FileText,
  Headphones,
  ListChecks,
  MessageSquareText,
} from "lucide-react";
import {
  KeptOnDevice,
  ListenPage,
  MeaningCheck,
  TaglishLines,
} from "@/components/illustrations";
import type { ReactNode } from "react";
import { SunMark } from "@/components/sindi";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const VIEWS = [
  { icon: FileText, name: "Full", note: "The original, untouched" },
  { icon: ListChecks, name: "Key Points", note: "What matters, in order" },
  {
    icon: MessageSquareText,
    name: "Plain Language",
    note: "Short words, short sentences",
  },
  { icon: Headphones, name: "Listen", note: "Read aloud at your pace" },
];

const FEATURES = [
  {
    art: MeaningCheck,
    title: "Meaning Check",
    body: "Warns when a condition, number, or deadline looks off — so you review the source, not trust a rewrite blindly.",
  },
  {
    art: TaglishLines,
    title: "Taglish-aware",
    body: "Plain Language that sounds like how Filipinos talk: English, Tagalog, or both.",
    href: "#try-it",
    linkLabel: "Try Taglish in the demo",
  },
  {
    art: KeptOnDevice,
    title: "Zero-disclosure by design",
    body: "No diagnosis, no sign-up form, no “accessibility mode.” Anyone can use it without identifying as struggling.",
  },
] as const;

function FeatureIcon({ icon: Icon }: { icon: typeof FileText }) {
  return (
    <span className="flex size-10 items-center justify-center rounded-lg bg-action-soft">
      <Icon
        className="size-5 text-action"
        strokeWidth={1.75}
        aria-hidden="true"
      />
    </span>
  );
}

function QuietLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const classes = ["landing-inline-link text-sm", className]
    .filter(Boolean)
    .join(" ");
  return (
    <a href={href} className={classes}>
      {children}
    </a>
  );
}

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="landing-section landing-section--inset"
    >
      <div className="relative mx-auto max-w-6xl">
        <Reveal className="pointer-events-none absolute -top-[5rem] -left-[-6rem]">
          <SunMark className="size-120 opacity-50 md:size-40" />
        </Reveal>
        <SectionHeading
          id="features-title"
          eyebrow="Your preferences"
          title="Built for how people actually read."
          description="Detail, wording, delivery, and browser behavior: preference language only. Linaw adapts without diagnosing anyone."
        />

        {/* Band A — four adaptive views */}
        <Reveal className="mt-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h3 className="font-reading text-xl font-semibold text-ink">
                Four adaptive views
              </h3>
              <p className="mt-1 max-w-xl leading-relaxed text-pretty text-ink-muted">
                Switch formats on the same content instantly. The source never
                changes — only the shape it takes.
              </p>
            </div>
            <ListenPage className="hidden h-20 w-32 shrink-0 md:block" />
          </div>

          <ul className="mt-8 grid list-none grid-cols-1 divide-y divide-border p-0 sm:grid-cols-2 md:grid-cols-4 md:divide-x md:divide-y-0">
            {VIEWS.map((view) => (
              <li
                key={view.name}
                className="flex min-h-11 items-center gap-3 py-4 md:px-6 md:py-0 md:first:pl-0 md:last:pr-0"
              >
                <FeatureIcon icon={view.icon} />
                <p className="font-ui m-0 min-w-0 leading-snug">
                  <span className="font-medium text-ink">{view.name}</span>
                  <span className="text-sm text-ink-muted"> · {view.note}</span>
                </p>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Band B — guarantees that stay on across views */}
        <div className="mt-12 border-t border-border pt-10">
          <Reveal>
            <div>
              <h3 className="font-reading text-xl font-semibold text-ink">
                Guarantees, not extra modes
              </h3>
              <p className="mt-1 max-w-xl leading-relaxed text-pretty text-ink-muted">
                Meaning Check, Taglish, and zero-disclosure — the rules that
                stay on no matter which view you pick.
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-10 md:grid-cols-3 md:gap-x-8">
            {FEATURES.map((feature, i) => (
              <Reveal
                key={feature.title}
                delay={60 * (i + 1)}
                className="font-ui flex flex-col"
              >
                <feature.art className="h-20 w-32" />
                <h3 className="mt-4 font-reading text-lg font-semibold text-ink">
                  {feature.title}
                </h3>
                <p className="mt-1 leading-relaxed text-pretty text-ink-muted">
                  {feature.body}
                </p>
                {"href" in feature && feature.href ? (
                  <QuietLink href={feature.href} className="mt-3">
                    {feature.linkLabel}
                  </QuietLink>
                ) : null}
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
