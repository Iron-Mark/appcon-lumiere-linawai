# 06 — Fidelity Guard

## Purpose

Hybrid verification pipeline matching canon §12. UI calls **one** function; layers stay separate so NLI and repair plug in beside them.

## Ownership

- `lib/fidelity/` — pipeline implementation
- `evals/` — dataset format from canon §14 (gold Meaning Map + seeded corruptions)

## Layers

| Layer | Job | MVP note |
| --- | --- | --- |
| 1 Deterministic | Exact/normalized compare: dates, times, numbers, names/entities, units, negation, condition/exception markers, **must vs may** | Must work offline (`lib/fidelity/deterministic.ts`) |
| 2 Relationship | Values stay attached to the correct actor/action (e.g. 8:30 AM must stay with mentors, not “all members”) | Must catch seeded corruption |
| 3 NLI slot | Entailment / contradiction / neutral vs evidence | Return **neutral** + “Semantic check not connected” until model wired |
| 4 Coverage | For Key Points: critical facts retained, intentionally omitted, or flagged | Enforce high priority on conditions, deadlines, exceptions, prohibitions |

## Pipeline API

Export one function the reading UI / adapt path can call (exact name may be `runFidelityGuard` or similar) that accepts source, adapted text, meaning map, preferences and returns `checks[]` + `overallStatus` using domain types.

Do not collapse layers into a single opaque boolean.

## Evals

- Schema: gold Meaning Map + at least one seeded corruption per committed case.
- This slice commits **one source + one corruption** (campus-pilot sample in `05-client-port.md`). Growth to 20 then 50 sources adds files in the same format, not a new harness.
- Corruption types include wrong time, actor/value swap, missing condition, etc. (canon §14). Seeded bad adaptation for the development sample: “All members arrive at 8:30 AM.”

## Copy / status

Statuses: `pass` | `warning` | `repair_required`. User-facing strings stay cautious (see `03-meaning-check.md`).

## Acceptance checks

- [ ] Four layers exist as separable modules or clearly separated steps.
- [ ] Seeded corruption (wrong group/time) fails relationship (or deterministic) and surfaces warning.
- [ ] NLI slot does not fake entailment when disconnected.
- [ ] Eval case files match the documented schema; script or Vitest can run the corruption check.

## Out of scope

- Hosting DeBERTa, training models, claiming custom foundation models.
- Auto repair regeneration (backend todo) unless a pure client stub is explicitly listed—prefer listing on `/todo`.
- Building UI marks (reading track consumes results).
