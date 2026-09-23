# Linaw AI

**Adapt the format. Preserve the meaning.**

Linaw takes one message — a notice, an email, a lesson — and gives it back to each reader in the format they chose (key points or full detail, plain or original wording, read or listened to), then runs a **Meaning Check** that compares every critical fact in the adapted note against the source before the reader relies on it.

## Status — what is live and what is not

Kept literally accurate; update it when the code changes.

| Part | State tonight |
| --- | --- |
| Reading workspace, preferences, Listen (Web Speech), PDF/text intake, saved pieces on device, share links (`/read?s=…`) | **Live**, runs in the browser, no server |
| Meaning Check layers 1, 2, 4 — deterministic fact compare, actor–value relationships, critical-fact coverage (`lib/fidelity/`) | **Live** rule-based logic; 50 test cases in `evals/` |
| Meaning Check layer 3 — semantic verification (NLI) | **Not connected.** `lib/fidelity/nli.ts` is a stub; the UI shows it as *Not run* and excludes it from the result |
| The adaptation itself (`adapt()` in `lib/adapt/`) | **Offline sample adapter** (`fixture.ts`). It adapts the built-in campus-pilot example and its seeded failure case only. For any other input the UI shows a notice that the note was not produced from that text |
| Live model path (Gemini behind the same `adapt()` port) | **Planned, not started** — `spec/spec-02-gemini-adapt/`. Requires a key (`.env.example`) and an explicit team go-ahead |
| Chrome extension (`extension/`) | Scaffolded; reads a page and opens the reading panel with the same `adapt()` port |

Run: `npm install && npm run dev` → http://localhost:3000. Check: `npm run typecheck && npm test`. CI runs both plus `next build` on every push.

Human guide (what Linaw is, how to run, specs, extension, `/todo`):

[`docs/README.md`](docs/README.md)

Run: `npm install`, then `npm run dev`, then open http://localhost:3000.

Agent guide: [`docs/AGENTS.md`](docs/AGENTS.md)

Product canon: [`docs/LINAW_AI_INITIAL-DRAFT_PROJECT_CONTEXT.md`](docs/LINAW_AI_INITIAL-DRAFT_PROJECT_CONTEXT.md)
