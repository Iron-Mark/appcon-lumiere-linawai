import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type IllustrationProps = {
  className?: string;
};

function Scene({
  className,
  children,
  label,
}: IllustrationProps & { children: ReactNode; label: string }) {
  return (
    <svg
      viewBox="0 0 160 112"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn("text-action", className)}
    >
      <title>{label}</title>
      {children}
    </svg>
  );
}

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** A campus notice on paper. */
export function NoticeSheet({ className }: IllustrationProps) {
  return (
    <Scene className={className} label="A notice on paper">
      <rect
        x="36"
        y="14"
        width="88"
        height="84"
        rx="8"
        fill="var(--color-paper-raised)"
        {...stroke}
      />
      <path d="M50 36h60M50 50h46M50 64h54M50 78h28" {...stroke} opacity="0.72" />
      <circle cx="108" cy="28" r="7" fill="var(--color-action-soft)" {...stroke} />
    </Scene>
  );
}

/** A short list, the Key Points shape. */
export function KeyPoints({ className }: IllustrationProps) {
  return (
    <Scene className={className} label="Key points as a short list">
      <rect
        x="28"
        y="16"
        width="104"
        height="80"
        rx="8"
        fill="var(--color-paper-raised)"
        {...stroke}
      />
      {[34, 52, 70].map((y, i) => (
        <g key={y}>
          <circle cx="46" cy={y} r="3.5" fill="currentColor" />
          <path d={`M58 ${y}h${52 - i * 12}`} {...stroke} opacity="0.8" />
        </g>
      ))}
    </Scene>
  );
}

/** A page being read aloud. */
export function ListenPage({ className }: IllustrationProps) {
  return (
    <Scene className={className} label="A page being read aloud">
      <rect
        x="34"
        y="22"
        width="64"
        height="72"
        rx="8"
        fill="var(--color-paper-raised)"
        {...stroke}
      />
      <path d="M46 42h40M46 54h32M46 66h36" {...stroke} opacity="0.7" />
      <path d="M112 40c8 8 8 24 0 32" {...stroke} />
      <path d="M120 32c12 12 12 36 0 48" {...stroke} opacity="0.55" />
    </Scene>
  );
}

/** A claim checked back against the source. */
export function MeaningCheck({ className }: IllustrationProps) {
  return (
    <Scene className={className} label="A claim checked against the source">
      <rect
        x="18"
        y="22"
        width="58"
        height="70"
        rx="7"
        fill="var(--color-paper-raised)"
        {...stroke}
      />
      <path d="M28 40h38M28 52h30M28 64h34" {...stroke} opacity="0.65" />
      <rect
        x="84"
        y="22"
        width="58"
        height="70"
        rx="7"
        fill="var(--color-paper-raised)"
        stroke="var(--color-warning)"
        strokeWidth="1.75"
      />
      <path
        d="M96 48h34"
        stroke="var(--color-warning)"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M100 68l6 6 12-14"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Scene>
  );
}

/** Two lines, English and the everyday mix. */
export function TaglishLines({ className }: IllustrationProps) {
  return (
    <Scene className={className} label="English and Taglish on the same page">
      <rect
        x="24"
        y="18"
        width="112"
        height="76"
        rx="8"
        fill="var(--color-paper-raised)"
        {...stroke}
      />
      <path d="M38 42h72" {...stroke} />
      <path d="M38 58h40" {...stroke} opacity="0.45" />
      <path d="M82 58h28" {...stroke} />
      <path d="M38 74h56" {...stroke} opacity="0.7" />
    </Scene>
  );
}

/** The page stays inside the frame. Nothing is sent out. */
export function KeptOnDevice({ className }: IllustrationProps) {
  return (
    <Scene className={className} label="A page that stays on this device">
      <rect
        x="28"
        y="16"
        width="104"
        height="80"
        rx="10"
        fill="var(--color-paper-raised)"
        {...stroke}
      />
      <rect
        x="48"
        y="36"
        width="64"
        height="44"
        rx="6"
        fill="var(--color-action-soft)"
        {...stroke}
      />
      <path d="M72 52v-6a8 8 0 0 1 16 0v6" {...stroke} />
      <circle cx="80" cy="62" r="3" fill="currentColor" />
    </Scene>
  );
}

/** The reading workspace in a browser window. */
export function WebWindow({ className }: IllustrationProps) {
  return (
    <Scene className={className} label="The reading workspace in a browser">
      <rect
        x="18"
        y="18"
        width="124"
        height="78"
        rx="8"
        fill="var(--color-paper-raised)"
        {...stroke}
      />
      <path d="M18 36h124" {...stroke} />
      <circle cx="32" cy="27" r="2.5" fill="currentColor" />
      <circle cx="42" cy="27" r="2.5" fill="currentColor" opacity="0.4" />
      <path d="M32 52h70M32 64h52M32 76h60" {...stroke} opacity="0.7" />
    </Scene>
  );
}

/** A thin panel beside a page. */
export function CompanionPanel({ className }: IllustrationProps) {
  return (
    <Scene className={className} label="A thin companion beside a page">
      <rect
        x="16"
        y="20"
        width="86"
        height="74"
        rx="8"
        fill="var(--color-paper-raised)"
        {...stroke}
      />
      <path d="M28 40h52M28 52h40M28 64h46" {...stroke} opacity="0.65" />
      <rect
        x="108"
        y="20"
        width="36"
        height="74"
        rx="8"
        fill="var(--color-action-soft)"
        {...stroke}
      />
      <path d="M118 38h16M118 50h12" {...stroke} />
    </Scene>
  );
}

/** A download archive. */
export function ZipFile({ className }: IllustrationProps) {
  return (
    <Scene className={className} label="A ZIP file">
      <rect x="46" y="40" width="68" height="48" rx="6" {...stroke} />
      <path d="M46 54h68" {...stroke} />
      <rect x="66" y="20" width="28" height="24" rx="3" {...stroke} />
      <path d="M74 28h12M74 34h8" {...stroke} />
    </Scene>
  );
}

/** A switch turned on. */
export function DevSwitch({ className }: IllustrationProps) {
  return (
    <Scene className={className} label="A switch turned on">
      <rect
        x="28"
        y="36"
        width="104"
        height="40"
        rx="8"
        fill="var(--color-paper-raised)"
        {...stroke}
      />
      <rect
        x="86"
        y="46"
        width="34"
        height="20"
        rx="10"
        fill="var(--color-action-soft)"
        {...stroke}
      />
      <circle cx="110" cy="56" r="6" fill="currentColor" />
    </Scene>
  );
}

/** A folder ready to load. */
export function OpenFolder({ className }: IllustrationProps) {
  return (
    <Scene className={className} label="A folder ready to load">
      <path
        d="M28 40h36l8 8h60v40a6 6 0 0 1-6 6H34a6 6 0 0 1-6-6V40z"
        fill="var(--color-paper-raised)"
        {...stroke}
      />
      <path d="M48 62h40" {...stroke} opacity="0.7" />
    </Scene>
  );
}
