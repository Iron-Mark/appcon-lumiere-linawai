# Spec 02 — Gemini adapt

**Status: wired, off unless a key is set.** Do not put a key in the repo. A live call spends tokens.

Phase folder for the model path behind `POST /api/adapt`. With no `GEMINI_API_KEY` and no gateway env, the route runs the fixture.

## Spec wins

Until someone edits these files, implement against them. Product canon remains [`docs/LINAW_AI_INITIAL-DRAFT_PROJECT_CONTEXT.md`](../../docs/LINAW_AI_INITIAL-DRAFT_PROJECT_CONTEXT.md). This folder does not rewrite the canon or `spec-01`.

## Files

| File | Purpose |
| --- | --- |
| [`01-gemini-http-adapt.md`](./01-gemini-http-adapt.md) | Route, model helper, and the rule that the fixture stays the default |

## Depends on

[`spec-01-initial_scaffold`](../spec-01-initial_scaffold/) — especially `05-client-port.md` and `09-backend-todo.md`.

## Agent entry

See [`../AGENTS.md`](../AGENTS.md) and [`../../docs/AGENTS.md`](../../docs/AGENTS.md).
