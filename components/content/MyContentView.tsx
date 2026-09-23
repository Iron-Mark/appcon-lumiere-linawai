"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { AuthAccountSection } from "@/components/auth";
import { Button } from "@/components/ui/button";

import { ContentTable } from "./ContentTable";
import { usePieces } from "./usePieces";

/**
 * My Content lists pieces saved on this device.
 * New Content opens a fresh Read page and does not save anything.
 */
function NewContentButton({ className }: { className?: string }) {
  return (
    <Button
      asChild
      size="lg"
      className={`font-ui min-h-11 cursor-pointer gap-2 rounded-lg bg-action px-5 text-sm font-semibold text-paper-raised shadow-none hover:bg-action-hover focus-visible:ring-2 focus-visible:ring-focus ${className ?? ""}`}
    >
      <Link href="/read">
        <Plus aria-hidden className="size-4" strokeWidth={2} />
        New Content
      </Link>
    </Button>
  );
}

export function MyContentView() {
  const { ready, pieces, remove } = usePieces();
  const hasPieces = ready && pieces.length > 0;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex max-w-xl flex-col gap-2">
          <h1 className="font-reading text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            My Content
          </h1>
          <p className="font-ui text-sm leading-relaxed text-ink-muted sm:text-base">
            Manage and review the content you&apos;ve added to Linaw.
          </p>
        </div>
        {hasPieces ? <NewContentButton /> : null}
      </header>

      <AuthAccountSection variant="content" />

      <section aria-label="Your content" className="flex flex-col gap-3">
        {!ready ? (
          <p className="font-ui m-0 text-sm text-ink-muted">Loading your pieces…</p>
        ) : pieces.length === 0 ? (
          <Link
            href="/read"
            className="flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-paper-raised px-5 py-12 text-center outline-none transition-colors duration-200 hover:border-action-border hover:bg-action-soft/40 focus-visible:ring-2 focus-visible:ring-focus motion-reduce:transition-none"
          >
            <p className="font-reading m-0 text-xl font-semibold text-ink">
              Nothing saved yet
            </p>
            <p className="font-ui mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
              Adapt a note, then save it on this device. It will show up here.
            </p>
            <span className="font-ui mt-6 inline-flex min-h-11 w-full max-w-xs items-center justify-center gap-2 rounded-lg bg-action px-5 text-sm font-semibold text-paper-raised">
              <Plus aria-hidden className="size-4" strokeWidth={2} />
              New Content
            </span>
          </Link>
        ) : (
          <ContentTable
            rows={pieces.map((piece) => ({
              id: piece.id,
              title: piece.title,
              savedAt: piece.savedAt,
              status: piece.status,
            }))}
            onRemove={remove}
          />
        )}
      </section>
    </main>
  );
}
