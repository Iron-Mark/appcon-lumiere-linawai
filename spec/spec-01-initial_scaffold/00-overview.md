# 00 — Overview

## Purpose

Define what the initial scaffold builds, what it leaves as ports, and the shared rules every track must follow.

## Product one-liner

Linaw AI adapts important information to how the user prefers to receive it, while checking that critical meaning is preserved.

Tagline: **Adapt the format. Preserve the meaning.**

## Non-negotiables (from canon §42, MVP-scoped)

1. Product name is **Linaw AI** (Lumière is legacy only).
2. Core product: **web app** primary; **Chrome companion** reuses the same adapt pipeline.
3. Personalization is **user-selected preferences**, never cognitive diagnosis or ability labels.
4. Modes: Detail **Full / Key Points**, Wording **Original / Plain Language**, Delivery **Read / Listen**, Browser **Auto-Adapt / Manual**.
5. Auto-Adapt is **opt-in**.
6. Original source stays **authoritative and one action away**.
7. Differentiator is **meaning preservation** (Meaning Map → Fidelity Guard → Meaning Check), not format count.
8. Verification is never presented as a guarantee.
9. Development path must include a **deliberately corrupted adaptation** that Linaw catches (campus-pilot sample; owned by fixture + fidelity tracks).
10. Single repo, one app. No backend in this slice; fixture behind `adapt()`.

## Architecture (this slice)

```text
ui (web / extension) → adapt() client port → fixture (now) | http (later)
                              ↓
                     Fidelity Guard (browser)
                              ↓
                            UI
```

- `app/` — App Router routes only. No `app/api`.
- `lib/domain/` — Zod contracts (stable field names).
- `lib/adapt/` — port + selector + fixture implementation.
- `lib/storage/` — `PreferenceStore` (web: localStorage).
- `lib/fidelity/` — four layers (fidelity track).
- `components/sindi/` — presentational mascot (Wave 0).
- `extension/` — MV3 panel (extension track).
- `evals/` — gold Meaning Map + corruptions (fidelity track).

## Visual system

- Direction: calm editorial paper (Swiss grid + note-card reading), not clinical dashboard, not chat.
- Type: **Lora** for reading measure; **Raleway** for UI chrome. Forbidden: Inter, Roboto, Space Grotesk.
- Color tokens in `app/globals.css` only: warm paper, near-black ink, one olive action, amber warnings. Forbidden: purple gradients, scan-blue primary (`#2563EB`).
- Contrast ≥ 4.5:1 for body text and controls. Visible focus rings. Motion 150–300ms; respect `prefers-reduced-motion`.
- Body text ≥ 16px; reading column ~65 characters.
- Lucide for controls. Sindi is a custom SVG lantern, not an emoji.
- One primary action per screen.

## Mobbin-derived UI rules (include)

| Pattern | Source intent | Apply to |
| --- | --- | --- |
| One choice per step, progress + back, large cards, Continue pinned bottom | Duolingo web onboarding | Onboarding |
| Title, one status line, adapted text on warm paper | Granola note card | Reading workspace |
| Empty rail then review cards; inline marks in document | Grammarly doc + review panel | Meaning Check |

## Mobbin / product patterns to leave out

- Grammarly overall score and generative prompt catalog
- Duolingo streaks, XP, hearts, home gamification
- Granola marketing hero as the app shell
- Unrelated Calendly / Copilot / MasterClass / SchoolAI layouts
- Separate “audio product” Listen surface (Listen is a control on the displayed adaptation)

## Shared copy rules

- Preference words only: Key Points, Plain Language, Listen, Auto-Adapt (and Full, Original, Read, Manual as needed).
- Never: ADHD mode, dyslexic learner, auditory learner, cognitive fatigue, slow reader.
- Meaning Check: “No issue found in these checks.” / “Important condition may have changed. Review source.” / relationship-specific cautious lines. Never “100% verified” or “guaranteed.”

## Out of scope (entire phase)

OCR, PDF, auth, RAG, diagnosis, dashboards, Gemini live calls, Supabase, DeBERTa host, repair regeneration, account sync, healthcare, multi-agent, product-line forks as separate apps.

## Acceptance (overview)

- Specs and Wave 0 shell compile; tracks can implement from their files alone.
- Golden browser demo (after tracks) matches [`08-acceptance.md`](./08-acceptance.md).
