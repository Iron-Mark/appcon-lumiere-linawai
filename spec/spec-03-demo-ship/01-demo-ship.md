# Demo ship

> **For agentic workers:** Steps use checkbox syntax for tracking.

**Goal:** A judge opens a production URL and clarifies a real notice with a live model. Provenance says a language model. A fixture note on the campus example or on pasted text fails the submission.

**Architecture:** `POST /api/adapt` tries Gemini, then an OpenAI-compatible gateway, then the fixture. `export const maxDuration = 90` and `export const runtime = "nodejs"` let the 75s gateway abort finish. The extension calls `LINAW_APP_ORIGINS`, production first, then localhost.

**Tech stack:** Next.js 15 route handler, `fetch` providers, Vercel production, Chrome MV3 companion.

## Global constraints

- One `package.json`. UI calls `adapt()` from `lib/adapt` only.
- On-screen verb is Clarify. Never "verified" or "guaranteed."
- Pitch says "hosted language model," not a vendor name.
- No second API route. No second adapt path.
- Do not build repair regeneration, accounts, MCP, format-as-preference, DeBERTa fine-tune, or OCR.
- No AI attribution in commits, docs, or comments.
- Do not commit `.env.local` or keys. Do not log source text.
- Seeded source "All members arrive at 8:30 AM" stays on the fixture. Every other notice on the production URL must be `adapter: "model"`.

**Production URL:** https://appcon-lumiere-linawai.vercel.app

## Task 1 — Route can finish a model call

**Files:** `app/api/adapt/route.ts`

- [x] `export const maxDuration = 90` and `export const runtime = "nodejs"`.
- [x] `npm run typecheck`, `npm test`, `npm run build`.
- [x] Local `GET /api/adapt` returns `adapter: "model"`.
- [x] POST a unique notice returns header `model:gemini` or `model:openai-compatible`.
- [x] POST the seeded line returns `x-linaw-adapter: fixture`.

## Task 2 — Production deploy

- [x] `npx vercel --yes --prod` with `LLM_API_BASE`, `LLM_API_KEY`, `LLM_MODEL` on the production environment. `GEMINI_*` only if set locally.
- [x] Prove `GET` and a unique `POST` on the production origin. Seeded POST stays fixture.
- [x] Prepend the production origin in `extension/src/linaw-origin.ts`. Point `WEB_APP_READ_URL` at `{origin}/read`. Rebuild the extension.

## Task 2b — Golden path

Ran once on https://appcon-lumiere-linawai.vercel.app :

1. `/onboarding` — Key Points, Plain.
2. `/read` — Use an example → Clarify. Provenance must say a language model.
3. At a glance — open the deadline tile.
4. Try a flagged example — warning includes "wrong group." This button stays on the fixture on purpose.
5. Listen — one utterance starts.

If step 2 shows the offline adapter, stop. That run is not submittable.

## Task 3 — Coverage on Full detail

Only after Tasks 1–2 pass.

**Files:** `lib/fidelity/coverage.ts`, `lib/fidelity/coverage.test.ts`

- [x] Full detail uses the same high-priority retention loop as Key Points.
- [x] A deadline missing from `adaptedText` warns with `REASON_DEADLINE_REVIEW`.

## Out of scope

Extra eval notices, repair, accounts, MCP, a second route, vendor names on slides.
