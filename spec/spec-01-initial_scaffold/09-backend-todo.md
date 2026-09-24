# 09 — Backend todo

## Purpose

Status of what the hosted app runs. The same list is on `/todo` (link: “What Linaw runs”).

## Ownership

- Spec list: this file
- Page UI: fixture track (`app/todo/`)

## Rows

Each row: state, and where it lives.

| Item | State | Where |
| --- | --- | --- |
| Hosted model over `adapt()` | **On.** Gemini first, then the OpenAI-compatible gateway, then the fixture. `GET /api/adapt` lists `gemini`, then `openai-compatible`. The flagged example always uses the fixture. | `app/api/adapt/route.ts`, `spec-02-gemini-adapt` |
| Repair retry | **On** when a model key is set and the guard returns `repair_required`. The flagged example never calls it. | `app/api/adapt/model.ts` |
| On-device preferences and explicit save | **On.** Preferences stay on the device unless cloud sign-in is configured. A source is stored only after Save on this device. | `lib/storage/preferences.ts` |
| DeBERTa NLI | **On** for the hosted app. `NLI_ENDPOINT` on Vercel production is `https://linaw-nli.onrender.com/predict`. A failed call, or one that exceeds 4 seconds, reports Not run. | `06-fidelity.md`, `lib/fidelity/nli.ts` |
| Cloud account | **On.** Optional. Preferences and saved titles only. Source text is not stored. | `lib/auth/supabase.ts` |

Eval corpus growth (20 → 50) is owned by the **evals / fidelity track**, not this backend checklist.

## Rules for implementers

- Say On only for a path the production app actually calls.
- A failed or unset NLI call stays “Semantic check not connected” and the UI shows Not run.
- Deterministic and relationship checks still return real statuses.

## Acceptance checks

- [x] `/todo` lists what production calls. It does not mark a missing path as On.
- [x] Each row names the function/file and spec.
- [x] Onboarding and the reading header link “What Linaw runs” → `/todo`.

## Out of scope

- Claiming a provider is On when the production env var is unset.
- Expanding `/todo` into a full project-management app.
