import { cn } from "@/lib/utils";

type SunMarkProps = {
  className?: string;
};

/**
 * Decorative sunray asset used across landing sections.
 */
export function SunMark({ className }: SunMarkProps) {
  return (
    <img
      src="/sunray.png"
      alt=""
      aria-hidden="true"
      className={cn(
        "select-none object-contain opacity-100 contrast-125 saturate-125",
        "drop-shadow-[0_0_28px_rgba(250,198,92,0.6)]",
        "brightness-110",
        className,
      )}
    />
  );
}
