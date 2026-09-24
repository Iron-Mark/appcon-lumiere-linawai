# Spec 04 — Taglish fidelity

**Status: active.** Research implementation plan from 20 live clarifications on the deployed app.

Gemini rewrote the notices. The English-only Meaning Check then warned on two Taglish notes that had kept the facts. This phase makes that check understand Taglish without turning a real drop into a pass.

## Files

| File | Purpose |
| --- | --- |
| [`01-pilot-and-implementation.md`](./01-pilot-and-implementation.md) | The 20-run evidence, what is already in code, and the remaining work |

## Depends on

- [`spec-02-gemini-adapt`](../spec-02-gemini-adapt/): live model path
- [`spec-03-demo-ship`](../spec-03-demo-ship/): production URL
- [`spec-01-initial_scaffold/06-fidelity.md`](../spec-01-initial_scaffold/06-fidelity.md): the four check layers

## Out of this phase

Paid Hugging Face inference, a new model, and hosting `nli-service`. Layer 3 stays optional. This phase is the deterministic check on Taglish wording.
