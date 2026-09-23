import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Team status for server plugs. Not part of the reading demo.
 */

type TodoRow = {
  state: "On" | "Off";
  what: string;
  replace: string;
  spec: string;
};

const BACKEND_TODOS: TodoRow[] = [
  {
    state: "On",
    what: "Clarification uses a hosted language model. The fixture runs only for the flagged example, and when every provider fails.",
    replace:
      "app/api/adapt/route.ts tries Gemini, then the OpenAI-compatible gateway, then fixture.ts",
    spec: "05-client-port.md, spec-02-gemini-adapt",
  },
  {
    state: "On",
    what: "One repair retry runs after repair_required when a model key is set. The flagged example never calls it.",
    replace: "app/api/adapt/model.ts calls buildRepairPrompt",
    spec: "06-fidelity.md, 05-client-port.md",
  },
  {
    state: "On",
    what: "Preferences stay on this device. A source is stored only after Save on this device.",
    replace: "lib/storage/preferences.ts; Reading workspace save",
    spec: "01-onboarding.md",
  },
  {
    state: "Off",
    what: "Gemini is wired and unkeyed. The gateway is the provider that answers today.",
    replace: "Set GEMINI_API_KEY to put Gemini first. Empty key skips it.",
    spec: "spec-02-gemini-adapt",
  },
  {
    state: "Off",
    what: "Semantic check (NLI) is wired and not running on this host. The reading screen says Not run.",
    replace: "Set NLI_ENDPOINT to the local nli-service. Unset stays the disconnected stub.",
    spec: "06-fidelity.md",
  },
  {
    state: "On",
    what: "An optional cloud account syncs preferences and saved titles. Source text is not stored there.",
    replace: "lib/auth/supabase.ts; public.linaw_profiles",
    spec: "01-onboarding.md, 07-extension.md",
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
          What is connected
        </h1>
        <p className="max-w-prose text-ink-muted">
          The production app calls a hosted model. Rows marked Off are wired
          and waiting on a key or a local service. Each row names the file.
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
                <span className="mr-2 text-sm uppercase tracking-wide text-ink-subtle">
                  {row.state}
                </span>
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
        Production clarification is on. Gemini and the semantic check are not.
      </p>
    </main>
  );
}
