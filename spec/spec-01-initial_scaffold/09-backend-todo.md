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
| DeBERTa NLI — **do not build yet** (remote model) | `lib/fidelity` NLI layer (today: neutral stub). Prior feat used non-blocking HF `cross-encoder/nli-deberta-v3-base`; wire that into `runNliSlot` without a second adapt path. | `06-fidelity.md` |
| Repair regeneration — **do not build yet** (needs generative model) | Pipeline after `repair_required`; generative repair via Gemini (`buildRepairPrompt` in `lib/adapt/prompts.ts`) | `06-fidelity.md`, `05-client-port.md` |
| Preference sync across web and extension | New `PreferenceStore` implementation; accounts | `01-onboarding.md`, `07-extension.md` |
| Saved source content | Explicit user save on store boundary; off by default; do not silently write sample source text to a content table | storage + future backend |

Eval corpus growth (20 → 50) is owned by the **evals / fidelity track**, not this backend checklist.

## Rules for implementers

- Do not pretend these are connected in the consumer UI.
- Fixture NLI field stays neutral with “Semantic check not connected” until wired.
- Deterministic/relationship checks still return real statuses in-browser.

## Acceptance checks

- [ ] `/todo` lists only unbuilt server work (not feature marketing).
- [ ] Each row names the function/file and spec.
- [ ] Footer (when reading track adds chrome) can link “Backend not connected” → `/todo`.

## Out of scope

- Implementing the backend in this scaffold phase.
- Expanding `/todo` into a full project-management app.
