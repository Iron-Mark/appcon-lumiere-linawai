import { AlertTriangle, CheckCircle2 } from "lucide-react";

import type { PieceStatus } from "@/lib/content/pieces";

const STATUS_COPY = {
  checked: {
    label: "Checked",
    Icon: CheckCircle2,
    className: "bg-action-soft text-pass border border-action-border/25",
  },
  needs_review: {
    label: "Needs review",
    Icon: AlertTriangle,
    className: "bg-warning-soft text-warning border border-warning-border/30",
  },
} as const;

type ContentStatusBadgeProps = {
  status: PieceStatus;
};

/**
 * Status uses icon + text (not color alone). Labels avoid “Verified” / “guaranteed”.
 */
export function ContentStatusBadge({ status }: ContentStatusBadgeProps) {
  const { label, Icon, className } = STATUS_COPY[status];

  return (
    <span
      className={`font-ui inline-flex min-h-8 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      <Icon aria-hidden className="size-3.5 shrink-0" strokeWidth={2} />
      <span>{label}</span>
    </span>
  );
}
