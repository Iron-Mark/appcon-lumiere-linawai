import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OpenLinawButtonProps = {
  className?: string;
  /** Show trailing arrow. Default true. */
  withArrow?: boolean;
  /** full = stretch on narrow layouts */
  fullWidth?: boolean;
};

/**
 * Sole primary CTA for the public landing. Routes to /onboarding.
 */
export function OpenLinawButton({
  className,
  withArrow = true,
  fullWidth = false,
}: OpenLinawButtonProps) {
  return (
    <Button
      asChild
      className={cn(
        "landing-cta h-11 min-h-11 cursor-pointer rounded-lg bg-action px-6 text-base font-semibold text-paper-raised shadow-none hover:bg-action-hover focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        fullWidth && "w-full sm:w-auto",
        className,
      )}
    >
      <Link href="/onboarding">
        Open Linaw
        {withArrow ? (
          <ArrowRight className="size-4" aria-hidden="true" />
        ) : null}
      </Link>
    </Button>
  );
}
