# 09 — Backend todo

## Purpose

Status of the server plugs. The same list is on `/todo` (link: “What is connected”). For the team—not part of the reading demo.

## Ownership

- Spec list: this file
- Page UI: fixture track (`app/todo/`)

## Rows

Each row: state, and where it lives.

| Item | State | Where |
| --- | --- | --- |
| Hosted model over `adapt()` | **On.** Gemini, then the OpenAI-compatible gateway, then the fixture. The flagged example always uses the fixture. | `app/api/adapt/route.ts`, `spec-02-gemini-adapt` |
| Repair retry | **On** when a model key is set and the guard returns `repair_required`. | `app/api/adapt/model.ts` |
| On-device preferences and explicit save | **On.** | `lib/storage/preferences.ts`, Read **Save on this device** |
| Gemini as the first provider | **Off.** Wired. Empty `GEMINI_API_KEY` skips it. | `spec-02-gemini-adapt` |
| DeBERTa NLI | **Off** on the host. Unset `NLI_ENDPOINT` reports Not run. Local server: `nli-service/`. | `06-fidelity.md` |
| Cloud account | **On.** Optional. Preferences and saved titles only. Source text is not stored. | `lib/auth/supabase.ts` |

Eval corpus growth (20 → 50) is owned by the **evals / fidelity track**, not this backend checklist.

## Rules for implementers

- Say On only for a path the production app actually calls.
- Unset NLI stays “Semantic check not connected” and the UI shows Not run.
- Deterministic and relationship checks still return real statuses.

## Acceptance checks

- [x] `/todo` lists On and Off. It does not call a live path unbuilt.
- [x] Each row names the function/file and spec.
- [x] Onboarding and the reading header link “What is connected” → `/todo`.

## Out of scope

- Turning on Gemini, NLI, or the cloud account without the matching env vars.
- Expanding `/todo` into a full project-management app.
