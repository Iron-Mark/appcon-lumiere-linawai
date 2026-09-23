import Link from "next/link";
import { Sindi } from "@/components/sindi";
import { Button } from "@/components/ui/button";

/**
 * One-page editorial landing. Primary path: Open Linaw → /onboarding.
 * Layout tuned from Mobbin Midday / Tana web heroes: centered serif value
 * line, one primary CTA, warm paper, quiet product note below.
 */
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(2rem, 6vw, 4.5rem) clamp(1.25rem, 5vw, 2.5rem)",
        fontFamily: "var(--font-ui)",
        color: "var(--color-ink)",
      }}
    >
      <div
        className="landing-frame"
        style={{
          width: "100%",
          maxWidth: "38rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "clamp(1.75rem, 4vw, 2.75rem)",
        }}
      >
        <header
          className="landing-reveal"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.35rem",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.65rem",
            }}
          >
            <span
              className="landing-ray"
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
              maxWidth: "22ch",
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
              maxWidth: "28rem",
              fontFamily: "var(--font-ui)",
              fontSize: "clamp(1rem, 2.2vw, 1.125rem)",
              fontWeight: 500,
              lineHeight: 1.55,
              color: "var(--color-ink-muted)",
            }}
          >
            Clearer layout for dense pages — the facts stay the same.
          </p>
        </header>

        <div
          className="landing-reveal landing-reveal-delay"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            width: "100%",
          }}
        >
          <Button
            asChild
            className="landing-cta"
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

          <p
            className="landing-companion"
            style={{
              margin: 0,
              maxWidth: "30rem",
              fontSize: "0.875rem",
              lineHeight: 1.55,
              color: "var(--color-ink-subtle)",
            }}
          >
            Chrome companion is not in the Chrome Web Store. Build with{" "}
            <code className="landing-code">node extension/build.mjs</code>, then
            Load unpacked — steps in{" "}
            <code className="landing-code">extension/README.md</code>.
          </p>
        </div>

        <aside
          className="landing-reveal landing-reveal-delay-2 landing-note"
          aria-label="Example of an adapted sentence"
          style={{
            width: "100%",
            maxWidth: "26rem",
            marginTop: "0.25rem",
            background: "var(--color-paper-raised)",
            border: "1px solid color-mix(in srgb, var(--color-ink) 8%, transparent)",
            borderRadius: "0.75rem",
            boxShadow:
              "0 1px 0 color-mix(in srgb, var(--color-ink) 5%, transparent), 0 22px 48px -32px color-mix(in srgb, var(--color-ink) 22%, transparent)",
            padding: "1.35rem 1.5rem 1.45rem",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            gap: "0.65rem",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-ui)",
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--color-ink-subtle)",
            }}
          >
            Adapted
          </p>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-reading)",
              fontSize: "1.125rem",
              lineHeight: 1.55,
              color: "var(--color-ink)",
            }}
          >
            Meet by the lobby at 3. Bring your badge.
          </p>
        </aside>
      </div>

      <style>{`
        .landing-code {
          font-family: ui-monospace, Consolas, monospace;
          font-size: 0.875em;
          background: var(--color-paper-inset);
          padding: 0.12em 0.35em;
          border-radius: 0.25rem;
        }
        .landing-reveal {
          animation: landing-fade-up var(--motion-slow) ease both;
        }
        .landing-reveal-delay {
          animation-delay: 90ms;
        }
        .landing-reveal-delay-2 {
          animation-delay: 160ms;
        }
        @keyframes landing-fade-up {
          from {
            opacity: 0;
            transform: translateY(0.55rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .landing-cta:hover {
          background: var(--color-action-hover) !important;
        }
        .landing-cta:focus-visible {
          outline: 2px solid var(--color-focus);
          outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
          .landing-reveal,
          .landing-reveal-delay,
          .landing-reveal-delay-2 {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}

export default LandingPage;
