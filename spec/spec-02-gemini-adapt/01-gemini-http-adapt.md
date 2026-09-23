# 01 — Gemini HTTP adapt

## Status

**Wired, off unless a key is set.** Default runtime is the fixture, on the server and as the in-browser fallback. Do not commit a key.

## Purpose

Call Gemini from `POST /api/adapt` only when `GEMINI_API_KEY` is set, behind the same `adapt()` port. An OpenAI-compatible gateway is the second provider. If neither is configured, or the model call fails, the route runs the fixture.

## Ownership

| File | Action |
| --- | --- |
| `app/api/adapt/route.ts` | **Exists.** Fixture by default. Model only when `modelConfigured()` is true. Seeded failure source always uses the fixture. |
| `app/api/adapt/model.ts` | **Exists.** Gemini, then the gateway. No source text in logs. Keys stay in the process. |
| `lib/adapt/http.ts` | **Exists.** Client posts to `/api/adapt` and falls back to the fixture. |
| `lib/adapt/index.ts` | Re-exports `adapt()` from `./http`. |
| `lib/adapt/prompts.ts` | Prompt builders. Do not paste a second copy into this spec. |
| `lib/adapt/port.ts` | Unchanged `AdaptFn` shape. |
| UI / extension | Keep calling `adapt()` via `lib/adapt` only. The reading screen says when text will be sent to a model. |

## Architecture constraints

- UI keeps calling `adapt()`. Callers never import `http.ts`, `fixture.ts`, or `model.ts` directly.
- No API route besides `app/api/adapt`.
- No monorepo split.
- Prompts: point at [`lib/adapt/prompts.ts`](../../lib/adapt/prompts.ts). Do not paste full prompt text into this folder.

## Must keep

- Campus-pilot checks and the seeded warning behavior from the fixture path remain exercisable (fixture default; or equivalent coverage when the live path is on).
- Request/response field names stay aligned with `lib/domain` and `spec-01` `05-client-port.md`.
- Fidelity Guard / Meaning Check consumer contracts do not fork for a second adapt path.

## Cost warning

A live Gemini call spends tokens. With an empty key, `/api/adapt` does not call a model.

## Acceptance checks (when implementation is authorized)

- [x] `lib/adapt/http.ts` posts to `/api/adapt` and falls back to the fixture.
- [x] With no key, the route stays on the fixture.
- [x] UI and extension import `adapt()` from `lib/adapt` (index).
- [x] Prompts are imported from `lib/adapt/prompts.ts`, not redefined in the route.
- [x] The only adapt route is `app/api/adapt`.
- [x] The seeded warning example always uses the fixture.
- [x] The reading screen says when text will be sent to a model. Each live call spends tokens.

## Out of scope

- Putting a model key in git, or calling Gemini when the key is empty.
- Adding `app/api`, a monorepo, or a second public adapt entrypoint.
- Duplicating prompt bodies into the spec folder.
- DeBERTa NLI, repair regeneration beyond reusing existing prompt builders, preference sync, or saved source content (see `spec-01` `09-backend-todo.md`).
