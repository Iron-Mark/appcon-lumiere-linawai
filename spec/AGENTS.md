# Spec manager

This file is the **only** file that may live directly in `spec/`. Everything else belongs in a numbered phase folder.

## Rules

1. **Read this file** before creating or editing anything under `spec/`.
2. **Phase folders only:** name them `spec-NN-short_name` (two-digit number, underscore-separated short name). Example: `spec-01-initial_scaffold`.
3. **No loose content in `spec/`:** no notes, drafts, code, screenshots, or copies of `docs/`. If it is not this manager file, it belongs inside one numbered folder.
4. **Do not rename** an earlier phase when a later one starts. Add `spec-02-...` beside `spec-01-...`.
5. **New phase workflow:** add one row to the index below (with status), then create the folder. Status is `active`, `done`, or `superseded`.
6. **Implementers** open only the folder for their assigned phase. Do not browse sibling folders for requirements unless this index says the phase depends on an earlier one.
7. **Canon stays outside:** [`docs/LINAW_AI_INITIAL-DRAFT_PROJECT_CONTEXT.md`](../docs/LINAW_AI_INITIAL-DRAFT_PROJECT_CONTEXT.md) is the product source of truth. A spec folder says what that phase builds; it does not replace the canon and it is not a scratch pad.
8. **If code and a spec disagree,** the spec wins until someone edits the spec.

## Index

| Folder | Status | Depends on | Summary |
| --- | --- | --- | --- |
| [`spec-01-initial_scaffold`](./spec-01-initial_scaffold/) | active | — | Contracts, shell, and MVP build tracks for onboarding, reading, fidelity, fixture, and extension |
| [`spec-02-gemini-adapt`](./spec-02-gemini-adapt/) | wired, off by default | `spec-01-initial_scaffold` | `POST /api/adapt` can call Gemini when a key is set. With no key, the route stays on the fixture |

## How to use a phase folder

Each phase folder has a `README.md` that lists its files. Spec files share a shape: purpose, user-visible behavior, states, copy rules, acceptance checks, and explicit out-of-scope. Build against those files and the Wave 0 ports described in [`docs/AGENTS.md`](../docs/AGENTS.md).

## AI workflow pointer

Durable agent/human workflow (track ownership, `adapt()` seam, campus-pilot sample, Cursor hooks): [`docs/ai-workflow.md`](../docs/ai-workflow.md). Short agent rules remain in [`docs/AGENTS.md`](../docs/AGENTS.md). This manager file’s rules above still win for anything under `spec/`.
