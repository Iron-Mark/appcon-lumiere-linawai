# Spec 01 — Initial scaffold

Phase folder for the first Linaw MVP slice: contracts, shell, and build tracks.

## Spec wins

Until someone edits these files, implement against them. Product canon remains [`docs/LINAW_AI_INITIAL-DRAFT_PROJECT_CONTEXT.md`](../../docs/LINAW_AI_INITIAL-DRAFT_PROJECT_CONTEXT.md). This folder does not rewrite the canon.

## Files

| File | Purpose |
| --- | --- |
| [`00-overview.md`](./00-overview.md) | Scope, non-negotiables, architecture, visual system |
| [`01-onboarding.md`](./01-onboarding.md) | Four-step preference onboarding |
| [`02-reading-workspace.md`](./02-reading-workspace.md) | Reading view, Listen, Show original |
| [`03-meaning-check.md`](./03-meaning-check.md) | Meaning Check rail and marks |
| [`04-mascot.md`](./04-mascot.md) | Sindi states and copy |
| [`05-client-port.md`](./05-client-port.md) | `adapt()` port, selector, fixture ownership |
| [`06-fidelity.md`](./06-fidelity.md) | Four-layer Fidelity Guard |
| [`07-extension.md`](./07-extension.md) | Manifest V3 companion |
| [`08-acceptance.md`](./08-acceptance.md) | Definition of done for this slice |
| [`09-backend-todo.md`](./09-backend-todo.md) | Unbuilt server plugs |

## Track ownership (Wave 1)

| Track | Directory ownership | Specs |
| --- | --- | --- |
| Onboarding | `components/onboarding/`, `app/page.tsx` | `01-onboarding.md` |
| Reading | `components/read/`, `app/read/` | `02-reading-workspace.md`, `03-meaning-check.md` |
| Fidelity | `lib/fidelity/`, `evals/` | `06-fidelity.md` |
| Fixture + todo | `lib/adapt/fixture.ts`, `app/todo/` | `05-client-port.md`, `09-backend-todo.md` |
| Extension | `extension/` | `07-extension.md` |

Wave 0 already shipped domain types, ports, tokens, Sindi API, and placeholder routes. Tracks replace only their owned pages/directories.

## Agent entry

See [`../AGENTS.md`](../AGENTS.md) and [`../../docs/AGENTS.md`](../../docs/AGENTS.md).
