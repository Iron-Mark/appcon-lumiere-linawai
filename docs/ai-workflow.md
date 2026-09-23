# Linaw AI — durable AI development workflow

This document is the long-form workflow for coding agents and human developers. Short rules live in [`AGENTS.md`](./AGENTS.md). Spec folder rules live in [`../spec/AGENTS.md`](../spec/AGENTS.md). Product decisions live in [`LINAW_AI_INITIAL-DRAFT_PROJECT_CONTEXT.md`](./LINAW_AI_INITIAL-DRAFT_PROJECT_CONTEXT.md) (canon — do not rewrite it).

## Why this exists

Linaw is built as **one Next.js app** with **directory-owned parallel tracks**. Later agents should not need this chat history. Start from the guides, open only your track, and call the shared ports.

## Session start (every agent)

1. Read [`docs/AGENTS.md`](./AGENTS.md).
2. Read [`spec/AGENTS.md`](../spec/AGENTS.md) before any work under `spec/`.
3. Open the **active** phase folder from the spec index (currently [`spec/spec-01-initial_scaffold/`](../spec/spec-01-initial_scaffold/)).
4. Find your **track** in the ownership map in `docs/AGENTS.md`. Edit only that track’s directories.
5. Prefer the phase’s acceptance file (`08-acceptance.md` for this scaffold) over inventing demo chrome.

Root [`AGENTS.md`](../AGENTS.md), [`CLAUDE.md`](../CLAUDE.md), [`.github/copilot-instructions.md`](../.github/copilot-instructions.md), and [`README.md`](../README.md) are thin pointers — do not duplicate this workflow at the repo root.

## Product facts for this scaffold

| Fact | Rule |
| --- | --- |
| Repo shape | Single repo, one `package.json`. No monorepo, no `apps/`, no `packages/`. |
| Backend | The only server route is `POST /api/adapt` (`app/api/adapt/route.ts`, helper `model.ts`). Do not add other `app/api` routes. |
| Adaptation | UI calls `adapt()` from `lib/adapt`. `index.ts` re-exports `http.ts`. `http.ts` posts to `/api/adapt` and falls back to the in-browser fixture. The route tries Gemini, then the OpenAI-compatible gateway, then `fixture.ts`. No key means the fixture. |
| Spec layout | Only `spec/AGENTS.md` may sit directly in `spec/`. Phases are `spec-NN-short_name/`. |
| Preferences | Use preference language (Key Points, Plain Language, Listen, Auto-Clarify). Never diagnose the person. Auto-Clarify is explicit opt-in. The on-screen verb is Clarify. |
| Verification copy | Cautious. Never “guaranteed,” “100% verified,” or “the AI proves this is correct.” |

## Development sample (campus pilot)

This is the **development sample**, not a retired live-event script. Fixture track owns the body in `lib/adapt/fixture.ts` (see [`05-client-port.md`](../spec/spec-01-initial_scaffold/05-client-port.md)).

**Source:**

> Members of the Linaw campus pilot must confirm their orientation seat by Thursday at 5 PM. Mentors should arrive Friday at 8:30 AM. Other members should arrive at 9:00 AM. Late confirmations are accepted only with written approval from the program coordinator.

**Seeded bad adaptation:** `All members arrive at 8:30 AM.`

**Warning line:** “The time appears to be attached to the wrong group.”

Do **not** hardcode this copy inside onboarding/reading UI components. Pass source into `adapt()`. `http.ts` posts to `/api/adapt`; the fixture answers when no model key is set.

Default profile for exercising the path: Key Points, Plain Language, Read.

## Parallel-track ownership

Wave 0 shipped contracts and shell. Later agents do **not** rewrite Wave 0-owned implementations unless fixing a compile break they introduced.

| Track | Owns (only) | Spec files |
| --- | --- | --- |
| **Wave 0 (done)** | Guides listed in `docs/AGENTS.md`, `spec/`, shell tooling, `app/layout.tsx`, `app/globals.css`, `lib/domain/`, `lib/adapt/port.ts`, `lib/adapt/index.ts`, `lib/storage/preferences.ts`, `components/sindi/`, placeholder routes | contracts in `spec-01` |
| **Onboarding** | `components/onboarding/`, `app/onboarding/` | `01-onboarding.md` |
| **Reading** | `components/read/`, `app/read/` | `02-reading-workspace.md`, `03-meaning-check.md` |
| **Fidelity** | `lib/fidelity/`, `evals/` | `06-fidelity.md` |
| **Fixture + todo** | `lib/adapt/fixture.ts`, `app/todo/` | `05-client-port.md`, `09-backend-todo.md` |
| **Extension** | `extension/` | `07-extension.md` |

**Rules:**

- If your task names one track, stop at that directory.
- A missing dependency is a `/todo` row (or a note), not an edit to another track’s files or to `package.json` unless Wave 0 left that install out.
- Fixture track must **not** edit `lib/adapt/index.ts`. The selector re-exports `http.ts`.
- `/` is the public landing page. Onboarding is `/onboarding`.

## Ports and seams

```text
UI / extension
    → adapt() via lib/adapt (index.ts re-exports http.ts)
        → POST /api/adapt (Gemini, then gateway, then fixture.ts)
        → in-browser fixture if the route is unreachable
    → PreferenceStore via lib/storage/preferences.ts
Sindi (components/sindi) — presentational only (state + one line + SVG)
Fidelity — four layers; UI calls one pipeline function
```

Forbidden shortcuts:

- second adaptation path beside `lib/adapt`;
- importing `fixture.ts` from UI;
- branching on “demo mode”;
- collapsing Fidelity Guard layers into one opaque check;
- inventing a preference shape only the fixture understands.

## Branches

| Branch | Role |
| --- | --- |
| `main` | Production. Default on GitHub. |
| `dev` | Integration. Features merge here; promote `dev` → `main` for production. |
| `feat/short-name` | Feature work. Cut from `dev`, open PRs into `dev` only. |

Flow: `feat/*` → `dev` → `main`. Do not open feature PRs straight to `main`.

## Spec workflow

1. Read `spec/AGENTS.md`.
2. New phase → add one index row, then create `spec-NN-short_name/`.
3. Implement against the phase folder; if code and spec disagree, **spec wins** until someone edits the spec.
4. Spec does not replace the project-context canon.

## Cursor hooks (project)

Hooks live under [`.cursor/`](../.cursor/) and are checked into the repo.

| File | Event | Role |
| --- | --- | --- |
| `.cursor/hooks.json` | (registry) | Wires project hooks |
| `.cursor/hooks/session-start.js` | `sessionStart` | Injects bootstrap context pointing at `docs/AGENTS.md`, `spec/AGENTS.md`, and this file |
| `.cursor/hooks/guard-policy.js` | `preToolUse` | **Denies** only clear violations: loose `spec/` files, `app/api` routes, extra `lib/adapt/*` modules, direct `fixture` imports from outside the selector |
| `.cursor/hooks/nudge-policy.js` | `postToolUse` | **Non-blocking** reminders after writes near `spec/` or `lib/adapt/` |
| `.cursor/hooks/no-ai-attribution.js` | `beforeShellExecution` | **Cursor-only:** denies only `git commit` messages with tool attribution trailers or “generated by AI” phrasing; fails open otherwise. Does not replace the docs rule for Claude, Copilot, or other agents |

Design choice: prefer **guidance + targeted denies**. Hooks fail open on script errors so parallel agents (including shell work) are not blocked by every edit. They do **not** try to enforce full track ownership on every file write — that map lives in `docs/AGENTS.md` for humans and agents to follow. The attribution hook never gates writes to `app/`, `lib/`, or `components/`. The no-AI-attribution rule itself lives in the docs for all agents; hooks are Cursor-only reinforcement.

Reload: Cursor watches `hooks.json`. If hooks do not load, check the Hooks settings tab / Hooks output channel, or restart Cursor.

## No AI attribution

Applies to **every** coding agent (Cursor, Claude Code, GitHub Copilot, Codex, and others). This section and [`docs/AGENTS.md`](./AGENTS.md) are canonical; Cursor hooks are an optional extra check inside Cursor only—other agents never see them.

Commits, pull requests, docs, and code comments must not attribute work to any AI or tool (Cursor, Claude, Copilot, Codex, Grok, ChatGPT, or any assistant). No `Co-authored-by`, `Assisted-by`, `Generated-by`, or `Signed-off-by` trailers for tools. No “generated by AI” comments. Commit messages are normal human messages.

Thin entry points that load for other tools: root [`CLAUDE.md`](../CLAUDE.md) (Claude Code) and [`.github/copilot-instructions.md`](../.github/copilot-instructions.md) (GitHub Copilot). Each only points at `docs/AGENTS.md` and restates the attribution ban briefly.

## Suggested build loop for a track agent

1. Read your track’s spec file(s) in `spec/spec-01-initial_scaffold/`.
2. Confirm Wave 0 ports compile (`lib/domain`, `lib/adapt`, preferences, Sindi).
3. Implement only under your owned paths.
4. Call `adapt()` and `PreferenceStore`; do not reach into another track.
5. Match acceptance checks in `08-acceptance.md` for your slice of behavior.
6. Leave unbuilt server work as `/todo` rows, not fake UI.

## Out of scope unless a later phase says otherwise

Do not add extra server routes, a second adaptation path, OCR, healthcare flows, multi-agent product forks, or separate Learn / Work / Org / Public apps.

These already exist and stay as they are:

- `POST /api/adapt` calls Gemini only when `GEMINI_API_KEY` is set, then the gateway, then the fixture. Leave the key unset unless the team asks.
- The semantic check stays off unless `NLI_ENDPOINT` is set.
- Optional account sync uses Supabase when `NEXT_PUBLIC_SUPABASE_URL` and the publishable key are set. It stores preferences and saved titles, never source text.
- One repair retry runs after `repair_required` only when a model key is set.

## Where to look next

- Human setup and run instructions: [`docs/README.md`](./README.md)
- Agent short rules: [`docs/AGENTS.md`](./AGENTS.md)
- Spec manager: [`spec/AGENTS.md`](../spec/AGENTS.md)
- Current phase: [`spec/spec-01-initial_scaffold/README.md`](../spec/spec-01-initial_scaffold/README.md)
