# 01 — Gemini HTTP adapt

## Status

**Planned, not started.** Do not implement this phase until the team explicitly turns the model on. Default runtime stays the in-browser fixture.

## Purpose

Replace the fixture-backed `adapt()` implementation with a live Gemini call behind the same client port, without changing UI callers or adding an API route.

## Ownership (when started)

| File | Action |
| --- | --- |
| `lib/adapt/http.ts` | **Add** — Gemini extraction + adaptation (AI SDK / gemini-3.8-flash when wired) |
| `lib/adapt/index.ts` | **Switch selector** from `./fixture` to `./http` |
| `lib/adapt/prompts.ts` | **Reuse** — system/user prompt builders already live here; do not duplicate a long prompt dump in this spec |
| `lib/adapt/port.ts` | Unchanged — `AdaptFn` shape |
| UI / extension | Keep calling `adapt()` via `lib/adapt` only |

## Architecture constraints

- UI keeps calling `adapt()`. Callers never import `http.ts` or `fixture.ts` directly.
- No `app/api` route. Client port stays the integration surface.
- No monorepo split. Single-repo seam under `lib/adapt/`.
- Prompts: point at [`lib/adapt/prompts.ts`](../../lib/adapt/prompts.ts) (`GENERATIVE_SYSTEM_PROMPT`, `VERIFICATION_SYSTEM_PROMPT`, `buildGenerativePrompt`, `buildVerificationPrompt`, `buildRepairPrompt`). Do not paste full prompt text into this folder.

## Must keep

- Campus-pilot checks and the seeded warning behavior from the fixture path remain exercisable (fixture default; or equivalent coverage when the live path is on).
- Request/response field names stay aligned with `lib/domain` and `spec-01` `05-client-port.md`.
- Fidelity Guard / Meaning Check consumer contracts do not fork for a second adapt path.

## Cost warning

A live Gemini call **spends tokens**. Until the team turns the model on, the default remains the in-browser fixture selected from `lib/adapt/index.ts`.

## Acceptance checks (when implementation is authorized)

- [ ] `lib/adapt/http.ts` exists and satisfies `AdaptFn`.
- [ ] `lib/adapt/index.ts` selects `./http` only after explicit team go-ahead; otherwise fixture remains default.
- [ ] UI and extension still import only from `lib/adapt` (index).
- [ ] Prompts are imported from `lib/adapt/prompts.ts`, not redefined elsewhere.
- [ ] No new `app/api` adapt route.
- [ ] Campus-pilot / seeded warning behavior remains available for offline and CI checks.
- [ ] Live path documents that each call spends tokens.

## Out of scope

- Implementing `http.ts` or switching the selector in this documentation-only phase.
- Adding `app/api`, a monorepo, or a second public adapt entrypoint.
- Duplicating prompt bodies into the spec folder.
- DeBERTa NLI, repair regeneration beyond reusing existing prompt builders, preference sync, or saved source content (see `spec-01` `09-backend-todo.md`).
