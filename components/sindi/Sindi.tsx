import type { CSSProperties } from "react";

export type SindiState =
  | "prompt"
  | "working"
  | "reading"
  | "listening"
  | "pass"
  | "warning"
  | "empty";

export type SindiProps = {
  state: SindiState;
  /** Optional override for the one short line. */
  line?: string;
  className?: string;
};

/** Sheet visual mapped from the product `state` prop. */
type RayLook =
  | "default"
  | "processing"
  | "success"
  | "empty"
  | "listening"
  | "warning";

/** Character-sheet palette (warm yellow body, bright rays, cream, navy, cool gray). */
const RAY = {
  body: "#F5C542",
  ray: "#F0D06B",
  cream: "#F7F0D8",
  navy: "#1B2A4A",
  gray: "#B8BCC8",
} as const;

const DEFAULT_LINES: Record<SindiState, string> = {
  prompt: "One choice at a time.",
  working: "Adapting…",
  reading: "",
  listening: "Reading aloud…",
  pass: "No issue found in these checks.",
  warning: "The time appears to be attached to the wrong group.",
  empty: "A fresh start, whenever you're ready.",
};

function lookFor(state: SindiState): RayLook {
  switch (state) {
    case "working":
      return "processing";
    case "pass":
      return "success";
    case "empty":
      return "empty";
    case "listening":
      return "listening";
    case "warning":
      return "warning";
    case "prompt":
    case "reading":
    default:
      return "default";
  }
}

/**
 * Presentational mascot only. Screens pass `state` and optional `line`.
 * Visible character is Ray (sun). Export name stays `Sindi` for stable imports.
 * No adapt calls, routing, or screen logic.
 */
export function Sindi({ state, line, className }: SindiProps) {
  const text = line ?? DEFAULT_LINES[state];
  const look = lookFor(state);
  const size = state === "reading" ? 28 : 40;

  return (
    <div
      className={className}
      data-sindi-state={state}
      data-ray-look={look}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.75rem",
        fontFamily: "var(--font-ui)",
        color: "var(--color-ink)",
      }}
      role="status"
      aria-live="polite"
    >
      <RaySvg
        look={look}
        style={{
          width: size,
          height: size,
          flexShrink: 0,
          overflow: "visible",
          transition:
            "width var(--motion-base) ease, height var(--motion-base) ease",
        }}
      />
      {text ? (
        <p
          style={{
            margin: 0,
            fontSize: "0.9375rem",
            lineHeight: 1.4,
            color:
              state === "warning"
                ? "var(--color-warning)"
                : "var(--color-ink-muted)",
            maxWidth: "18rem",
          }}
        >
          {text}
        </p>
      ) : null}
    </div>
  );
}

function RaySvg({
  look,
  style,
}: {
  look: RayLook;
  style?: CSSProperties;
}) {
  const quietRays = look === "listening";
  const showBloom = look === "success";
  const dimRays = look === "empty";
  const spin = look === "processing";
  const listenPulse = look === "listening";
  const warnTilt = look === "warning";

  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      style={style}
    >
      <title>Ray</title>
      <defs>
        <style>{`
          /* Motion: transform/opacity only; fixed origin keeps layout bounds stable */
          .linaw-ray-spin,
          .linaw-ray-listen-side,
          .linaw-ray-warn {
            transform-box: view-box;
            transform-origin: 32px 32px;
          }
          @keyframes linaw-ray-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          /* Cream trails as secondary activity cue — staggered opacity */
          @keyframes linaw-ray-arc-pulse {
            0%, 100% { opacity: 0.28; }
            50% { opacity: 0.8; }
          }
          /* Attentive side-ray breathe; top/bottom rays stay clear and static */
          @keyframes linaw-ray-listen {
            0%, 100% { transform: scale(1); opacity: 0.42; }
            50% { transform: scale(0.9); opacity: 0.14; }
          }
          /* Soft concerned sway — small angle range, not agitated */
          @keyframes linaw-ray-warn-breathe {
            0%, 100% { transform: rotate(-5deg); }
            50% { transform: rotate(-7deg); }
          }
          @media (prefers-reduced-motion: no-preference) {
            .linaw-ray-spin {
              animation: linaw-ray-spin 3s linear infinite;
            }
            .linaw-ray-arc {
              animation: linaw-ray-arc-pulse 240ms ease-in-out infinite;
            }
            .linaw-ray-arc-b {
              animation-delay: 80ms;
            }
            .linaw-ray-arc-c {
              animation-delay: 160ms;
            }
            .linaw-ray-listen-side {
              animation: linaw-ray-listen 280ms ease-in-out infinite;
            }
            .linaw-ray-warn {
              animation: linaw-ray-warn-breathe 2.6s ease-in-out infinite;
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .linaw-ray-spin,
            .linaw-ray-arc,
            .linaw-ray-listen-side,
            .linaw-ray-warn {
              animation: none;
            }
            .linaw-ray-warn {
              transform: rotate(-6deg);
            }
            .linaw-ray-listen-side {
              opacity: 0.28;
            }
            .linaw-ray-arc {
              opacity: 0.45;
            }
          }
        `}</style>
      </defs>

      {/* Fixed layout slot — motion stays inside the 64×64 viewBox */}
      <g className={warnTilt ? "linaw-ray-warn" : undefined}>
        <g className={spin ? "linaw-ray-spin" : undefined}>
          <RayBurst
            quiet={quietRays}
            bloom={showBloom}
            dim={dimRays}
            omitSideRays={listenPulse}
          />
          {spin ? <MotionArcs /> : null}
        </g>

        {/* Listening: animated quieter side rays; body/face stay still */}
        {listenPulse ? <ListeningSidePulse /> : null}

        <circle cx="32" cy="32" r="14" fill={RAY.body} />
        <Face look={look} />
      </g>
    </svg>
  );
}

/** Six pill rays at clock positions; optional success bloom; quieter sides when listening. */
function RayBurst({
  quiet,
  bloom,
  dim,
  omitSideRays,
}: {
  quiet: boolean;
  bloom: boolean;
  dim: boolean;
  /** When true, only top/bottom rays (sides drawn by ListeningSidePulse). */
  omitSideRays?: boolean;
}) {
  const angles = [0, 60, 120, 180, 240, 300] as const;
  // Listening: top/bottom clearer; side rays quieter (unless omitted for pulse layer).
  const opacityFor = (i: number) => {
    if (quiet) return i === 0 || i === 3 ? 0.9 : 0.22;
    if (dim) return 0.78;
    return 1;
  };

  return (
    <g>
      {angles.map((deg, i) => {
        const isSide = i !== 0 && i !== 3;
        if (omitSideRays && isSide) return null;
        return (
          <rect
            key={deg}
            x="29"
            y="3.5"
            width="6"
            height="12.5"
            rx="3"
            fill={RAY.ray}
            opacity={opacityFor(i)}
            transform={`rotate(${deg} 32 32)`}
          />
        );
      })}
      {bloom
        ? [30, 90, 150, 210, 270, 330].map((deg) => (
            <line
              key={`bloom-${deg}`}
              x1="32"
              y1="7"
              x2="32"
              y2="13.5"
              stroke={RAY.cream}
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.95"
              transform={`rotate(${deg} 32 32)`}
            />
          ))
        : null}
    </g>
  );
}

/** Soft side-ray pulse for listening — transform/opacity only; still when reduced-motion. */
function ListeningSidePulse() {
  const sideAngles = [60, 120, 240, 300] as const;
  return (
    <g className="linaw-ray-listen-side" aria-hidden="true">
      {sideAngles.map((deg) => (
        <rect
          key={`listen-${deg}`}
          x="29.5"
          y="3.75"
          width="5"
          height="11.5"
          rx="2.5"
          fill={RAY.ray}
          opacity="0.38"
          transform={`rotate(${deg} 32 32)`}
        />
      ))}
    </g>
  );
}

function MotionArcs() {
  return (
    <g fill="none" stroke={RAY.cream} strokeWidth="1.45" strokeLinecap="round">
      {/* Cream activity trails — opacity staggered; spin group carries rotation */}
      <path className="linaw-ray-arc" d="M10.5 29.5 A21.5 21.5 0 0 1 18.5 14" />
      <path
        className="linaw-ray-arc linaw-ray-arc-b"
        d="M13.5 43 A21.5 21.5 0 0 1 10.5 27.5"
      />
      <path
        className="linaw-ray-arc linaw-ray-arc-c"
        d="M53.5 34.5 A21.5 21.5 0 0 1 46 50"
      />
    </g>
  );
}

function Face({ look }: { look: RayLook }) {
  switch (look) {
    case "success":
      return (
        <g fill="none" stroke={RAY.navy} strokeWidth="2" strokeLinecap="round">
          {/* Happy closed eyes (⌢) — information is clearer */}
          <path d="M23.5 30.5 Q27 26.5 30.5 30.5" />
          <path d="M33.5 30.5 Q37 26.5 40.5 30.5" />
        </g>
      );
    case "empty":
      return (
        <g fill="none" stroke={RAY.navy} strokeLinecap="round">
          {/* Peaceful closed eyes (⌣) */}
          <path
            d="M23.5 31 Q27 35 30.5 31"
            strokeWidth="2"
          />
          <path
            d="M33.5 31 Q37 35 40.5 31"
            strokeWidth="2"
          />
          {/* Faint soft smile */}
          <path
            d="M29 38.5 Q32 40.5 35 38.5"
            stroke={RAY.navy}
            strokeWidth="1.35"
            opacity="0.45"
          />
        </g>
      );
    case "processing":
      return (
        <g fill={RAY.navy}>
          {/* Focused dots, slightly closer — no mouth while working */}
          <circle cx="27.5" cy="31" r="2.15" />
          <circle cx="36.5" cy="31" r="2.15" />
        </g>
      );
    case "listening":
      return (
        <g>
          {/* Softer, slightly larger open eyes */}
          <circle cx="27" cy="31" r="2.75" fill={RAY.navy} opacity="0.88" />
          <circle cx="37" cy="31" r="2.75" fill={RAY.navy} opacity="0.88" />
          {/* Tiny cream highlight for softness */}
          <circle cx="26.2" cy="30.2" r="0.7" fill={RAY.cream} opacity="0.9" />
          <circle cx="36.2" cy="30.2" r="0.7" fill={RAY.cream} opacity="0.9" />
          <path
            d="M28.5 38.5 Q32 41 35.5 38.5"
            fill="none"
            stroke={RAY.navy}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.75"
          />
        </g>
      );
    case "warning":
      return (
        <g>
          {/* Soft inward brows — concerned, not furrowed-angry */}
          <path
            d="M23.5 26.8 Q27.2 25.6 30.5 27.4"
            fill="none"
            stroke={RAY.navy}
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.55"
          />
          <path
            d="M33.5 27.4 Q36.8 25.6 40.5 26.8"
            fill="none"
            stroke={RAY.navy}
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.55"
          />
          {/* Slightly oval eyes, a touch lower — worried, not fierce */}
          <ellipse cx="27.4" cy="32" rx="2.2" ry="2.45" fill={RAY.navy} />
          <ellipse cx="36.6" cy="32" rx="2.2" ry="2.45" fill={RAY.navy} />
          {/* Soft wavy concerned mouth */}
          <path
            d="M28.2 39.4 Q30.2 38 32 39.1 Q33.8 40.2 35.8 39.4"
            fill="none"
            stroke={RAY.navy}
            strokeWidth="1.55"
            strokeLinecap="round"
          />
        </g>
      );
    case "default":
    default:
      return (
        <g>
          <circle cx="27" cy="31" r="2.25" fill={RAY.navy} />
          <circle cx="37" cy="31" r="2.25" fill={RAY.navy} />
          <path
            d="M28 38 Q32 41.5 36 38"
            fill="none"
            stroke={RAY.navy}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </g>
      );
  }
}

export default Sindi;
