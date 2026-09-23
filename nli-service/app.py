"""
Local DeBERTa NLI inference service for Linaw AI's Fidelity Guard.

Serves cross-encoder/nli-deberta-v3-base directly via Hugging Face
Transformers + PyTorch, behind a minimal FastAPI app.

Request/response contract is intentionally matched EXACTLY to what
web/app/api/adapt/route.ts already sends/expects (buildNLIRequestBody /
parseNLIResponse), so no Next.js changes are required to point
NLI_ENDPOINT at this service:

  POST /predict
  Request:
    {"inputs": [{"text": "<premise>", "text_pair": "<hypothesis>"}, ...]}
  Response:
    [
      [
        {"label": "contradiction", "score": 0.0-1.0},
        {"label": "entailment",    "score": 0.0-1.0},
        {"label": "neutral",       "score": 0.0-1.0}
      ],
      ...  # one entry per input pair, same order as `inputs`
    ]

The Next.js side (extractContradictions in route.ts) only reads the entry
whose `label` case-insensitively equals "contradiction" out of each inner
array; the other two labels are included for completeness/observability but
are not currently consumed there.

Model and tokenizer are loaded ONCE at module import time (i.e. once per
`uvicorn app:app` process start), not per request. CPU-only; does not
require CUDA. Uses the BASE checkpoint — fine-tuning is a later step.
"""

from __future__ import annotations

import logging

import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator
from transformers import AutoModelForSequenceClassification, AutoTokenizer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nli-service")

MODEL_ID = "cross-encoder/nli-deberta-v3-base"
DEVICE = torch.device("cpu")  # CPU must work; CUDA is never required.

SEMANTIC_LABELS = {"contradiction", "entailment", "neutral"}
# Documented fallback convention for this family of cross-encoder NLI models
# when the model config only exposes generic LABEL_0/LABEL_1/LABEL_2 names.
FALLBACK_ID_TO_LABEL = {0: "contradiction", 1: "entailment", 2: "neutral"}


def resolve_label_mapping(id2label: dict) -> dict[int, str]:
    """
    Maps raw model class indices to normalized semantic labels
    ("contradiction" | "entailment" | "neutral").

    Does NOT trust dictionary iteration order. Inspects the model config's
    actual label strings first (case-insensitively); only falls back to the
    documented 0/1/2 convention if the config uses generic label names AND
    there are exactly 3 classes. Fails loudly (raises) if the mapping cannot
    be safely determined, rather than silently guessing and returning
    incorrect scores.
    """
    normalized: dict[int, str] = {}
    for raw_id, raw_label in id2label.items():
        idx = int(raw_id)
        label = str(raw_label).strip().lower()
        if label in SEMANTIC_LABELS:
            normalized[idx] = label

    if len(normalized) == 3 and set(normalized.values()) == SEMANTIC_LABELS:
        logger.info("Resolved NLI label mapping from model config: %s", normalized)
        return normalized

    if len(id2label) == 3:
        logger.warning(
            "model.config.id2label does not use semantic label names (%r); "
            "falling back to documented convention 0=contradiction, "
            "1=entailment, 2=neutral.",
            id2label,
        )
        return dict(FALLBACK_ID_TO_LABEL)

    raise RuntimeError(
        f"Cannot safely determine NLI label mapping from model.config.id2label={id2label!r}. "
        "Expected exactly 3 classes, either semantically named "
        "contradiction/entailment/neutral or 3 generic classes matching the "
        "documented fallback convention. Refusing to start rather than risk "
        "silently mislabeled scores."
    )


logger.info("Loading tokenizer and model for %s (this may download on first run)...", MODEL_ID)
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_ID)
model.to(DEVICE)
model.eval()

LABEL_MAPPING = resolve_label_mapping(dict(model.config.id2label))
logger.info("NLI model ready. Label mapping: %s", LABEL_MAPPING)


# ---------- Request/response schema (matches route.ts exactly) ----------


class NLIPair(BaseModel):
    text: str = Field(..., min_length=1, description="Premise / source evidence")
    text_pair: str = Field(..., min_length=1, description="Hypothesis / adapted claim")

    @field_validator("text", "text_pair")
    @classmethod
    def not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("must not be blank")
        return value


class NLIRequest(BaseModel):
    inputs: list[NLIPair] = Field(..., min_length=1)


class LabelScore(BaseModel):
    label: str
    score: float


app = FastAPI(title="Linaw NLI Service")


@app.get("/health")
def health() -> dict:
    # Minimal and safe: no file paths, machine info, tokens, or cache paths.
    return {"status": "ok", "model": MODEL_ID}


@app.post("/predict", response_model=list[list[LabelScore]])
def predict(request: NLIRequest) -> list[list[LabelScore]]:
    premises = [pair.text for pair in request.inputs]
    hypotheses = [pair.text_pair for pair in request.inputs]

    try:
        encoded = tokenizer(
            premises,
            hypotheses,
            padding=True,
            truncation=True,
            return_tensors="pt",
        ).to(DEVICE)

        with torch.inference_mode():
            logits = model(**encoded).logits
            probabilities = torch.softmax(logits, dim=-1)
    except Exception as exc:  # noqa: BLE001 - real runtime errors must surface, not be disguised
        logger.exception("NLI inference failed for a batch of %d pair(s)", len(premises))
        raise HTTPException(status_code=500, detail="nli_inference_failed") from exc

    results: list[list[LabelScore]] = []
    for row in probabilities:
        scores_by_label = {LABEL_MAPPING[i]: float(row[i].item()) for i in range(row.shape[0])}
        # Stable semantic order (not sorted by score): contradiction, entailment, neutral.
        results.append(
            [
                LabelScore(label="contradiction", score=scores_by_label["contradiction"]),
                LabelScore(label="entailment", score=scores_by_label["entailment"]),
                LabelScore(label="neutral", score=scores_by_label["neutral"]),
            ]
        )

    return results
