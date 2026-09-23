import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPieceDate, type PieceStatus } from "@/lib/content/pieces";

import { ContentOverflowMenu } from "./ContentOverflowMenu";
import { ContentStatusBadge } from "./ContentStatusBadge";

export type ContentRow = {
  id: string;
  title: string;
  savedAt: string;
  status: PieceStatus;
};

type ContentTableProps = {
  rows: ContentRow[];
  onRemove: (id: string) => void | Promise<void>;
};

/**
 * Saved pieces on this device. Each row opens that source in Read.
 */
export function ContentTable({ rows, onRemove }: ContentTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-paper-raised shadow-sm">
      <Table className="font-ui">
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="h-11 px-4 text-xs font-semibold tracking-[0.08em] text-ink-subtle uppercase">
              Title
            </TableHead>
            <TableHead className="h-11 px-4 text-xs font-semibold tracking-[0.08em] text-ink-subtle uppercase">
              Upload date
            </TableHead>
            <TableHead className="h-11 px-4 text-xs font-semibold tracking-[0.08em] text-ink-subtle uppercase">
              Status
            </TableHead>
            <TableHead className="h-11 w-14 px-2">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const href = `/read?piece=${encodeURIComponent(row.id)}`;
            return (
              <TableRow
                key={row.id}
                className="border-border hover:bg-paper-inset/60"
              >
                <TableCell className="max-w-[20rem] px-4 py-3.5 text-sm font-medium text-ink sm:max-w-none">
                  <Link
                    href={href}
                    className="block cursor-pointer truncate whitespace-normal text-ink hover:text-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  >
                    {row.title}
                  </Link>
                </TableCell>
                <TableCell className="px-4 py-3.5 text-sm whitespace-nowrap text-ink-muted">
                  <time dateTime={row.savedAt}>{formatPieceDate(row.savedAt)}</time>
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <ContentStatusBadge status={row.status} />
                </TableCell>
                <TableCell className="px-2 py-2">
                  <ContentOverflowMenu
                    pieceId={row.id}
                    title={row.title}
                    onRemove={() => onRemove(row.id)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
