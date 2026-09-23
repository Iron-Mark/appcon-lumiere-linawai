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
    what: "Gemini extraction and adaptation over adapt() — do not build yet (spends tokens)",
    replace:
      "Add lib/adapt/http.ts using lib/adapt/prompts.ts; point lib/adapt/index.ts at it only after team go-ahead (no app/api in this slice)",
    spec: "05-client-port.md, spec-02-gemini-adapt",
  },
  {
    what: "DeBERTa NLI (non-blocking HF cross-encoder) — do not build yet (remote model)",
    replace: "Wire into lib/fidelity runNliSlot (today: neutral stub)",
    spec: "06-fidelity.md",
  },
  {
    what: "Repair regeneration — do not build yet (needs generative model)",
    replace:
      "Pipeline after repair_required; generative repair via buildRepairPrompt",
    spec: "06-fidelity.md, 05-client-port.md",
  },
  {
    what: "Preference sync across web and extension",
    replace: "New PreferenceStore implementation; accounts",
    spec: "01-onboarding.md, 07-extension.md",
  },
  {
    what: "Saved source content only if the user explicitly saves",
    replace:
      "Explicit user save on store boundary; off by default; do not silently write sample source",
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
        Backend not connected; fixture path only for this slice.
      </p>
    </main>
  );
}
