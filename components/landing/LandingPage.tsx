import type { ReactNode } from "react";
import Link from "next/link";
import { Sindi } from "@/components/sindi";
import { Button } from "@/components/ui/button";

/**
 * One-page product story for Linaw AI.
 * Structure: Mobbin Calm / Sana stacked sections; one primary CTA.
 * Canon: docs/LINAW_AI_INITIAL-DRAFT_PROJECT_CONTEXT.md (§1–4, 6–12, 25, 41).
 */

const PREFERENCES = [
  {
    label: "Detail",
    choices: ["Full", "Key Points"],
    note: "Keep everything readable, or focus on the critical facts and actions.",
  },
  {
    label: "Wording",
    choices: ["Original", "Plain Language"],
    note: "Stay close to the source wording, or use clearer everyday language.",
  },
  {
    label: "Delivery",
    choices: ["Read", "Listen"],
    note: "Read the adapted text, or hear the same wording aloud.",
  },
  {
    label: "Browser",
    choices: ["Manual", "Auto-Adapt"],
    note: "Trigger Linaw yourself, or opt in so eligible pages can adapt with your saved profile.",
  },
] as const;

const FLOW_STEPS = [
  "Choose preferences in a short onboarding.",
  "Paste or enter a notice, announcement, or other important text.",
  "Linaw adapts the presentation to your defaults.",
  "Meaning Check reviews the result against the source.",
  "Switch modes, listen, or return to the original anytime.",
] as const;

function OpenLinawButton({ className }: { className?: string }) {
  return (
    <Button
      asChild
      className={className ?? "landing-cta"}
      style={{
        minHeight: "2.75rem",
        minWidth: "11rem",
        height: "auto",
        padding: "0.85rem 1.75rem",
        borderRadius: "0.625rem",
        fontFamily: "var(--font-ui)",
        fontSize: "1.0625rem",
        fontWeight: 600,
        letterSpacing: "0.01em",
        background: "var(--color-action)",
        color: "var(--color-paper-raised)",
      }}
    >
      <Link href="/onboarding">Open Linaw</Link>
    </Button>
  );
}

function Section({
  id,
  title,
  children,
  tone = "paper",
}: {
  id: string;
  title: string;
  children: ReactNode;
  tone?: "paper" | "raised";
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="landing-section"
      style={{
        width: "100%",
        background:
          tone === "raised" ? "var(--color-paper-raised)" : "transparent",
        borderTop:
          tone === "raised"
            ? "1px solid color-mix(in srgb, var(--color-ink) 7%, transparent)"
            : undefined,
        borderBottom:
          tone === "raised"
            ? "1px solid color-mix(in srgb, var(--color-ink) 7%, transparent)"
            : undefined,
      }}
    >
      <div className="landing-section-inner">
        <h2
          id={`${id}-heading`}
          style={{
            margin: "0 0 1rem",
            fontFamily: "var(--font-reading)",
            fontSize: "clamp(1.625rem, 4vw, 2rem)",
            fontWeight: 600,
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
            color: "var(--color-ink)",
          }}
        >
          {title}
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            fontFamily: "var(--font-ui)",
            fontSize: "1.0625rem",
            lineHeight: 1.6,
            color: "var(--color-ink-muted)",
          }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  return (
    <main
      className="landing-page"
      style={{
        boxSizing: "border-box",
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        fontFamily: "var(--font-ui)",
        color: "var(--color-ink)",
        background: "var(--color-paper)",
      }}
    >
      {/* Hero */}
      <header
        className="landing-hero"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding:
            "clamp(2.5rem, 8vw, 5rem) clamp(1.25rem, 5vw, 2.5rem) clamp(2.5rem, 6vw, 4rem)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "40rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.35rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                transform: "scale(0.72)",
                transformOrigin: "center",
              }}
              aria-hidden="true"
            >
              <Sindi state="reading" line="" />
            </span>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-reading)",
                fontSize: "clamp(1.375rem, 3.5vw, 1.625rem)",
                fontWeight: 600,
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
                color: "var(--color-ink)",
              }}
            >
              Linaw AI
            </p>
          </div>

          <h1
            style={{
              margin: 0,
              maxWidth: "18ch",
              fontFamily: "var(--font-reading)",
              fontSize: "clamp(2.125rem, 7vw, 3.25rem)",
              fontWeight: 600,
              lineHeight: 1.18,
              letterSpacing: "-0.025em",
              color: "var(--color-ink)",
            }}
          >
            Adapt the format. Preserve the meaning.
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: "34rem",
              fontSize: "clamp(1rem, 2.2vw, 1.125rem)",
              fontWeight: 500,
              lineHeight: 1.55,
              color: "var(--color-ink-muted)",
            }}
          >
            Linaw adapts important information to how you prefer to receive it,
            then checks that critical meaning is still intact.
          </p>

          <OpenLinawButton />
        </div>
      </header>

      <Section id="what" title="What Linaw is">
        <p style={{ margin: 0 }}>
          Linaw AI is a web app with a thin Chrome companion. It is a{" "}
          <strong style={{ color: "var(--color-ink)", fontWeight: 600 }}>
            personalized information layer
          </strong>
          —not a chatbot, not a generic summarizer, and not a tool that labels
          how your brain works.
        </p>
        <p style={{ margin: 0 }}>
          You set how detail, wording, and delivery should look. Linaw changes
          the presentation. The original source stays authoritative and one step
          away.
        </p>
      </Section>

      <Section id="problem" title="The problem" tone="raised">
        <p style={{ margin: 0 }}>
          Important information often arrives in one fixed shape—announcements,
          instructions, policies, workplace notices, public advisories—while
          people need different levels of detail, wording, and delivery.
        </p>
        <p style={{ margin: 0 }}>
          The usual workaround is to copy text into a general AI tool, ask it to
          simplify, then hope nothing important vanished. Transformation can
          quietly drop a condition, move a deadline, or attach a time to the
          wrong group.
        </p>
        <aside
          className="landing-example"
          aria-label="Example of meaning lost in a rewrite"
        >
          <p className="landing-example-label">Example</p>
          <p style={{ margin: 0 }}>
            Source: late submissions are accepted{" "}
            <em>only with written approval</em>. A careless rewrite says late
            submissions are accepted—and the condition is gone.
          </p>
        </aside>
      </Section>

      <Section id="approach" title="Our approach">
        <p style={{ margin: 0 }}>
          Personalization belongs at the presentation layer. Linaw does not
          diagnose anyone. You choose how information should look and sound.
        </p>
        <p style={{ margin: 0 }}>
          Then the harder question:{" "}
          <strong style={{ color: "var(--color-ink)", fontWeight: 600 }}>
            after adaptation, does it still mean the same thing?
          </strong>
        </p>
        <ol className="landing-list-numbered">
          <li>
            <strong>Understand</strong> the important structure of the source.
          </li>
          <li>
            <strong>Adapt</strong> presentation to your preferences.
          </li>
          <li>
            <strong>Check</strong> whether critical meaning survived.
          </li>
        </ol>
      </Section>

      <Section id="preferences" title="Your preferences" tone="raised">
        <p style={{ margin: 0 }}>
          Onboarding is preference selection—not diagnosis. You can change these
          anytime. We talk about formats, not people.
        </p>
        <ul className="landing-pref-grid">
          {PREFERENCES.map((pref) => (
            <li key={pref.label} className="landing-pref-item">
              <p className="landing-pref-label">{pref.label}</p>
              <p className="landing-pref-choices">
                {pref.choices.join(" · ")}
              </p>
              <p className="landing-pref-note">{pref.note}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="web-app" title="How the web app works">
        <p style={{ margin: 0 }}>
          The web app is the main product. A short path from preference to
          reading:
        </p>
        <ol className="landing-list-numbered">
          {FLOW_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p style={{ margin: 0 }}>
          Try it on something like a notice with times and an exception—dense
          enough that a careless rewrite could attach the wrong detail to the
          wrong group.
        </p>
      </Section>

      <Section id="companion" title="Chrome companion" tone="raised">
        <p style={{ margin: 0 }}>
          The Chrome companion is a thin add-on to the same preferences—not a
          second product. It replaces copy → paste → rewrite-the-prompt with:
          open the page, apply your saved profile, adjust only if needed.
        </p>
        <p style={{ margin: 0 }}>
          Auto-Adapt is explicit opt-in. You can stay manual, turn it off
          globally, or disable it per site. Page text is not processed silently
          before you consent.
        </p>
        <p className="landing-companion-note" style={{ margin: 0 }}>
          Not in the Chrome Web Store yet. Build with{" "}
          <code className="landing-code">node extension/build.mjs</code>, then
          Chrome → Extensions → Developer mode → Load unpacked. Steps live in{" "}
          <code className="landing-code">extension/README.md</code>.
        </p>
      </Section>

      <Section id="meaning-check" title="Meaning Check">
        <p style={{ margin: 0 }}>
          Before Linaw rewrites, it builds a{" "}
          <strong style={{ color: "var(--color-ink)", fontWeight: 600 }}>
            Meaning Map
          </strong>
          —who does what, when, under which conditions, with which exceptions.
          That structure catches the details a freeform rewrite tends to lose:
          actors, actions, dates, deadlines, numbers, conditions, exceptions,
          negations, and relationships.
        </p>
        <p style={{ margin: 0 }}>
          After adaptation,{" "}
          <strong style={{ color: "var(--color-ink)", fontWeight: 600 }}>
            Meaning Check
          </strong>{" "}
          (the user-facing name for the verification pipeline) can warn when
          something looks off—for example, a time that seems attached to the
          wrong group, or a condition that may have changed. You get concrete
          prompts to review the source, not a claim that the system proved the
          rewrite is correct.
        </p>
        <aside className="landing-example" aria-label="Cautious status language">
          <p className="landing-example-label">What you might see</p>
          <ul className="landing-plain-list">
            <li>No issue found in these checks.</li>
            <li>Important condition may have changed. Review source.</li>
            <li>The time appears to be attached to the wrong group.</li>
          </ul>
        </aside>
      </Section>

      <section
        id="start"
        aria-labelledby="start-heading"
        className="landing-section"
        style={{
          width: "100%",
          paddingBottom: "clamp(3rem, 8vw, 5rem)",
        }}
      >
        <div
          className="landing-section-inner"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "1.25rem",
          }}
        >
          <h2
            id="start-heading"
            style={{
              margin: 0,
              fontFamily: "var(--font-reading)",
              fontSize: "clamp(1.625rem, 4vw, 2rem)",
              fontWeight: 600,
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
              color: "var(--color-ink)",
            }}
          >
            Start with your defaults
          </h2>
          <p
            style={{
              margin: 0,
              maxWidth: "28rem",
              fontSize: "1.0625rem",
              lineHeight: 1.55,
              color: "var(--color-ink-muted)",
            }}
          >
            Set detail, wording, delivery, and browser behavior—then read with
            the source still close at hand.
          </p>
          <OpenLinawButton />
        </div>
      </section>

      <style>{`
        .landing-section-inner {
          width: 100%;
          max-width: 40rem;
          margin: 0 auto;
          padding: clamp(2.25rem, 5vw, 3.25rem) clamp(1.25rem, 5vw, 2.5rem);
          box-sizing: border-box;
        }
        .landing-code {
          font-family: ui-monospace, Consolas, monospace;
          font-size: 0.875em;
          background: var(--color-paper-inset);
          padding: 0.12em 0.35em;
          border-radius: 0.25rem;
          color: var(--color-ink);
        }
        .landing-example {
          margin: 0.25rem 0 0;
          padding: 1.1rem 1.2rem;
          background: var(--color-paper);
          border: 1px solid color-mix(in srgb, var(--color-ink) 8%, transparent);
          border-radius: 0.75rem;
          text-align: left;
        }
        .landing-example-label {
          margin: 0 0 0.5rem;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-ink-subtle);
        }
        .landing-list-numbered {
          margin: 0.15rem 0 0;
          padding: 0 0 0 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }
        .landing-list-numbered strong {
          color: var(--color-ink);
          font-weight: 600;
        }
        .landing-plain-list {
          margin: 0;
          padding: 0 0 0 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          color: var(--color-ink);
        }
        .landing-pref-grid {
          list-style: none;
          margin: 0.35rem 0 0;
          padding: 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.85rem;
        }
        @media (min-width: 640px) {
          .landing-pref-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .landing-pref-item {
          margin: 0;
          padding: 1rem 1.1rem;
          background: var(--color-paper);
          border: 1px solid color-mix(in srgb, var(--color-ink) 8%, transparent);
          border-radius: 0.75rem;
          text-align: left;
        }
        .landing-pref-label {
          margin: 0 0 0.35rem;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--color-ink-subtle);
        }
        .landing-pref-choices {
          margin: 0 0 0.4rem;
          font-family: var(--font-reading);
          font-size: 1.125rem;
          font-weight: 600;
          line-height: 1.35;
          color: var(--color-ink);
        }
        .landing-pref-note {
          margin: 0;
          font-size: 0.9375rem;
          line-height: 1.5;
          color: var(--color-ink-muted);
        }
        .landing-companion-note {
          font-size: 0.9375rem;
          color: var(--color-ink-subtle);
        }
        .landing-cta:hover {
          background: var(--color-action-hover) !important;
        }
        .landing-cta:focus-visible {
          outline: 2px solid var(--color-focus);
          outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
          .landing-page * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </main>
  );
}

export default LandingPage;
