/**
 * Team checklist of unbuilt backend plugs.
 * Not part of the user demo path — calm visual system matching Linaw paper/ink.
 */

type TodoRow = {
  what: string;
  replace: string;
  spec: string;
};

const BACKEND_TODOS: TodoRow[] = [
  {
    what: "Gemini extraction and adaptation over adapt() - wired, off unless a key is set (spends tokens)",
    replace:
      "app/api/adapt/route.ts calls model.ts only when GEMINI_API_KEY or the gateway env is set; otherwise fixture.ts",
    spec: "05-client-port.md, spec-02-gemini-adapt",
  },
  {
    what: "DeBERTa NLI - wired, off unless NLI_ENDPOINT is set (local nli-service; not required for the demo)",
    replace: "lib/fidelity runNliSlot stays a neutral stub when the endpoint is unset",
    spec: "06-fidelity.md",
  },
  {
    what: "Repair regeneration - one retry only when a model key is already set; the fixture demo does not call it",
    replace:
      "app/api/adapt/model.ts calls buildRepairPrompt after repair_required",
    spec: "06-fidelity.md, 05-client-port.md",
  },
  {
    what: "Optional on-device account keeps preferences and the same-browser companion receives them (no cloud upload)",
    replace: "lib/auth/local.ts profile copy; lib/storage/preferences-sync.ts; extension prefs-sync",
    spec: "01-onboarding.md, 07-extension.md",
  },
  {
    what: "Saved source content only if the user explicitly saves",
    replace:
      "Reading workspace Save on this device; samples stay unsaved until that click",
    spec: "storage + future backend",
  },
];

export default function TodoPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <p className="text-sm uppercase tracking-wide text-ink-muted">
          Linaw AI
        </p>
        <h1 className="font-reading text-3xl font-semibold tracking-tight text-ink">
          Backend checklist
        </h1>
        <p className="max-w-prose text-ink-muted">
          Named plugs for work that is not connected yet. Each row names the
          spec and what to replace or add when the backend lands.
        </p>
      </header>

      <ol className="flex list-none flex-col gap-0 border-t border-paper-inset p-0">
        {BACKEND_TODOS.map((row, index) => (
          <li
            key={row.what}
            className="grid gap-2 border-b border-paper-inset py-5 sm:grid-cols-[2.5rem_1fr] sm:gap-4"
          >
            <span
              className="font-ui text-sm tabular-nums text-ink-subtle"
              aria-hidden
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-col gap-2">
              <p className="font-ui text-base font-medium text-ink">
                {row.what}
              </p>
              <p className="font-ui text-sm text-ink-muted">
                <span className="text-ink-subtle">Replace / add · </span>
                <code className="text-ink">{row.replace}</code>
              </p>
              <p className="font-ui text-sm text-ink-subtle">
                Spec · <code className="text-ink-muted">{row.spec}</code>
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="text-sm text-ink-subtle">
        Local adapt route is up; Gemini is still not connected.
      </p>
    </main>
  );
}
