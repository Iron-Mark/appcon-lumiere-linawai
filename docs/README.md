# Linaw AI

**Adapt the format. Preserve the meaning.**

Linaw AI is an adaptive information platform: a web app (and later a Chrome companion) that presents important messages the way you prefer—detail, wording, and delivery—then runs a **Meaning Check** so critical facts, conditions, and relationships are less likely to change silently.

This repository is a single Next.js app at the root. There is no backend in the current scaffold; adaptation uses an in-browser client port that will later call a server.

## Product context

Canonical product decisions live in:

[`docs/LINAW_AI_INITIAL-DRAFT_PROJECT_CONTEXT.md`](./LINAW_AI_INITIAL-DRAFT_PROJECT_CONTEXT.md)

That file wins on product questions. For what this MVP slice implements, follow `spec/` (start at [`spec/AGENTS.md`](../spec/AGENTS.md), then [`spec/spec-01-initial_scaffold/README.md`](../spec/spec-01-initial_scaffold/README.md)).

Research notes under [`docs/A1-AppCon-Research/`](./A1-AppCon-Research/) are background only.

Agent rules: [`docs/AGENTS.md`](./AGENTS.md).

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

## Specs

- Spec manager (index and rules): [`spec/AGENTS.md`](../spec/AGENTS.md)
- Current phase: [`spec/spec-01-initial_scaffold/`](../spec/spec-01-initial_scaffold/)

Do not put loose notes or code in `spec/` itself—only numbered phase folders.

## Extension

The Chrome extension (Manifest V3) lives under `extension/` once that track lands. Load it unpacked from Chrome’s extension page after the extension track builds it. The extension reuses the same `lib/` ports and preference schema; Auto-Adapt stays off until the user enables it.

## Development sample

Local fixture work uses a campus-pilot source with a deadline, two groups, two times, and a written-approval exception. Seeded bad adaptation: “All members arrive at 8:30 AM.” Full text and ownership: [`spec/spec-01-initial_scaffold/05-client-port.md`](../spec/spec-01-initial_scaffold/05-client-port.md).

## Extending the app

- Prefer a numbered phase under `spec/` (see [`spec/AGENTS.md`](../spec/AGENTS.md)) before large feature work.
- UI should call `adapt()` from `lib/adapt` and the preference store—never import `fixture.ts` directly.
- A future backend adds `lib/adapt/http.ts` and switches `lib/adapt/index.ts`; domain Zod types stay stable.
- Parallel tracks own fixed directories listed in [`docs/AGENTS.md`](./AGENTS.md).

## Backend not connected

Unbuilt server work is listed in the app at [`/todo`](http://localhost:3000/todo) (footer link: “Backend not connected”) and in [`spec/spec-01-initial_scaffold/09-backend-todo.md`](../spec/spec-01-initial_scaffold/09-backend-todo.md).
