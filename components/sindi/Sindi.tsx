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
          width: state === "reading" ? 28 : 40,
          height: state === "reading" ? 28 : 40,
          flexShrink: 0,
          transition:
            "width var(--motion-base) ease, height var(--motion-base) ease, transform var(--motion-base) ease",
          transform: look === "warning" ? "rotate(-6deg)" : undefined,
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
  const showExtraRays = look === "success";
  const quietRays = look === "listening";
  const spin = look === "processing";

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
          @keyframes linaw-ray-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .linaw-ray-spin {
            transform-origin: 32px 32px;
          }
          @media (prefers-reduced-motion: no-preference) {
            .linaw-ray-spin {
              animation: linaw-ray-spin 4.5s linear infinite;
            }
          }
        `}</style>
      </defs>

      <g className={spin ? "linaw-ray-spin" : undefined}>
        <RayBurst quiet={quietRays} extra={showExtraRays} />
        {spin ? <MotionArcs /> : null}
      </g>

      {/* body */}
      <circle cx="32" cy="32" r="14" fill={RAY.body} />

      <Face look={look} />
    </svg>
  );
}

/** Six pill rays at 12 / 2 / 4 / 6 / 8 / 10 o'clock; optional bloom lines. */
function RayBurst({ quiet, extra }: { quiet: boolean; extra: boolean }) {
  const angles = [0, 60, 120, 180, 240, 300];
  // Listening: side rays quieter (lower opacity); keep top/bottom clearer.
  const quietOpacity = (i: number) =>
    quiet ? (i === 0 || i === 3 ? 0.85 : 0.28) : 1;

  return (
    <g>
      {angles.map((deg, i) => (
        <rect
          key={deg}
          x="29"
          y="4"
          width="6"
          height="12"
          rx="3"
          fill={RAY.ray}
          opacity={quietOpacity(i)}
          transform={`rotate(${deg} 32 32)`}
        />
      ))}
      {extra
        ? [30, 90, 150, 210, 270, 330].map((deg) => (
            <line
              key={`bloom-${deg}`}
              x1="32"
              y1="8"
              x2="32"
              y2="14"
              stroke={RAY.ray}
              strokeWidth="1.5"
              strokeLinecap="round"
              transform={`rotate(${deg} 32 32)`}
            />
          ))
        : null}
    </g>
  );
}

function MotionArcs() {
  return (
    <g
      fill="none"
      stroke={RAY.ray}
      strokeWidth="1.25"
      strokeLinecap="round"
      opacity="0.55"
    >
      <path d="M12 28 A20 20 0 0 1 16 18" />
      <path d="M52 36 A20 20 0 0 1 48 46" />
    </g>
  );
}

function Face({ look }: { look: RayLook }) {
  switch (look) {
    case "success":
      return (
        <g fill="none" stroke={RAY.navy} strokeWidth="2" strokeLinecap="round">
          {/* happy closed eyes */}
          <path d="M24 30 Q27 26 30 30" />
          <path d="M34 30 Q37 26 40 30" />
          <path
            d="M28 38 Q32 41 36 38"
            stroke={RAY.cream}
            strokeWidth="1.75"
          />
        </g>
      );
    case "empty":
      return (
        <g fill="none" stroke={RAY.navy} strokeWidth="2" strokeLinecap="round">
          {/* peaceful closed eyes */}
          <path d="M24 31 Q27 35 30 31" />
          <path d="M34 31 Q37 35 40 31" />
          <path
            d="M29 38 Q32 40 35 38"
            stroke={RAY.cream}
            strokeWidth="1.5"
          />
        </g>
      );
    case "processing":
      return (
        <g fill={RAY.navy}>
          <circle cx="27" cy="31" r="2.25" />
          <circle cx="37" cy="31" r="2.25" />
        </g>
      );
    case "listening":
      return (
        <g>
          <circle cx="27" cy="31" r="2.6" fill={RAY.navy} opacity="0.92" />
          <circle cx="37" cy="31" r="2.6" fill={RAY.navy} opacity="0.92" />
          <path
            d="M28 38 Q32 41 36 38"
            fill="none"
            stroke={RAY.navy}
            strokeWidth="1.75"
            strokeLinecap="round"
            opacity="0.85"
          />
        </g>
      );
    case "warning":
      return (
        <g>
          {/* soft concern brows — not angry */}
          <path
            d="M23 26 Q27 24.5 30 26.5"
            fill="none"
            stroke={RAY.navy}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M34 26.5 Q37 24.5 41 26"
            fill="none"
            stroke={RAY.navy}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          <ellipse cx="27" cy="31.5" rx="2.4" ry="2.7" fill={RAY.navy} />
          <ellipse cx="37" cy="31.5" rx="2.4" ry="2.7" fill={RAY.navy} />
          <path
            d="M28 39 Q32 37.5 36 39"
            fill="none"
            stroke={RAY.navy}
            strokeWidth="1.75"
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
