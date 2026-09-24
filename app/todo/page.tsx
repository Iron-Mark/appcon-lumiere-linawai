import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * What the hosted app runs. Not part of the reading screen.
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
    what: "Gemini writes the clarified note. When Gemini does not return one, the gateway does. The warning notice stays off the model, so Meaning Check can show a changed fact.",
    replace:
      "app/api/adapt/route.ts. GET /api/adapt lists gemini, then openai-compatible.",
    spec: "05-client-port.md, spec-02-gemini-adapt",
  },
  {
    state: "On",
    what: "When Meaning Check requires a repair, Linaw asks for one revised note. The warning notice does not.",
    replace: "app/api/adapt/model.ts calls buildRepairPrompt",
    spec: "06-fidelity.md, 05-client-port.md",
  },
  {
    state: "On",
    what: "Reading preferences stay on this device unless the reader signs in. A message is kept only after Save on this device.",
    replace: "lib/storage/preferences.ts; Reading workspace save",
    spec: "01-onboarding.md",
  },
  {
    state: "On",
    what: "Meaning Check sends the source sentence and the claim to a hosted DeBERTa verifier. If that check does not answer within 4 seconds, it stays out of the verdict and the other checks still stand.",
    replace: "NLI_ENDPOINT on Vercel production is https://linaw-nli.onrender.com/predict",
    spec: "06-fidelity.md",
  },
  {
    state: "On",
    what: "A cloud account keeps preferences and saved titles. It does not keep the message.",
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
          What Linaw runs
        </h1>
        <p className="max-w-prose text-ink-muted">
          Linaw clarifies a notice with Gemini, then checks that the critical
          facts still match. Each part below is running.
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
                  {row.state === "On" ? "Live" : row.state}
                </span>
                {row.what}
              </p>
              <p className="font-ui text-sm text-ink-muted">
                <span className="text-ink-subtle">Where · </span>
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
        The warning notice is there so a changed meaning can be seen on purpose.
      </p>
    </main>
  );
}
