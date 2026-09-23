# Linaw NLI Service

## 1. Purpose

A local DeBERTa NLI verifier for Linaw AI's Fidelity Guard. It serves
`cross-encoder/nli-deberta-v3-base` directly via Hugging Face Transformers +
PyTorch behind a minimal FastAPI app, giving `/api/adapt` a stable,
self-hosted `NLI_ENDPOINT` instead of depending on an assumed (and currently
unreachable) Hugging Face serverless model URL.

This service exists to:
1. prove the base DeBERTa verifier works end-to-end,
2. give Linaw a stable `NLI_ENDPOINT` for local development,
3. later swap the base checkpoint for our fine-tuned checkpoint without
   changing the Next.js integration at all (same request/response contract).

**This service currently uses the BASE checkpoint. Fine-tuning is a later,
separate step — not part of this service yet.**

## 2. Setup (from repo root)

```bash
cd nli-service
python -m venv .venv
```

(If `.venv` already exists, skip this — do not recreate it.)

## 3. Activate the virtual environment (Windows Git Bash)

```bash
source .venv/Scripts/activate
```

## 4. Install dependencies

```bash
pip install -r requirements.txt
```

## 5. Run the service

```bash
uvicorn app:app --host 127.0.0.1 --port 8001
```

Do not use `--reload` — reloading would load this transformer model twice,
wasting RAM and startup time.

## 6. First startup

The first startup downloads `cross-encoder/nli-deberta-v3-base` from the
Hugging Face Hub and can take noticeably longer than subsequent starts (which
use the local Hugging Face cache). This is expected.

## 7. Health check

```bash
curl http://127.0.0.1:8001/health
```

Expected response:

```json
{ "status": "ok", "model": "cross-encoder/nli-deberta-v3-base" }
```

## 8. Linaw local configuration

In `web/.env.local` (never commit this file — it is and must remain
gitignored/untracked), set:

```
NLI_ENDPOINT=http://127.0.0.1:8001/predict
```

No `HUGGINGFACE_API_KEY` is required for this local service (it has no
authentication — see Architecture below). After setting `NLI_ENDPOINT`, the
Next.js dev server must be **restarted** to pick up the new environment
variable.

## 9. Architecture

```
Next.js /api/adapt
   -> POST NLI_ENDPOINT
   -> FastAPI (this service)
   -> DeBERTa-v3-base (cross-encoder/nli-deberta-v3-base)
   -> contradiction / entailment / neutral scores
   -> Fidelity Guard (merged into /api/adapt's verification result)
```

No authentication is implemented because the request is expected to come
server-to-server from the Next.js backend on the same machine/network, not
directly from a browser. No CORS is configured for the same reason.

## 10. Checkpoint status

This service uses the **BASE** `cross-encoder/nli-deberta-v3-base` checkpoint
as-is, with no fine-tuning. Swapping in a fine-tuned Linaw DeBERTa checkpoint
later should only require changing `MODEL_ID` in `app.py` — the request and
response contract consumed by `web/app/api/adapt/route.ts` is designed to
stay identical either way.

## API contract (matches `web/app/api/adapt/route.ts` exactly)

`POST /predict`

Request:

```json
{
  "inputs": [
    { "text": "premise / source evidence", "text_pair": "hypothesis / adapted claim" }
  ]
}
```

- Supports one pair or many pairs in a single request (true batch inference,
  not a loop).
- Rejects empty `inputs`, and missing/blank `text` or `text_pair`, with a 4xx
  (422) validation error.

Response — one entry per input pair, in the same order as `inputs`:

```json
[
  [
    { "label": "contradiction", "score": 0.92 },
    { "label": "entailment", "score": 0.03 },
    { "label": "neutral", "score": 0.05 }
  ]
]
```

Real model/runtime errors return a `500` with a generic `nli_inference_failed`
detail — they are never disguised as a fake/placeholder prediction.
