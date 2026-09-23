# Linaw Direct NLI Benchmark Data

## 1. This is separate from `web/evals`

`web/evals/*` is an **end-to-end regression suite** against the whole
`/api/adapt` pipeline (Gemini generation + verification + the auxiliary NLI
check together). It tests Linaw's product behavior as a black box over HTTP.

This directory (`nli-service/data/`) is a **direct NLI classification
benchmark**. It tests ONLY the base DeBERTa model itself:

```
premise + hypothesis -> contradiction | entailment | neutral
```

No Gemini, no `/api/adapt`, no HTTP — just the model via
`nli-service/evaluation/evaluate.py`. The two suites measure different
things and are intentionally kept apart; do not merge them.

## 2. `dev_candidates.jsonl` is AI-generated DEVELOPMENT candidate material

Every row in `dev_candidates.jsonl` was drafted by an AI coding agent to
cover Linaw's known fidelity-risk categories (wrong dates/times/numbers,
missing conditions/exceptions, reversed negation, wrong actors, actor/value
swaps, unsupported additions, overgeneralization, clean paraphrases, and
unrelated neutral content) with an approximately balanced label distribution.

**This is development candidate material, not a validated dataset, and it is
NOT the final blind holdout.** AI generation is a convenient way to draft
plausible, diverse examples quickly — it is not a substitute for a human
deciding whether each premise/hypothesis pair actually has the logical
relationship its `label` field claims. It has also already been scored once
by the base model during development (see `nli-service/README.md`), which
disqualifies it from ever serving as a blind holdout — a human who reviews
it, or anyone reading its results, has already seen how the base model
behaves on these exact examples.

## 3. Every row begins with `reviewed: false`

This is enforced by construction: every candidate row was written with
`"reviewed": false`, and nothing in this repository ever silently flips that
flag to `true`. Only a human editing the JSONL file directly (after reading
the pair and confirming the label) should ever set `"reviewed": true`.

## 4. A human must inspect labels before this becomes valid gold dev data

Until a person has read each `premise`/`hypothesis` pair and confirmed the
`label` is correct (and ideally confirmed the `category` and refined the
`notes`), this file is only a **candidate dataset**. The tooling in
`nli-service/evaluation/` enforces this distinction mechanically:

- `evaluate.py` **refuses by default** to compute benchmark metrics against
  any dataset containing `reviewed: false` rows. The `--allow-unreviewed`
  development override exists only to prove the evaluator pipeline runs; its
  output is prominently labeled `UNREVIEWED CANDIDATE RESULTS — NOT A VALID
  BENCHMARK` and must never be reported or compared as if it were real.
- `validate_dataset.py --require-reviewed` fails (nonzero exit) if any row
  is still unreviewed.

All 96 candidate rows have now been human-reviewed and approved. The reviewed
development benchmark is saved as `dev_gold.jsonl`, with `reviewed: true`
on every row.

## 5. This data must NEVER later be included in fine-tuning

Whether still `reviewed: false` (candidate) or eventually `reviewed: true`
(`dev_gold.jsonl`), rows drafted here are **evaluation/development data
only**. They must never be copied into a future `train.jsonl` or any
fine-tuning dataset. Mixing evaluation and training data would make future
accuracy numbers meaningless (the model would be tested on data it was
trained on). Keep this dev set, the future blind holdout, and any future
training set built from entirely separate sources of examples.

## 6. Once reviewed/frozen, do not edit it after seeing tuned-model failures

After a human has reviewed `dev_gold.jsonl`, resist the temptation to "fix"
or reword its examples after fine-tuning a model and observing which
examples it gets wrong. Editing an evaluation set based on a specific
model's failures is test-set leakage — it silently biases results toward
whatever model you just tuned. If a reviewed example is later found to be
genuinely mislabeled or ambiguous, fix it deliberately and document why in
`notes` / this README — not reactively based on one model's output. This
rule applies with even more force to the future blind holdout (see below).

## Methodology: dev candidates vs. dev gold vs. the future blind holdout

This project uses three distinct tiers of data, which must not be confused
with one another:

1. **`dev_candidates.jsonl`** (this file, exists now) — AI-generated,
   `reviewed: false` on every row, already scored once by the base model
   during development. Used to shake out labeling ambiguities, exercise the
   evaluator tooling, and iterate on category design. **Not a benchmark.**
2. **`dev_gold.jsonl`** (exists now) — the human-reviewed outcome of
   `dev_candidates.jsonl`. All 96 rows have been read and approved, with
   `reviewed: true`. It is still a *development* benchmark: it has now been
   scored by the base model and may be used for error analysis while designing
   the tuning procedure, but it must never be used as training data or treated
   as the final blind holdout.
3. **The final blind holdout** (does not exist yet, must be created
   separately later) — a fresh, human-reviewed set that is **never scored
   by any model** — base or fine-tuned — until the training/tuning procedure
   is fully locked. Once locked, the base model and the tuned model are each
   scored on this same untouched blind holdout exactly once, so the
   comparison is fair. This is the only tier whose numbers should ever be
   reported as "the benchmark."

Do not skip tiers: seeing dev/candidate results must never influence how the
blind holdout is written, and the blind holdout must not be touched or
peeked at before the tuning procedure is locked.

## File: `dev_candidates.jsonl`

One JSON object per line:

```json
{
  "id": "negation_001",
  "premise": "Photography is not permitted during the ceremony.",
  "hypothesis": "Photography is permitted during the ceremony.",
  "label": "contradiction",
  "category": "reversed_negation",
  "reviewed": false,
  "notes": "Negation reversal changes the rule."
}
```

Required fields: `id`, `premise`, `hypothesis`, `label` (one of
`contradiction` / `entailment` / `neutral`), `category`, `reviewed` (boolean).
Optional: `notes`.

Current candidate set: **96 pairs**, drafted with an approximately balanced
label distribution (~32 per label) across 12 categories (~8 pairs each):
`wrong_date`, `wrong_time`, `wrong_number`, `missing_condition`,
`missing_exception`, `reversed_negation`, `wrong_actor`, `actor_value_swap`,
`unsupported_addition`, `overgeneralization`, `clean_paraphrase`,
`neutral_unrelated`. Exact counts are reported by
`evaluation/validate_dataset.py`, not hand-copied here, so this doc can't go
stale if the file changes.

### `category` is a semantic-risk family label, not a "corruption detection rate"

`category` groups rows by the kind of fidelity risk they probe (wrong dates,
missing exceptions, actor swaps, etc.), but a category is **not** a proxy
for "this category = corruption = should be flagged." Most categories
deliberately mix:

- **corrupted contradiction cases** (the value/actor/condition was actually
  changed in a way that breaks the original meaning),
- **preserved entailment controls** (the same category of edit, but done as
  a faithful paraphrase that keeps the meaning intact), and
- **neutral controls** (an unrelated or unproven addition in the same
  surface style, so the model isn't just pattern-matching on topic).

For example, `wrong_actor` contains both true actor swaps (contradiction)
and faithful actor/action paraphrases (entailment); `overgeneralization`
contains both explicit-exclusivity violations (contradiction) and
unproven-broadening cases with no exclusivity word (neutral). Accuracy
*within* a category therefore measures how well the model tells these
apart — it is **not** the same thing as a "corruption detection rate," and
should not be described that way in any report.

## Tooling

From `nli-service/` (with `.venv` active):

```bash
# Structural validation (works on unreviewed candidate data too)
python evaluation/validate_dataset.py data/dev_candidates.jsonl

# Validate the human-reviewed development benchmark
python evaluation/validate_dataset.py data/dev_gold.jsonl --require-reviewed

# Development-only wiring smoke test (NOT a real benchmark result)
python evaluation/evaluate.py data/dev_candidates.jsonl --allow-unreviewed

# Real development benchmark against the untouched base model
# (dev_gold is still NOT the final blind holdout)
python evaluation/evaluate.py data/dev_gold.jsonl
```
