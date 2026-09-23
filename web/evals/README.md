# Linaw AI — Baseline Fidelity Evaluation Harness

## Purpose

This harness exercises the **real, deployed `/api/adapt` endpoint** end-to-end (Gemini generation →
Gemini verification + auxiliary DeBERTa NLI check, run in parallel → bounded repair when needed) and
reports repeatable, structured evidence about the pipeline's meaning-preservation behavior.

It exists to give us a **baseline** before any Hugging Face fine-tuning work starts, and as a
regression net for the preference-awareness fix in `web/lib/prompts.ts` (`buildVerificationPrompt`
now receives `detailLevel`/`wordingStyle`).

## What this is NOT

- **Not a scientific benchmark.** 8 adversarial fixtures is an engineering regression set, not a
  statistically powered evaluation.
- **Not Hugging Face fine-tuning data.** These cases must never be reused as training/fine-tuning
  examples for the NLI model or any other model. Keep evaluation/gold cases strictly separate from
  future fine-tuning data — if a fine-tuning dataset is built later, source it independently.
- **Not the eventual gold suite.** The product's canonical plan (`docs/LINAW_AI_INITIAL-DRAFT_PROJECT_CONTEXT.md`,
  §14) calls for a manually reviewed gold suite of **at least ~20 source messages** with human-labeled
  critical facts and seeded corruptions. This harness's 8 cases are a much smaller, code-focused
  regression set that exists to catch pipeline-level breakage quickly — they are a starting point, not
  a replacement for that larger effort.
- **Not a claim of correctness.** `/api/adapt` calls generative models. Output wording is never
  asserted exactly. Results are reported as "passed defined checks", "issue detected", or "requires
  review" — never as "100% accurate" or "guaranteed correct". This matches Linaw's own product-language
  rules (never claim guaranteed accuracy to end users).

## Prerequisites

1. Node.js (already installed; this harness runs as plain `.mts` files via Node's native TypeScript
   execution — no `ts-node`/`tsx`/test framework dependency was added).
2. **Start the dev server first**, from `web/`:
   ```bash
   npm run dev
   ```
3. `web/.env.local` must contain a valid `GOOGLE_GENERATIVE_AI_API_KEY` (required — every case calls
   Gemini at least twice). `HUGGINGFACE_API_KEY` is optional; if it is not set, `nli.enabled` will
   correctly report `false`, `nli.status` will correctly report `"disabled"`, and the
   `nli_wiring_canary` case's `expectNLIEnabled: true` / `expectNLIStatus: "ok"` checks will correctly
   FAIL — that is the intended signal that the NLI layer isn't configured, not a bug in the harness.

## `nli.enabled` vs. `nli.status` — why both exist

`/api/adapt`'s auxiliary Hugging Face NLI check (`runNLICheck` in `route.ts`) is intentionally
**non-blocking**: any operational failure (timeout, non-2xx response, network error, malformed
payload) is swallowed and never throws or fails the request. That means `nli.enabled: true` alone
does **not** prove the Hugging Face request actually succeeded — it only proves a
`HUGGINGFACE_API_KEY` is configured on the server. The response also carries `nli.status`, which
distinguishes three cases:

| `status`        | Meaning                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------ |
| `"disabled"`     | No `HUGGINGFACE_API_KEY`; NLI was intentionally not attempted.                              |
| `"ok"`           | The HF request completed and was parsed for scoring. **A successful request that simply finds zero contradictions is still `"ok"`** — never infer HF health from `nli.flaggedClaims` alone. |
| `"soft_failure"` | NLI was configured/attempted, but a timeout, non-2xx response, network error, or malformed payload prevented a valid result. The pipeline still succeeds; this is purely observability. |

`nli.auditedClaims` reports how many adapted-text sentences were actually sent to Hugging Face
(capped at `MAX_NLI_CLAIMS` in `route.ts`), independent of how many were flagged.

The `nli_wiring_canary` fixture asserts both `expectNLIEnabled: true` and `expectNLIStatus: "ok"`
together, specifically so it can tell "not configured" apart from "configured but the HF call is
currently failing" — a distinction the previous version of this harness could not make.

## Running it

From `web/`:

```bash
npm run eval:fidelity
```

This POSTs each fixture to `http://localhost:3000/api/adapt` sequentially (low load, one request at a
time) and prints a per-case result plus a final summary.

### Overriding the target endpoint

```bash
LINAW_API_URL="https://your-deployed-url.vercel.app/api/adapt" npm run eval:fidelity
```

(PowerShell: `$env:LINAW_API_URL="https://your-deployed-url.vercel.app/api/adapt"; npm run eval:fidelity`)

### Cost note

Every case makes at least 2 Gemini calls (generation + verification) plus an optional repair call and
an optional Hugging Face call. Running all 8 cases can cost up to ~24 Gemini calls in the worst case.
Don't run this on every save — run it deliberately, e.g. before a commit that touches the pipeline or
prompts.

## Fixture format

See the fully-documented types and the 8 initial cases in `fixtures.mts`. Summary of the shape:

```
FidelityFixture {
  id, description, originalText, preferences,
  expected: {
    requestShouldSucceed?, expectRepair?, expectedStatus?,
    expectedIssueTypes?, forbiddenIssueTypes?, expectNLIEnabled?,
    requiredSubstringsInAdaptedText?, forbiddenSubstringsInAdaptedText?
  },
  notes?, tags?
}
```

A fixture that defines **no strong expectation** (nothing beyond `requestShouldSucceed`) is
intentionally treated as a **REVIEW** case: it still runs and prints full detail, but it never fails
the build purely because of model-quality variance. Several of the 8 initial cases (`nested_exception`,
`near_duplicate_value_swap`, `nli_claim_cutoff`, `degenerate_input`) are REVIEW-by-design, because we
call the real generative pipeline and cannot force a specific model output — see each fixture's `notes`
field for exactly what to eyeball by hand.

## Exit code

Non-zero only when a **defined, deterministic** assertion actually fails (e.g. a clean-control case
produces a false warning, or a required substring is missing). REVIEW cases never affect the exit code.
