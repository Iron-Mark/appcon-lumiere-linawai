#!/usr/bin/env python
"""
Validates a Linaw direct-NLI benchmark JSONL file for structural correctness.

This is a STRUCTURE/SCHEMA validator only. It does not judge whether a label
is semantically correct -- that requires human review (see
nli-service/data/README.md). It exists to catch mechanical problems
(duplicate ids, bad JSON, disallowed labels, missing fields) before a human
reviewer or the evaluator ever looks at the data.

Standard library only -- no external dependencies required.

Usage (from nli-service/):

    python evaluation/validate_dataset.py data/dev_candidates.jsonl

    python evaluation/validate_dataset.py \\
        data/dev_candidates.jsonl \\
        --require-reviewed
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

ALLOWED_LABELS = {"contradiction", "entailment", "neutral"}
REQUIRED_FIELDS = ["id", "premise", "hypothesis", "label", "category", "reviewed"]


def fail(message: str) -> None:
    print(f"[FAIL] {message}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("dataset_path", type=Path, help="Path to a JSONL benchmark file")
    parser.add_argument(
        "--require-reviewed",
        action="store_true",
        help="Fail (nonzero exit) if ANY row has reviewed=false. Without this flag, "
        "unreviewed rows are reported but do not fail validation (candidate datasets "
        "are expected to start fully unreviewed).",
    )
    args = parser.parse_args()

    errors: list[str] = []

    if not args.dataset_path.exists():
        fail(f"file does not exist: {args.dataset_path}")
        return 1

    seen_ids: dict[str, int] = {}
    label_counts: Counter[str] = Counter()
    category_counts: Counter[str] = Counter()
    reviewed_count = 0
    unreviewed_count = 0
    total_rows = 0

    with args.dataset_path.open("r", encoding="utf-8") as f:
        for line_no, raw_line in enumerate(f, start=1):
            line = raw_line.strip()
            if not line:
                continue  # blank lines are allowed and skipped

            total_rows += 1

            try:
                row = json.loads(line)
            except json.JSONDecodeError as exc:
                errors.append(f"line {line_no}: invalid JSON ({exc})")
                continue

            if not isinstance(row, dict):
                errors.append(f"line {line_no}: row is not a JSON object")
                continue

            missing = [field for field in REQUIRED_FIELDS if field not in row]
            if missing:
                errors.append(f"line {line_no}: missing required field(s): {missing}")
                continue

            row_id = row["id"]
            if not isinstance(row_id, str) or not row_id.strip():
                errors.append(f"line {line_no}: 'id' must be a non-empty string")
            elif row_id in seen_ids:
                errors.append(
                    f"line {line_no}: duplicate id '{row_id}' (first seen at line {seen_ids[row_id]})"
                )
            else:
                seen_ids[row_id] = line_no

            premise = row["premise"]
            if not isinstance(premise, str) or not premise.strip():
                errors.append(f"line {line_no} (id={row_id}): 'premise' must be a non-empty string")

            hypothesis = row["hypothesis"]
            if not isinstance(hypothesis, str) or not hypothesis.strip():
                errors.append(f"line {line_no} (id={row_id}): 'hypothesis' must be a non-empty string")

            label = row["label"]
            if label not in ALLOWED_LABELS:
                errors.append(
                    f"line {line_no} (id={row_id}): label '{label}' not in allowed set {sorted(ALLOWED_LABELS)}"
                )
            else:
                label_counts[label] += 1

            category = row["category"]
            if not isinstance(category, str) or not category.strip():
                errors.append(f"line {line_no} (id={row_id}): 'category' must be a non-empty string")
            else:
                category_counts[category] += 1

            reviewed = row["reviewed"]
            if not isinstance(reviewed, bool):
                errors.append(f"line {line_no} (id={row_id}): 'reviewed' must be a boolean, got {type(reviewed).__name__}")
            elif reviewed:
                reviewed_count += 1
            else:
                unreviewed_count += 1

    print(f"Dataset: {args.dataset_path}")
    print(f"Total rows: {total_rows}")
    print(f"Unique ids: {len(seen_ids)}")
    print()

    print("Label distribution:")
    for label in sorted(ALLOWED_LABELS):
        print(f"  {label:15s} {label_counts.get(label, 0)}")
    print()

    print("Category distribution:")
    for category, count in sorted(category_counts.items()):
        print(f"  {category:25s} {count}")
    print()

    print(f"Reviewed:   {reviewed_count}")
    print(f"Unreviewed: {unreviewed_count}")
    print()

    if errors:
        print(f"[FAIL] {len(errors)} structural error(s) found:")
        for err in errors:
            print(f"  - {err}")
        return 1

    if args.require_reviewed and unreviewed_count > 0:
        fail(
            f"--require-reviewed was set but {unreviewed_count} row(s) still have "
            "reviewed=false. This dataset is not yet a valid gold benchmark."
        )
        return 1

    if args.require_reviewed:
        print("[PASS] All rows are structurally valid and reviewed=true.")
    else:
        print(
            "[PASS] All rows are structurally valid. "
            "(This does NOT mean the dataset is a valid gold benchmark -- "
            "human review of labels is still required. See data/README.md.)"
        )

    return 0


if __name__ == "__main__":
    sys.exit(main())
