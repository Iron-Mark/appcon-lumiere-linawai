import Link from "next/link";
import {
  EyeOff,
  FileText,
  Headphones,
  Languages,
  Layers,
  ListChecks,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const VIEWS = [
  { icon: FileText, name: "Full", note: "The original, untouched" },
  { icon: ListChecks, name: "Key Points", note: "What matters, in order" },
  { icon: MessageSquareText, name: "Plain Language", note: "Short words, short sentences" },
  { icon: Headphones, name: "Listen", note: "Read aloud at your pace" },
];

function FeatureBlock({
  children,
  delay,
  href,
  linkLabel,
  className,
}: {
  children: ReactNode;
  delay?: number;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <Reveal
      delay={delay}
      className={`font-ui flex flex-col gap-4 ${className ?? ""}`}
    >
      {children}
      {href && linkLabel ? (
        href.startsWith("/") ? (
          <Link href={href} className="landing-inline-link mt-auto text-sm">
            {linkLabel}
          </Link>
        ) : (
          <a href={href} className="landing-inline-link mt-auto text-sm">
            {linkLabel}
          </a>
        )
      ) : null}
    </Reveal>
  );
}

function FeatureIcon({ icon: Icon }: { icon: typeof Layers }) {
  return (
    <span className="flex size-10 items-center justify-center rounded-lg bg-action-soft">
      <Icon className="size-5 text-action" strokeWidth={1.75} aria-hidden="true" />
    </span>
  );
}

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="landing-section landing-section--inset"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="features-title"
          eyebrow="Your preferences"
          title="Built for how people actually read."
          description="Detail, wording, delivery, and browser behavior: preference language only. Linaw adapts without diagnosing anyone."
        />

        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-x-8 md:gap-y-12">
          <FeatureBlock
            className="md:col-span-2 md:row-span-2"
            href="#try-it"
            linkLabel="Try all four views"
          >
            <FeatureIcon icon={Layers} />
            <div>
              <h3 className="font-reading text-xl font-semibold text-ink">Four adaptive views</h3>
              <p className="mt-1 leading-relaxed text-pretty text-ink-muted">
                Switch formats on the same content instantly. The source never
                changes, only the shape it takes.
              </p>
            </div>
            <ul className="mt-2 grid list-none gap-6 p-0 sm:grid-cols-2">
              {VIEWS.map((view) => (
                <li
                  key={view.name}
                  className="flex min-h-11 items-start gap-3"
                >
                  <view.icon
                    className="mt-0.5 size-5 shrink-0 text-action"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-ink">{view.name}</span>
                    <span className="text-sm text-ink-muted">{view.note}</span>
                  </div>
                </li>
              ))}
            </ul>
          </FeatureBlock>

          <FeatureBlock delay={60} href="#verification" linkLabel="See Meaning Check">
            <FeatureIcon icon={ShieldCheck} />
            <div>
              <h3 className="font-reading text-lg font-semibold text-ink">Meaning Check</h3>
              <p className="mt-1 leading-relaxed text-pretty text-ink-muted">
                Checks can warn when a condition, number, or deadline looks off,
                so you can review the source, not trust a rewrite blindly.
              </p>
            </div>
          </FeatureBlock>

          <FeatureBlock delay={120} href="#try-it" linkLabel="Try Taglish in the demo">
            <FeatureIcon icon={Languages} />
            <div>
              <h3 className="font-reading text-lg font-semibold text-ink">Taglish-aware</h3>
              <p className="mt-1 leading-relaxed text-pretty text-ink-muted">
                Plain Language that sounds like how Filipinos actually talk:
                English, Tagalog, or both.
              </p>
            </div>
          </FeatureBlock>

          <FeatureBlock
            delay={180}
            className="md:col-span-3 md:flex-row md:items-center md:gap-6 md:border-t md:border-border md:pt-10"
            href="/onboarding"
            linkLabel="Open Linaw — no special mode"
          >
            <FeatureIcon icon={EyeOff} />
            <div className="md:flex-1">
              <h3 className="font-reading text-lg font-semibold text-ink">Zero-disclosure by design</h3>
              <p className="mt-1 leading-relaxed text-pretty text-ink-muted">
                No diagnosis, no sign-up form, no “accessibility mode.” Anyone can
                use it, so no one has to identify as struggling to use it.
              </p>
            </div>
          </FeatureBlock>
        </div>
      </div>
    </section>
  );
}
