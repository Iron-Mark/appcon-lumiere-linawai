# NLI tuning data

This directory is exclusively for fine-tuning development data.

- `train_candidates.jsonl` — draft training examples pending human review.
- `validation_candidates.jsonl` — draft validation examples pending human review.
- `train.jsonl` — approved training examples only.
- `validation.jsonl` — approved validation examples only.

## Separation rules

- Never copy or paraphrase examples from `../dev_candidates.jsonl` or `../dev_gold.jsonl`.
- `../dev_gold.jsonl` is evaluation-only and must never become training data.
- Training and validation examples must be separate from each other.
- The future final blind holdout must not be created or stored here.
- Candidate examples must be human-reviewed before they are promoted to `train.jsonl` or `validation.jsonl`.
- Do not mark examples as reviewed until a human has explicitly approved them.

The current base-model development errors may inform which reasoning skills need more coverage, but the exact dev examples must not be reused or lightly rewritten for tuning.


## Approved first tuning experiment

The first tuning dataset will contain 300 fresh examples:

- Training: 240 examples — 80 contradiction, 80 entailment, 80 neutral.
- Validation: 60 examples — 20 contradiction, 20 entailment, 20 neutral.

The dataset will deliberately add coverage for:
- quantifier and scope reasoning;
- unsupported or unrelated statements that should remain neutral;
- hard rules versus newly introduced exceptions;
- fresh control examples for reasoning types the base model already handles well.

All examples must be independently written and must not copy or lightly paraphrase the development benchmark. Training and validation examples must also remain separate from each other.

All candidate rows begin with `reviewed: false` and require explicit human approval before promotion to the final training or validation files.

The final blind holdout will be created separately only after the tuning procedure is locked.


## Approved candidate schema

Each candidate row uses these fields:

`id`, `premise`, `hypothesis`, `label`, `category`, `reviewed`, `notes`

All candidate rows begin with `reviewed: false`.

## Approved category allocation

Both training and validation use the same 10 reasoning categories:

| Category | Train | Validation |
| --- | ---: | ---: |
| `quantifier_scope` | 24 | 6 |
| `exception_rules` | 24 | 6 |
| `topic_relation` | 24 | 6 |
| `temporal_reasoning` | 24 | 6 |
| `numeric_reasoning` | 24 | 6 |
| `actor_role_binding` | 24 | 6 |
| `negation_polarity` | 24 | 6 |
| `condition_implication` | 24 | 6 |
| `exclusivity_permission` | 24 | 6 |
| `paraphrase_semantics` | 24 | 6 |
| **Total** | **240** | **60** |

Within every category:

- Training: 8 contradiction, 8 entailment, 8 neutral.
- Validation: 2 contradiction, 2 entailment, 2 neutral.

Therefore the complete splits remain balanced:

- Training: 80 contradiction, 80 entailment, 80 neutral.
- Validation: 20 contradiction, 20 entailment, 20 neutral.

Training and validation must use different scenarios, entities, numbers, dates, phrasing patterns, and templates. They must not be alternate phrasings of the same underlying examples.

The first three categories target development-set weaknesses. The remaining categories provide broad regression controls for reasoning types the base model already handles well.
