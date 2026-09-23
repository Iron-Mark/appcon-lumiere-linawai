"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";

type ContentOverflowMenuProps = {
  pieceId: string;
  title: string;
  onRemove: () => void | Promise<void>;
};

/**
 * Row menu for a piece saved on this device.
 * Open returns to Read. Remove deletes the local piece only.
 */
export function ContentOverflowMenu({
  pieceId,
  title,
  onRemove,
}: ContentOverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const href = `/read?piece=${encodeURIComponent(pieceId)}`;

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative flex justify-end">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Actions for ${title}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className="font-ui size-11 min-h-11 min-w-11 cursor-pointer text-ink-subtle hover:bg-paper-inset hover:text-ink focus-visible:ring-2 focus-visible:ring-focus"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
      >
        <MoreHorizontal aria-hidden className="size-4" strokeWidth={1.75} />
      </Button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={`Actions for ${title}`}
          className="absolute top-full right-0 z-20 mt-1 min-w-52 overflow-hidden rounded-lg border border-border bg-paper-raised py-1 shadow-sm"
        >
          <Link
            href={href}
            role="menuitem"
            className="font-ui flex min-h-11 w-full cursor-pointer items-center px-3 text-left text-sm text-ink hover:bg-action-soft/50 focus-visible:bg-action-soft/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
            onClick={() => setOpen(false)}
          >
            Open in reader
          </Link>
          <button
            type="button"
            role="menuitem"
            className="font-ui flex min-h-11 w-full cursor-pointer items-center px-3 text-left text-sm text-ink-muted hover:bg-paper-inset focus-visible:bg-paper-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
            onClick={(event) => {
              event.stopPropagation();
              setOpen(false);
              void onRemove();
            }}
          >
            Remove from list
          </button>
        </div>
      ) : null}
    </div>
  );
}
