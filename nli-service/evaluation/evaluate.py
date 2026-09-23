#!/usr/bin/env python
"""
Evaluates cross-encoder/nli-deberta-v3-base DIRECTLY (premise + hypothesis ->
contradiction/entailment/neutral) against a Linaw benchmark JSONL file.

This is a DIRECT NLI classification benchmark -- separate from web/evals,
which is an end-to-end regression suite against the whole /api/adapt
pipeline. This script only exercises the base model itself, using the
highest-probability class as the prediction. It does NOT use or alter the
production `NLI_CONTRADICTION_THRESHOLD` from the Next.js integration; that
threshold is for triggering a Fidelity Guard issue in production, not for
classification accuracy here.

IMPORTANT SAFEGUARD: by default this script REFUSES to produce benchmark
metrics if any example in the dataset has reviewed=false, because an
AI-generated candidate label is not a validated gold label. Use
--allow-unreviewed to override this for development/wiring checks only --
doing so prints "UNREVIEWED CANDIDATE RESULTS -- NOT A VALID BENCHMARK"
prominently and the output must not be treated as a real benchmark result.

Standard library + torch/transformers only (no scikit-learn).

Usage (from nli-service/, with .venv active):

    python evaluation/evaluate.py data/dev_candidates.jsonl

    python evaluation/evaluate.py \\
        data/dev_candidates.jsonl \\
        --allow-unreviewed

    python evaluation/evaluate.py \\
        data/dev_candidates.jsonl \\
        --output results/dev_candidates.json
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from collections import defaultdict
from pathlib import Path
from typing import Any

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

MODEL_ID = "cross-encoder/nli-deberta-v3-base"
DEVICE = torch.device("cpu")  # CPU must work; CUDA is never required.
BATCH_SIZE = 16

SEMANTIC_LABELS = ["contradiction", "entailment", "neutral"]
SEMANTIC_LABEL_SET = set(SEMANTIC_LABELS)
# Documented fallback convention for this family of cross-encoder NLI models
# when the model config only exposes generic LABEL_0/LABEL_1/LABEL_2 names.
# Duplicated (not imported) from nli-service/app.py deliberately: importing
# app.py directly would eagerly trigger its own module-level model load (and
# pull in FastAPI/pydantic) purely as an import side effect, which this
# standalone evaluation script does not need. Keep both copies in sync if the
# mapping logic ever changes.
FALLBACK_ID_TO_LABEL = {0: "contradiction", 1: "entailment", 2: "neutral"}


def resolve_label_mapping(id2label: dict) -> dict[int, str]:
    """Same semantics as nli-service/app.py's resolve_label_mapping()."""
    normalized: dict[int, str] = {}
    for raw_id, raw_label in id2label.items():
        idx = int(raw_id)
        label = str(raw_label).strip().lower()
        if label in SEMANTIC_LABEL_SET:
            normalized[idx] = label

    if len(normalized) == 3 and set(normalized.values()) == SEMANTIC_LABEL_SET:
        return normalized

    if len(id2label) == 3:
        print(
            f"[WARN] model.config.id2label does not use semantic label names ({id2label!r}); "
            "falling back to documented convention 0=contradiction, 1=entailment, 2=neutral.",
            file=sys.stderr,
        )
        return dict(FALLBACK_ID_TO_LABEL)

    raise RuntimeError(
        f"Cannot safely determine NLI label mapping from model.config.id2label={id2label!r}. "
        "Refusing to evaluate rather than risk silently mislabeled scores."
    )


def load_dataset(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as f:
        for line_no, raw_line in enumerate(f, start=1):
            line = raw_line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError as exc:
                raise SystemExit(f"[FAIL] {path}:{line_no}: invalid JSON ({exc})")
            for field in ("id", "premise", "hypothesis", "label", "category", "reviewed"):
                if field not in row:
                    raise SystemExit(f"[FAIL] {path}:{line_no}: missing required field '{field}'")
            if row["label"] not in SEMANTIC_LABEL_SET:
                raise SystemExit(f"[FAIL] {path}:{line_no}: label '{row['label']}' not allowed")
            rows.append(row)
    return rows


def compute_metrics(rows: list[dict[str, Any]], predictions: list[str]) -> dict[str, Any]:
    total = len(rows)
    correct = sum(1 for row, pred in zip(rows, predictions) if row["label"] == pred)
    accuracy = correct / total if total > 0 else 0.0

    # Confusion matrix: confusion[true_label][pred_label] = count
    confusion: dict[str, dict[str, int]] = {t: {p: 0 for p in SEMANTIC_LABELS} for t in SEMANTIC_LABELS}
    for row, pred in zip(rows, predictions):
        confusion[row["label"]][pred] += 1

    per_class: dict[str, dict[str, float]] = {}
    f1_values: list[float] = []
    for label in SEMANTIC_LABELS:
        tp = confusion[label][label]
        fp = sum(confusion[other][label] for other in SEMANTIC_LABELS if other != label)
        fn = sum(confusion[label][other] for other in SEMANTIC_LABELS if other != label)

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0

        per_class[label] = {
            "precision": precision,
            "recall": recall,
            "f1": f1,
            "support": tp + fn,
        }
        f1_values.append(f1)

    macro_f1 = sum(f1_values) / len(f1_values) if f1_values else 0.0

    category_stats: dict[str, dict[str, int]] = defaultdict(lambda: {"correct": 0, "total": 0})
    for row, pred in zip(rows, predictions):
        cat = row["category"]
        category_stats[cat]["total"] += 1
        if row["label"] == pred:
            category_stats[cat]["correct"] += 1

    category_accuracy = {
        cat: (stats["correct"] / stats["total"] if stats["total"] > 0 else 0.0)
        for cat, stats in category_stats.items()
    }

    misclassified = [
        {
            "id": row["id"],
            "category": row["category"],
            "expected_label": row["label"],
            "predicted_label": pred,
            "scores": scores,
        }
        for row, pred, scores in zip(rows, predictions, [r["_scores"] for r in rows])
        if row["label"] != pred
    ]

    return {
        "total": total,
        "correct": correct,
        "accuracy": accuracy,
        "confusion_matrix": confusion,
        "per_class": per_class,
        "macro_f1": macro_f1,
        "category_accuracy": category_accuracy,
        "category_totals": {cat: stats["total"] for cat, stats in category_stats.items()},
        "misclassified": misclassified,
    }


def print_report(metrics: dict[str, Any], unreviewed: bool) -> None:
    if unreviewed:
        print("=" * 70)
        print("UNREVIEWED CANDIDATE RESULTS — NOT A VALID BENCHMARK")
        print("Labels have not been human-reviewed. These numbers only prove the")
        print("evaluator pipeline runs end-to-end; they say nothing trustworthy")
        print("about actual model accuracy. Do not report or compare these numbers.")
        print("=" * 70)
        print()

    print(f"Total examples: {metrics['total']}")
    print(f"Correct:        {metrics['correct']}")
    print(f"Overall accuracy: {metrics['accuracy']:.4f}")
    print(f"Macro F1:         {metrics['macro_f1']:.4f}")
    print()

    print("Per-class metrics:")
    print(f"  {'label':15s} {'precision':>10s} {'recall':>10s} {'f1':>10s} {'support':>8s}")
    for label in SEMANTIC_LABELS:
        m = metrics["per_class"][label]
        print(f"  {label:15s} {m['precision']:>10.4f} {m['recall']:>10.4f} {m['f1']:>10.4f} {m['support']:>8d}")
    print()

    print("Confusion matrix (rows = expected, columns = predicted):")
    header = "  " + " " * 15 + "".join(f"{p:>14s}" for p in SEMANTIC_LABELS)
    print(header)
    for true_label in SEMANTIC_LABELS:
        row_str = "  " + f"{true_label:15s}" + "".join(
            f"{metrics['confusion_matrix'][true_label][p]:>14d}" for p in SEMANTIC_LABELS
        )
        print(row_str)
    print()

    print("Accuracy by category:")
    for cat in sorted(metrics["category_accuracy"].keys()):
        acc = metrics["category_accuracy"][cat]
        total = metrics["category_totals"][cat]
        print(f"  {cat:25s} {acc:.4f}  (n={total})")
    print()

    if metrics["misclassified"]:
        print(f"Misclassified examples ({len(metrics['misclassified'])}):")
        for m in metrics["misclassified"]:
            scores_str = ", ".join(f"{k}={v:.3f}" for k, v in m["scores"].items())
            print(
                f"  id={m['id']:<30s} category={m['category']:<22s} "
                f"expected={m['expected_label']:<13s} predicted={m['predicted_label']:<13s} "
                f"scores=[{scores_str}]"
            )
    else:
        print("Misclassified examples: none")

    if unreviewed:
        print()
        print("=" * 70)
        print("REMINDER: UNREVIEWED CANDIDATE RESULTS — NOT A VALID BENCHMARK")
        print("=" * 70)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("dataset_path", type=Path, help="Path to a JSONL benchmark file")
    parser.add_argument(
        "--allow-unreviewed",
        action="store_true",
        help="Development-only override: run even if reviewed=false rows exist. "
        "Output is clearly labeled UNREVIEWED CANDIDATE RESULTS — NOT A VALID BENCHMARK "
        "and must not be treated as a real benchmark result.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Optional path to write a JSON results file (e.g. results/base_holdout.json).",
    )
    args = parser.parse_args()

    if not args.dataset_path.exists():
        print(f"[FAIL] file does not exist: {args.dataset_path}")
        return 1

    rows = load_dataset(args.dataset_path)
    unreviewed_rows = [r for r in rows if not r.get("reviewed")]

    if unreviewed_rows and not args.allow_unreviewed:
        print(
            f"[FAIL] {len(unreviewed_rows)} of {len(rows)} row(s) have reviewed=false. "
            "Refusing to produce benchmark metrics against unreviewed AI-generated "
            "candidate labels (see nli-service/data/README.md)."
        )
        print("Use --allow-unreviewed ONLY to smoke-test the evaluator pipeline in development.")
        return 1

    unreviewed = bool(unreviewed_rows)
    if unreviewed:
        print("=" * 70)
        print("UNREVIEWED CANDIDATE RESULTS — NOT A VALID BENCHMARK")
        print(f"({len(unreviewed_rows)} of {len(rows)} rows are unreviewed; --allow-unreviewed was set)")
        print("=" * 70)
        print()

    print(f"Loading tokenizer and model for {MODEL_ID} (this may download on first run)...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_ID)
    model.to(DEVICE)
    model.eval()

    label_mapping = resolve_label_mapping(dict(model.config.id2label))
    print(f"Label mapping: {label_mapping}")
    print()

    start_time = time.monotonic()
    predictions: list[str] = []

    with torch.inference_mode():
        for batch_start in range(0, len(rows), BATCH_SIZE):
            batch = rows[batch_start : batch_start + BATCH_SIZE]
            premises = [r["premise"] for r in batch]
            hypotheses = [r["hypothesis"] for r in batch]

            encoded = tokenizer(
                premises,
                hypotheses,
                padding=True,
                truncation=True,
                return_tensors="pt",
            ).to(DEVICE)

            logits = model(**encoded).logits
            probabilities = torch.softmax(logits, dim=-1)

            for row, prob_row in zip(batch, probabilities):
                scores = {label_mapping[i]: float(prob_row[i].item()) for i in range(prob_row.shape[0])}
                predicted_label = max(scores, key=scores.get)
                row["_scores"] = scores
                predictions.append(predicted_label)

    elapsed = time.monotonic() - start_time
    print(f"Inference completed in {elapsed:.1f}s for {len(rows)} examples.")
    print()

    metrics = compute_metrics(rows, predictions)
    print_report(metrics, unreviewed)

    if args.output is not None:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        output_payload = {
            "unreviewed_candidate_results": unreviewed,
            "warning": "UNREVIEWED CANDIDATE RESULTS — NOT A VALID BENCHMARK" if unreviewed else None,
            "model": MODEL_ID,
            "label_mapping": label_mapping,
            "dataset_path": str(args.dataset_path),
            "total": metrics["total"],
            "correct": metrics["correct"],
            "accuracy": metrics["accuracy"],
            "macro_f1": metrics["macro_f1"],
            "per_class": metrics["per_class"],
            "confusion_matrix": metrics["confusion_matrix"],
            "category_accuracy": metrics["category_accuracy"],
            "category_totals": metrics["category_totals"],
            "misclassified": metrics["misclassified"],
            "elapsed_seconds": elapsed,
        }
        args.output.write_text(json.dumps(output_payload, indent=2), encoding="utf-8")
        print(f"\nResults written to {args.output}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
