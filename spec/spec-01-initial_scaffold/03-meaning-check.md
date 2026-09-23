# 03 — Meaning Check

## Purpose

User-facing verification UI: a right rail of checks with source evidence, plus inline marks on critical phrases in the adapted note. Powered by Meaning Map + Fidelity Guard results carried on the adapt response (and fidelity pipeline when present).

## Ownership

Same track as reading: `components/read/` (rail + marks) and `app/read/`.

## User-visible behavior

Pattern (Grammarly document + review panel inspired):

### Empty rail (before results)

- One calm line that checks will appear here.
- Sindi may appear in the empty state.
- **No fake score**, no placeholder “100 overall,” no prompt catalog.

### After results

- Rail lists check cards: claim, status (`pass` | `warning` | `repair_required`), evidence, reason.
- Critical phrases in the adapted note become **marks**.
- Choosing a mark focuses its rail card and the matching **source evidence** sentence (highlight together).
- Warning mark + evidence highlight together; Sindi **warning** turns attention toward the flagged claim.
- Pass checks stay quiet; overall pass uses Sindi **pass** and the line “No issue found in these checks.”

### Status language (canonical)

Good:

- “No issue found in these checks.”
- “Important condition may have changed. Review source.”
- “The time appears to be attached to the wrong group.”

Forbidden:

- “100% verified,” “Guaranteed accurate,” “The AI proves this is correct.”

## States

| State | Behavior |
| --- | --- |
| empty | empty-rail copy; no fake metrics |
| loading | optional quiet working; do not invent checks |
| pass | quiet list / summary; Sindi pass |
| warning | amber (token) + icon + words; linked highlights |
| repair_required | treat as blocking caution for MVP UI (same family as warning; do not claim auto-repair unless backend exists) |

## Data

Render `checks[]` and `overallStatus` from domain types (`lib/domain`). Evidence strings come from the Meaning Map / check objects—do not invent unrelated sentences in the UI.

## Acceptance checks

- [ ] Empty rail has no score chip and no prompt list.
- [ ] After results, at least one mark ↔ rail card ↔ evidence linkage works for the seeded warning case once fixture + fidelity land.
- [ ] Warning uses amber + icon + words; contrast remains readable.
- [ ] Keyboard focus order matches visual order for marks and cards.
- [ ] Copy never claims guarantee/100% verified.

## Out of scope

- Implementing NLI or deterministic engines (fidelity track).
- Showing raw model JSON dumps as the primary consumer UI.
- Grammarly-style generative rewrite prompt catalog.
- Overall document score chips.
