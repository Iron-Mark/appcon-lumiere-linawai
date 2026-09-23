# 09 — Backend todo

## Purpose

Named plugs for unbuilt server work. Same list appears on the in-app `/todo` page (calm visual system; footer link “Backend not connected”). For the team—not part of the user demo path.

## Ownership

- Spec list: this file
- Page UI: fixture track (`app/todo/`)

## Rows

Each row: what, which file/function to replace or add, which spec.

| Item | Replace / add | Spec |
| --- | --- | --- |
| Gemini extraction + adaptation over `adapt()` - **wired, off unless a key is set** (spends tokens) | `app/api/adapt/route.ts` tries `app/api/adapt/model.ts` only when `GEMINI_API_KEY` or the OpenAI-compatible gateway env is set. Otherwise, and on model failure, it runs `lib/adapt/fixture.ts`. The seeded failure example never uses the model. | `05-client-port.md`, `spec-02-gemini-adapt` |
| DeBERTa NLI — **wired, off unless `NLI_ENDPOINT` is set** | `runNliSlot` stays neutral with “Semantic check not connected” when unset. Optional local server: `nli-service/`. Not required for the demo. | `06-fidelity.md` |
| Repair regeneration — **one retry only when a model key is already set** | `app/api/adapt/model.ts` calls `buildRepairPrompt` after `repair_required`. The fixture demo never calls it. | `06-fidelity.md`, `05-client-port.md` |
| Preference sync across web and extension | Same-browser `postMessage` bridge in `lib/storage/preferences-sync.ts` and `extension/src/content/prefs-sync.ts`. Accounts skipped: no auth env. | `01-onboarding.md`, `07-extension.md` |
| Saved source content | Reading workspace **Save on this device**. Samples stay unsaved until that click. No content table. | storage + future backend |

Eval corpus growth (20 → 50) is owned by the **evals / fidelity track**, not this backend checklist.

## Rules for implementers

- Do not pretend these are connected in the consumer UI.
- Fixture NLI field stays neutral with “Semantic check not connected” until wired.
- Deterministic/relationship checks still return real statuses in-browser.

## Acceptance checks

- [x] `/todo` lists only unbuilt server work (not feature marketing).
- [x] Each row names the function/file and spec.
- [x] Footer (when reading track adds chrome) can link “Backend not connected” → `/todo`. The link is on onboarding and on the reading header.

## Out of scope

- Implementing the backend in this scaffold phase.
- Expanding `/todo` into a full project-management app.
