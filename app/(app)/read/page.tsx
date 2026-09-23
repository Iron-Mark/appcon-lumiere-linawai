import { ReadingWorkspace } from "@/components/read";

/**
 * Reading workspace — adapted note, Listen, Preferences, Meaning Check rail.
 * Specs: 02-reading-workspace.md, 03-meaning-check.md.
 * Checks nav: /read#meaning-check → id="meaning-check".
 * /read?piece=<id> opens a piece saved on this device.
 */
export default async function ReadPage({
  searchParams,
}: {
  searchParams: Promise<{ piece?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = params.piece;
  const pieceId = typeof raw === "string" && raw.trim() ? raw : null;
  return <ReadingWorkspace pieceId={pieceId} />;
}
