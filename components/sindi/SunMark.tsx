import { cn } from "@/lib/utils";

type SunMarkProps = {
  className?: string;
};

/**
 * Quiet olive ray strokes for empty columns. Not the character.
 * Ray himself stays in Sindi.
 */
export function SunMark({ className }: SunMarkProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      aria-hidden="true"
      focusable="false"
      className={cn("text-action", className)}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.75"
      >
        {[0, 45, 90, 135].map((deg) => (
          <line
            key={deg}
            x1="40"
            y1="8"
            x2="40"
            y2="22"
            transform={`rotate(${deg} 40 40)`}
          />
        ))}
      </g>
      <circle
        cx="40"
        cy="40"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  );
}
