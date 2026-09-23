# Linaw AI

**Adapt the format. Preserve the meaning.**

Linaw AI is an adaptive information platform: a web app and Chrome companion that presents important messages the way you prefer—detail, wording, and delivery—then runs a **Meaning Check** so critical facts, conditions, and relationships are less likely to change silently.

This repository is a single Next.js app at the root. There is no backend in the current scaffold; adaptation uses an in-browser client port that will later call a server.

## Product context

Canonical product decisions live in:

[`docs/LINAW_AI_INITIAL-DRAFT_PROJECT_CONTEXT.md`](./LINAW_AI_INITIAL-DRAFT_PROJECT_CONTEXT.md)

That file wins on product questions. For what this MVP slice implements, follow `spec/` (start at [`spec/AGENTS.md`](../spec/AGENTS.md), then [`spec/spec-01-initial_scaffold/README.md`](../spec/spec-01-initial_scaffold/README.md)).

Research notes under [`docs/A1-AppCon-Research/`](./A1-AppCon-Research/) are background only.

AI development workflow (tracks, ports, hooks, campus-pilot sample): [`docs/ai-workflow.md`](./ai-workflow.md).

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm

## Run the web app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful scripts:

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run test` | Vitest |
| `npm run typecheck` | TypeScript check |

## Using the app

Onboarding finishes by taking you to `/read`. Preferences stay on your device (local storage). Meaning Check runs against the in-browser fixture—not a remote model.

## Do not call Gemini yet

Do not wire up Gemini or add `lib/adapt/http.ts` while exploring this scaffold. Live model calls spend tokens. The planned adapter work lives in [`spec/spec-02-gemini-adapt`](../spec/spec-02-gemini-adapt/). Until that phase is built, the model adapter also appears as unfinished work on [`/todo`](http://localhost:3000/todo).

## Specs

- Spec manager (index and rules): [`spec/AGENTS.md`](../spec/AGENTS.md)
- Current phase: [`spec/spec-01-initial_scaffold/`](../spec/spec-01-initial_scaffold/)
- Planned Gemini adapter: [`spec/spec-02-gemini-adapt/`](../spec/spec-02-gemini-adapt/)

Do not put loose notes or code in `spec/` itself—only numbered phase folders.

## Extension

Build from the **repository root** (after `npm install`):

```bash
node extension/build.mjs
```

Then in Chrome: open `chrome://extensions` → enable Developer mode → **Load unpacked** → select the `extension/` folder (the one with `manifest.json`).

Auto-Adapt stays off until you turn it on. There is no Chrome Web Store listing; use Load unpacked only. More detail: [`extension/README.md`](../extension/README.md).

## Development sample

Local fixture work uses a campus-pilot source with a deadline, two groups, two times, and a written-approval exception. Seeded bad adaptation: “All members arrive at 8:30 AM.” Full text and ownership: [`spec/spec-01-initial_scaffold/05-client-port.md`](../spec/spec-01-initial_scaffold/05-client-port.md).

## Extending the app

- Prefer a numbered phase under `spec/` (see [`spec/AGENTS.md`](../spec/AGENTS.md)) before large feature work.
- UI should call `adapt()` from `lib/adapt` and the preference store—never import `fixture.ts` directly.
- A future backend adds `lib/adapt/http.ts` and switches `lib/adapt/index.ts`; domain Zod types stay stable. Do not add that file yet (see **Do not call Gemini yet**).
- Parallel tracks own fixed directories listed in [`docs/AGENTS.md`](./AGENTS.md).

## Backend not connected

Unbuilt server work is listed in the app at [`/todo`](http://localhost:3000/todo) (footer link: “Backend not connected”) and in [`spec/spec-01-initial_scaffold/09-backend-todo.md`](../spec/spec-01-initial_scaffold/09-backend-todo.md).

## For coding agents

If you are using a coding agent in this repo, start with:

- [`docs/AGENTS.md`](./AGENTS.md) — agent rules, track ownership, non-negotiables
- [`spec/AGENTS.md`](../spec/AGENTS.md) — before any work under `spec/`
