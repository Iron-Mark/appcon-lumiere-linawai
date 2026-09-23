import Link from "next/link";
import { Sindi } from "@/components/sindi";
import { Button } from "@/components/ui/button";

/**
 * One-page editorial landing. Primary path: Open Linaw → /onboarding.
 * Visual direction: warm paper, ink, olive — Granola-like note card calm (Mobbin).
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
        padding: "clamp(1.5rem, 4vw, 3rem) clamp(1.25rem, 4vw, 2rem)",
        fontFamily: "var(--font-ui)",
        color: "var(--color-ink)",
      }}
    >
      <div
        className="landing-frame"
        style={{
          width: "100%",
          maxWidth: "36rem",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(1.5rem, 3vw, 2.25rem)",
        }}
      >
        <header
          className="landing-reveal"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            alignItems: "flex-start",
          }}
        >
          <span
            className="landing-ray"
            style={{
              display: "inline-flex",
              transform: "scale(0.85)",
              transformOrigin: "left center",
            }}
            aria-hidden="true"
          >
            <Sindi state="reading" line="" />
          </span>

          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-reading)",
              fontSize: "clamp(2.5rem, 8vw, 3.75rem)",
              fontWeight: 600,
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              color: "var(--color-ink)",
            }}
          >
            Linaw AI
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: "28rem",
              fontFamily: "var(--font-ui)",
              fontSize: "clamp(1.0625rem, 2.5vw, 1.1875rem)",
              fontWeight: 500,
              lineHeight: 1.45,
              color: "var(--color-ink-muted)",
            }}
          >
            Adapt the format. Preserve the meaning.
          </p>
        </header>

        <aside
          className="landing-reveal landing-reveal-delay"
          aria-label="Example of an adapted sentence"
          style={{
            background: "var(--color-paper-raised)",
            border: "1px solid var(--color-paper-inset)",
            borderRadius: "0.75rem",
            boxShadow:
              "0 1px 0 color-mix(in srgb, var(--color-ink) 6%, transparent), 0 18px 40px -28px color-mix(in srgb, var(--color-ink) 28%, transparent)",
            padding: "1.25rem 1.35rem 1.35rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.85rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
            aria-hidden="true"
          >
            <span
              style={{
                width: "0.55rem",
                height: "0.55rem",
                borderRadius: "999px",
                background: "#c4a484",
              }}
            />
            <span
              style={{
                width: "0.55rem",
                height: "0.55rem",
                borderRadius: "999px",
                background: "#b8c49a",
              }}
            />
            <span
              style={{
                width: "0.55rem",
                height: "0.55rem",
                borderRadius: "999px",
                background: "#d4c4a8",
              }}
            />
            <span
              style={{
                marginLeft: "0.5rem",
                fontSize: "0.75rem",
                fontWeight: 500,
                letterSpacing: "0.03em",
                color: "var(--color-ink-subtle)",
                textTransform: "uppercase",
              }}
            >
              Adapted
            </span>
          </div>

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

          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-ui)",
              fontSize: "0.8125rem",
              lineHeight: 1.5,
              color: "var(--color-ink-subtle)",
            }}
          >
            From denser source text — format changed, meaning kept.
          </p>
        </aside>

        <div
          className="landing-reveal landing-reveal-delay-2"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            alignItems: "stretch",
          }}
        >
          <Button
            asChild
            className="landing-cta"
            style={{
              minHeight: "2.75rem",
              height: "auto",
              padding: "0.85rem 1.5rem",
              borderRadius: "999px",
              fontFamily: "var(--font-ui)",
              fontSize: "1.0625rem",
              fontWeight: 600,
              letterSpacing: "0.02em",
              background: "var(--color-action)",
              color: "var(--color-paper-raised)",
              width: "100%",
              maxWidth: "16rem",
            }}
          >
            <Link href="/onboarding">Open Linaw</Link>
          </Button>

          <section
            aria-labelledby="companion-heading"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              maxWidth: "32rem",
            }}
          >
            <h2
              id="companion-heading"
              style={{
                margin: 0,
                fontFamily: "var(--font-ui)",
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "var(--color-ink)",
              }}
            >
              Chrome companion
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: "0.9375rem",
                lineHeight: 1.55,
                color: "var(--color-ink-muted)",
              }}
            >
              There is no Chrome Web Store listing yet. Load the companion
              unpacked for now. Steps live in{" "}
              <code
                style={{
                  fontFamily: "ui-monospace, Consolas, monospace",
                  fontSize: "0.875em",
                  background: "var(--color-paper-inset)",
                  padding: "0.1em 0.35em",
                  borderRadius: "0.25rem",
                }}
              >
                extension/README.md
              </code>
              : build with{" "}
              <code
                style={{
                  fontFamily: "ui-monospace, Consolas, monospace",
                  fontSize: "0.875em",
                  background: "var(--color-paper-inset)",
                  padding: "0.1em 0.35em",
                  borderRadius: "0.25rem",
                }}
              >
                node extension/build.mjs
              </code>
              , then Chrome → Extensions → Developer mode → Load unpacked →
              select the{" "}
              <code
                style={{
                  fontFamily: "ui-monospace, Consolas, monospace",
                  fontSize: "0.875em",
                  background: "var(--color-paper-inset)",
                  padding: "0.1em 0.35em",
                  borderRadius: "0.25rem",
                }}
              >
                extension/
              </code>{" "}
              folder.
            </p>
          </section>
        </div>
      </div>

      <style>{`
        .landing-reveal {
          animation: landing-fade-up var(--motion-slow) ease both;
        }
        .landing-reveal-delay {
          animation-delay: 80ms;
        }
        .landing-reveal-delay-2 {
          animation-delay: 140ms;
        }
        @keyframes landing-fade-up {
          from {
            opacity: 0;
            transform: translateY(0.6rem);
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
        @media (min-width: 640px) {
          .landing-page .landing-cta {
            width: auto;
            align-self: flex-start;
          }
        }
      `}</style>
    </main>
  );
}

export default LandingPage;
