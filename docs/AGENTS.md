# Linaw AI — Agent Guide

Instructions for coding agents working in this repository.

## Start here

1. Read `docs/LINAW_AI_INITIAL-DRAFT_PROJECT_CONTEXT.md` for product decisions. That file is the canon. Do not rewrite it.
2. Read `spec/AGENTS.md` before creating or editing anything under `spec/`.
3. Open only the numbered spec folder for your phase (currently `spec/spec-01-initial_scaffold/`).
4. Find your track in the ownership map below. Edit only that track’s directories.

Human setup instructions live in `docs/README.md`. Root `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, and `README.md` only point here.

## Non-negotiables

- Product name: **Linaw AI**. Tagline: **Adapt the format. Preserve the meaning.**
- One Next.js app at the repo root. One `package.json`. No monorepo, no `apps/`, no `packages/`. The only server route is `app/api/adapt`.
- `adapt()` posts to that route. With no model key it runs the fixture, including an in-browser fallback if the route is down. Do not add other API routes.
- UI calls `adapt()` from `lib/adapt` and the preference store. It never imports `fixture.ts` directly and never branches on “demo mode.”
- Prefer preference language (Key Points, Plain Language, Listen, Auto-Adapt). Never diagnose or label the person. Auto-Adapt is always explicit opt-in.
- Verification copy is cautious. Never say “guaranteed,” “100% verified,” or “the AI proves this is correct.”
- Spec wins over code until someone edits the spec. Spec does not replace the project-context canon.
- Fixture development sample (campus pilot) lives in `lib/adapt/fixture.ts` once the fixture track lands—see `spec/spec-01-initial_scaffold/05-client-port.md`. Seeded bad adaptation: “All members arrive at 8:30 AM.” Warning: “The time appears to be attached to the wrong group.”

## Forbidden shortcuts

Do not:

- hardcode campus-pilot or other sample source copy inside UI components;
- add a second adaptation path beside `lib/adapt`;
- collapse Fidelity Guard layers into one opaque check;
- invent a preference shape only the fixture understands;
- add OCR, PDF, auth, RAG, diagnosis, or dashboards as demo chrome;
- put loose notes, code, or screenshots directly in `spec/` (use a numbered folder).

## Parallel-track ownership map

Wave 0 finished the contracts and shell. Later agents do not edit Wave 0-owned files unless fixing a compile break they introduced while respecting the map.

| Track | Owns (only) | Spec files |
| --- | --- | --- |
| **Wave 0 (done)** | `docs/AGENTS.md`, `docs/README.md`, root pointers, `spec/`, `package.json` / tooling, `app/layout.tsx`, `app/globals.css`, `lib/domain/`, `lib/adapt/port.ts`, `lib/adapt/index.ts`, `lib/storage/preferences.ts`, `components/sindi/`, placeholder routes | all of `spec-01` as contracts |
| **Onboarding** | `components/onboarding/`, `app/page.tsx` | `01-onboarding.md` |
| **Reading** | `components/read/`, `app/read/` | `02-reading-workspace.md`, `03-meaning-check.md` |
| **Fidelity** | `lib/fidelity/`, `evals/` | `06-fidelity.md` |
| **Fixture + todo** | `lib/adapt/fixture.ts`, `app/todo/` | `05-client-port.md`, `09-backend-todo.md` |
| **Extension** | `extension/` | `07-extension.md` |

Shared behavior comes from Wave 0 ports (`adapt()`, `PreferenceStore`, domain Zod types, Sindi’s `state` prop). A missing dependency is a row on `/todo`, not an edit to another track’s files or to `package.json` unless Wave 0 explicitly left that install out.

If your task names one track, stop at that directory. Do not open sibling track directories for requirements unless `spec/AGENTS.md` says the phase depends on an earlier one.

## Ports and seams

- **Adapt:** `lib/adapt/port.ts` defines `adapt(input)`. `lib/adapt/index.ts` is the only selector and re-exports `./http`. `http.ts` posts to `/api/adapt` and falls back to the fixture. Request/response stay section-17 domain types.
- **Preferences:** `lib/storage/preferences.ts` exposes `PreferenceStore`. Web uses `localStorage`. Extension track owns `chrome.storage` under `extension/`.
- **Sindi:** `components/sindi/` is presentational only (`state`, one short line, SVG lantern). No screen logic.
- **Fidelity:** four layers (deterministic, relationship, NLI slot, coverage). UI calls one pipeline function when the fidelity track lands.

## Spec workflow

- Read `spec/AGENTS.md` before adding any spec.
- New phase = one index row in `spec/AGENTS.md`, then a new `spec-NN-short_name/` folder.
- Implementers use the phase folder’s files as the build contract. Acceptance lives in `08-acceptance.md` for this scaffold.

## Out of scope for agents unless a later phase says otherwise

Extra server routes, Gemini calls with no key in the environment, Supabase, a hosted DeBERTa service, repair regeneration, account sync, OCR, healthcare, multi-agent stacks, and product-line forks (Learn / Work / Org / Public as separate apps).

## Branches

- **`main`** = production (GitHub default). **`dev`** = integration.
- Cut feature branches from `dev` as `feat/short-name`. Open PRs into `dev`, not `main`.
- Promote `dev` → `main` for production. Flow: `feat/*` → `dev` → `main`.

## AI workflow

Long-form durable workflow for later agents and humans: [`docs/ai-workflow.md`](./ai-workflow.md). Keep this file as the short rules; do not duplicate the long guide at the repo root.

### How a later agent starts

1. Open **`spec/AGENTS.md`** first for any phase/spec work (manager rules + index).
2. Open the active phase folder (`spec/spec-01-initial_scaffold/` today).
3. Find your track in the ownership map above; edit only those directories.
4. Read [`docs/ai-workflow.md`](./ai-workflow.md) for ports, hooks, and the development sample.

### Track ownership (pointer)

Wave 0 owns guides, `spec/` manager + phase contracts, shell, `lib/domain/`, `lib/adapt/port.ts` + `index.ts`, `lib/storage/preferences.ts`, `components/sindi/`, placeholders. Wave 1 tracks: onboarding, reading, fidelity, fixture + todo, extension — directories listed in the map above. Parallel tracks must not edit each other’s directories.

### Hooks

Project Cursor hooks: [`.cursor/hooks.json`](../.cursor/hooks.json) and scripts under [`.cursor/hooks/`](../.cursor/hooks/).

- `sessionStart` points the session at `docs/AGENTS.md`, `spec/AGENTS.md`, and `docs/ai-workflow.md`.
- `preToolUse` denies only clear violations (loose `spec/` files, `app/api`, extra `lib/adapt` modules, direct `fixture` imports).
- `postToolUse` adds non-blocking nudges near `spec/` / `lib/adapt/`. Hooks fail open and do not try to block every shell or track edit.
- `beforeShellExecution` (`no-ai-attribution.js`) is **Cursor-only**: denies only `git commit` messages with tool attribution trailers; fails open otherwise and never blocks ordinary file edits. The attribution rule for all agents lives under **No AI attribution** below (and in `docs/ai-workflow.md`), not only in hooks.

### Development sample

Campus-pilot notice (fixture track / `lib/adapt/fixture.ts`): orientation seat by Thursday 5 PM; mentors Friday 8:30 AM; other members 9:00 AM; late confirmations only with written approval. Seeded failure: “All members arrive at 8:30 AM.” Full text in `spec/spec-01-initial_scaffold/05-client-port.md` and `docs/ai-workflow.md`.

### No AI attribution

Applies to **every** coding agent (Cursor, Claude Code, GitHub Copilot, Codex, and others). Canonical text is here and in [`docs/ai-workflow.md`](./ai-workflow.md)—do not treat Cursor hooks as the only source of this rule.

Commits, pull requests, docs, and code comments must not attribute work to any AI or tool (Cursor, Claude, Copilot, Codex, Grok, ChatGPT, or any assistant). No `Co-authored-by`, `Assisted-by`, `Generated-by`, or `Signed-off-by` trailers for tools. No “generated by AI” comments. Commit messages are normal human messages.

Thin entry points: root [`CLAUDE.md`](../CLAUDE.md) and [`.github/copilot-instructions.md`](../.github/copilot-instructions.md) point at this guide. Inside Cursor only, `beforeShellExecution` (`no-ai-attribution.js`) may deny `git commit` messages that contain those tool trailers; it fails open otherwise and never blocks ordinary file edits. Other agents never see Cursor hooks and must follow this rule from the docs.
