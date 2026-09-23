import { ReadingWorkspace } from "@/components/read";
import { decodeShareSource, SHARE_PARAM } from "@/components/read/shareLink";

/**
 * Reading workspace — adapted note, Listen, Preferences, Meaning Check rail.
 * Specs: 02-reading-workspace.md, 03-meaning-check.md.
 * Checks nav: /read#meaning-check → id="meaning-check".
 * /read?piece=<id> opens a piece saved on this device.
 * /read?s=<encoded> opens a source someone shared; it is adapted with the
 * reader's own preferences.
 */
export default async function ReadPage({
  searchParams,
}: {
  searchParams: Promise<{ piece?: string | string[]; s?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = params.piece;
  const pieceId = typeof raw === "string" && raw.trim() ? raw : null;
  const rawShared = params[SHARE_PARAM];
  const sharedSource =
    typeof rawShared === "string" ? decodeShareSource(rawShared) : null;
  return <ReadingWorkspace pieceId={pieceId} sharedSource={sharedSource} />;
}
