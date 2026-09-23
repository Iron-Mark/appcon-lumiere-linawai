---
project: Linaw AI
status: CANONICAL FINAL PROJECT CONTEXT
version: 1.0
event: APPCON 2026 — Virtual AI Matsuri
sub_theme: Adaptive Information Communication System
tagline: Adapt the format. Preserve the meaning.
business_model: B2B2C
---

# Linaw AI — Canonical Final Project Context

> **This file is the single source of truth for the finalized Linaw AI concept.**
>
> Use it to align the proposal, README, UI/UX, architecture, implementation, evaluation, demo, and pitch. If an older document conflicts with this file, **this file wins unless the team deliberately edits it during the manual-adjustment phase.**
>
> **Legacy name:** Lumière was an earlier working name. The finalized product name is **Linaw AI**.

---

# 1. Executive Summary

**Linaw AI** is an AI-powered web application with a Chrome browser companion that adapts important information into the form a person prefers to receive it while checking that critical meaning has not been lost, changed, or attached to the wrong thing.

A user creates a simple communication profile during onboarding, such as:

- **Detail:** Full or Key Points
- **Wording:** Original or Plain Language
- **Delivery:** Read or Listen
- **Browser behavior:** Auto-adapt enabled or manual

The web application uses those preferences whenever the user submits information. The browser extension carries the same preferences into webpages so the user does not need to repeatedly copy text, open another AI tool, and write the same prompt.

The main technical differentiator is **not summarization or text-to-speech by itself**. Linaw AI adds a **Meaning Check**, powered by a structured **Meaning Map**, deterministic validation, and semantic/NLI verification. It checks critical information such as actors, actions, dates, deadlines, numbers, conditions, exceptions, negations, and relationships against the original source.

The product principle is:

> **Adapt the format. Preserve the meaning.**

The business model is primarily **B2B2C**:

- institutions such as schools, organizations, companies, and eventually public-service organizations are the paying customers;
- students, employees, members, and citizens are the end users;
- a free individual version can support adoption and product discovery.

For the hackathon, the product remains deliberately narrow: **one strong adaptive-information flow, one strong verification flow, one reliable web application, and one thin Chrome companion.**

---

# 2. Product Identity

## Final Name

**Linaw AI**

“Linaw” communicates clarity and understanding in a Filipino context without limiting the product to only one industry.

## Tagline

> **Adapt the format. Preserve the meaning.**

## One-Sentence Pitch

> **Linaw AI adapts important information to how you prefer to receive it, while checking that critical meaning is preserved.**

## Short Pitch

> People already use AI to summarize, simplify, and read information aloud. The problem is that those transformations can quietly remove a deadline, condition, exception, number, or responsibility. Linaw AI personalizes how information is presented and then checks the adapted version against the original before the user relies on it.

## Product Category

**Adaptive Information Communication System**

Linaw is not positioned as:

- a generic chatbot;
- a generic summarizer;
- a disability diagnostic tool;
- a “learning styles” classifier;
- an automatic medical or legal decision-maker.

It is positioned as a **personalized information layer with meaning-preservation checks**.

---

# 3. The Problem

Important information is frequently distributed in one fixed format even though different people prefer different levels of detail, wording, and delivery.

Examples include:

- class announcements;
- lessons and readings;
- organization instructions;
- event guidelines;
- workplace notices;
- policies and procedures;
- public advisories.

A long or dense message can be understandable to one recipient and inconvenient or overwhelming to another.

Today, users commonly solve this by:

1. reading everything manually;
2. copying it into a general AI assistant;
3. prompting the AI to summarize or simplify it;
4. using a separate text-to-speech tool;
5. manually checking the original again if accuracy matters.

The core problem is that **transformation can change meaning**.

### Example 1 — Missing Condition

Original:

> Late submissions are accepted **only with written approval**.

Bad adaptation:

> Late submissions are accepted.

The wording became easier, but the condition disappeared.

### Example 2 — Wrong Relationship

Original:

> The setup team arrives at **8:30 AM**. Other volunteers arrive at **9:00 AM**.

Bad adaptation:

> All volunteers arrive at **8:30 AM**.

The times themselves are valid source values, but the adapted output attached one time to the wrong group.

This is why simple keyword overlap or generic summarization quality is not enough.

---

# 4. Product Thesis

The winning product idea is:

> **Personalization should happen at the presentation layer, while the original source remains authoritative.**

Linaw AI does not need to determine what kind of brain, learner, or condition a user has.

Instead, the user directly controls how information is presented.

The system then solves the harder technical question:

> **Did the information still mean the same thing after we adapted it?**

This gives Linaw three connected responsibilities:

1. **Understand** the important structure of the source.
2. **Adapt** its presentation to the user's preference.
3. **Check** whether the important meaning survived.

---

# 5. Target Market and Customer Model

## Business Model: B2B2C

Linaw AI is best treated as a **B2B2C product**.

### Paying Customer

Initial institutional buyers can include:

- schools and universities;
- student organizations and training organizations;
- companies and HR/internal-communications teams;
- NGOs and community organizations.

Later:

- LGUs and public-service organizations.

### End User

The people actually consuming adapted information include:

- students;
- organization members;
- employees;
- customers or community members;
- citizens receiving public information.

## Initial Beachhead

For the hackathon and first pilot, keep the story narrower:

> **Schools, universities, and organizations that regularly send important instructions or announcements to students and members.**

This provides a recognizable problem while preserving the broader platform vision.

## Primary Hackathon Persona

A student or young organization member regularly receives:

- class or event announcements;
- instructions;
- deadlines;
- policy reminders;
- long organizational messages.

They prefer **Key Points + Plain Language**, but still want confidence that nothing important was removed.

## Buyer Value Proposition

For institutions:

> **Write the information once. Let each recipient receive it in a clearer form without requiring staff to manually rewrite multiple versions.**

Potential value:

- fewer repeated clarification questions;
- more accessible communication;
- less manual rewriting;
- more consistent delivery;
- improved confidence that adapted information remains grounded in the official source.

## End-User Value Proposition

For recipients:

- less effort processing dense information;
- a default format that matches their preference;
- fewer repeated AI prompts;
- listen/read flexibility;
- quick access to the original;
- visible warnings when important meaning may have changed.

---

# 6. Product Experience

## 6.1 Personalized Onboarding

The web application starts with a lightweight onboarding experience.

The purpose is **preference selection**, not diagnosis.

### Preference Dimension 1 — Detail

**Full**
- preserve the complete information;
- restructure for readability without intentionally removing content.

**Key Points**
- prioritize the critical facts and required actions;
- concise by design.

### Preference Dimension 2 — Wording

**Original / Keep Wording**
- preserve the source wording as much as possible.

**Plain Language**
- rewrite using simpler, clearer wording.

### Preference Dimension 3 — Delivery

**Read**
- display the selected adaptation as text.

**Listen**
- speak the same adapted text using text-to-speech.

### Preference Dimension 4 — Browser Behavior

**Auto-Adapt**
- when explicitly enabled by the user, eligible webpage content can be adapted automatically using the saved profile.

**Manual**
- Linaw waits for the user to select text or trigger the extension.

The user can change all preferences later.

### Important Design Principle

Never label the person:

- “ADHD mode”;
- “dyslexic learner”;
- “auditory learner”;
- “slow reader”;
- “cognitive fatigue detected.”

Use preference language:

- “Key Points”;
- “Plain Language”;
- “Listen”;
- “Use this as my default.”

---

# 7. Web Application

The **web app is the primary product and primary hackathon demo**.

## Core Flow

1. User completes onboarding.
2. User pastes or enters source content.
3. Linaw extracts a Meaning Map.
4. Linaw generates the user's preferred adaptation.
5. Fidelity Guard checks the adapted output.
6. Linaw shows the output with status and source evidence.
7. User can change modes instantly.
8. User can listen to the currently selected version.
9. User can always return to the original.

## Core Controls

- **Full**
- **Key Points**
- **Original Wording**
- **Plain Language**
- **Read**
- **Listen**
- **Show Original**
- **Meaning Check / View Checks**

The controls are independent where practical.

Example:

> Key Points + Plain Language + Listen

or:

> Full + Plain Language + Read

## Source Authority

The original source always remains available.

Linaw never presents an adaptation as replacing the canonical source.

---

# 8. Chrome Browser Companion

The Chrome extension is a **companion to the web app**, not a second product with a separate AI stack.

Its purpose is to remove the repetitive workflow:

> Copy → open AI tool → paste → write prompt → inspect result

and replace it with:

> Open information → Linaw applies the user's saved preference → adjust only if needed.

## Extension Behavior

When Auto-Adapt is enabled:

1. the user opens an eligible content page;
2. the extension extracts the main readable content;
3. it retrieves the user's Linaw preference;
4. it sends the source and preference to the same Linaw API;
5. the page receives an adapted Linaw view/overlay;
6. the user can switch modes or show the original.

The extension should also offer a manual fallback:

> Select text → Linaw

## MVP UI Pattern

For the hackathon, use a reliable injected overlay or reading panel rather than depending on the Chrome side panel opening automatically.

The extension can show:

- “Adapted by Linaw”;
- current mode;
- Full / Key Points;
- Original / Plain;
- Listen;
- Show Original;
- Meaning Check status;
- Open in Linaw Web App;
- Disable on this site.

## Privacy/Control

Auto-Adapt must be explicit opt-in.

The user must be able to:

- turn Auto-Adapt off globally;
- disable it per site;
- use manual selection instead;
- see when page text is being processed.

Do not silently send page content before consent.

## MVP Extraction

Preferred approach:

- use main-content extraction for article/document-like pages;
- use selected-text fallback when automatic extraction fails.

Potential implementation: **Mozilla Readability** or a similarly small deterministic content extractor.

---

# 9. The Core AI System

## User-Facing Name

**Meaning Check**

## Technical Module Name

**Fidelity Guard**

## Internal Structured Representation

**Meaning Map**

These three names describe different layers of the same idea:

- Meaning Map = structured source representation;
- Fidelity Guard = verification pipeline;
- Meaning Check = what the user sees.

---

# 10. Meaning Map

Before adaptation, Linaw extracts the critical structure of the source into schema-validated JSON.

The schema should capture information that is easy for a generative rewrite to accidentally alter.

Example conceptual schema:

```json
{
  "sourceIntent": "Event volunteer instructions",
  "criticalFacts": [
    {
      "id": "fact_1",
      "type": "deadline",
      "actor": "all volunteers",
      "action": "confirm attendance",
      "value": "Thursday 5:00 PM",
      "condition": null,
      "exception": null,
      "negated": false,
      "evidence": "All volunteers must confirm by Thursday at 5 PM."
    },
    {
      "id": "fact_2",
      "type": "schedule",
      "actor": "setup team",
      "action": "arrive",
      "value": "Friday 8:30 AM",
      "condition": null,
      "exception": null,
      "negated": false,
      "evidence": "Setup team members should arrive Friday at 8:30 AM."
    },
    {
      "id": "fact_3",
      "type": "exception",
      "actor": "late confirmations",
      "action": "are accepted",
      "value": null,
      "condition": "only with written approval",
      "exception": null,
      "negated": false,
      "evidence": "Late confirmations are accepted only with written approval."
    }
  ]
}
```

## Critical Information Types

At minimum:

- actor/person/group;
- action;
- object/responsibility;
- date;
- time;
- deadline;
- quantity/number;
- condition;
- exception;
- permission/prohibition;
- negation;
- relationship between actor/action/value;
- source evidence span.

This structure is more useful than treating the source as one embedding vector.

---

# 11. Adaptive Generation

The generative model receives:

1. the original source;
2. the Meaning Map;
3. the user's selected presentation preferences;
4. a strict output schema.

The prompt instructs the model to:

- preserve all facts required by the selected detail level;
- never invent requirements;
- preserve actor/value relationships;
- preserve conditions and exceptions;
- preserve negation;
- avoid adding advice not present in the source;
- use simple wording only when Plain Language is selected.

For **Full** mode, completeness is prioritized.

For **Key Points**, critical information is retained while low-priority exposition can be removed.

---

# 12. Fidelity Guard / Meaning Verification

Linaw should not trust the generated adaptation solely because the same LLM produced it.

Verification uses a **hybrid pipeline**.

## Layer 1 — Deterministic Checks

Run exact or normalized comparisons for:

- dates;
- times;
- numbers;
- names/entities;
- units;
- negation terms;
- conditional markers;
- exception markers.

Examples:

- 8:30 AM vs 9:00 AM;
- 15 units vs 18 units;
- “must” vs “may”;
- “only if” disappearing;
- “not allowed” becoming “allowed.”

## Layer 2 — Relationship Checks

Check whether values remain attached to the correct subject/action.

Example:

Source:

> setup team → arrive → 8:30 AM  
> other volunteers → arrive → 9:00 AM

Adaptation:

> all volunteers → arrive → 8:30 AM

This should be flagged even though “8:30 AM” exists in the source.

## Layer 3 — NLI / Semantic Verification

Each adapted claim is tested against its supporting source evidence.

Preferred verifier:

> **`cross-encoder/nli-deberta-v3-base`**

The model returns:

- entailment;
- contradiction;
- neutral.

It is a pretrained Natural Language Inference model based on DeBERTa-v3-base and trained using SNLI/MultiNLI.

The verifier supports the Fidelity Guard; it is **not treated as an oracle**.

## Layer 4 — Coverage

For Key Points, Linaw checks whether every fact marked as critical was either:

- retained;
- intentionally omitted because it is noncritical;
- or flagged for review.

Conditions, deadlines, exceptions, and prohibitions should be treated as high priority.

## User-Facing Result

Use cautious language.

Good:

> **No issue found in these checks.**

Good:

> **Important condition may have changed. Review source.**

Good:

> **The time appears to be attached to the wrong group.**

Avoid:

> “100% verified.”

Avoid:

> “Guaranteed accurate.”

Avoid:

> “The AI proves this is correct.”

---

# 13. AI / ML Model Stack

## Primary Generative Model

**Google Gemini 3.8 Flash**

Primary jobs:

- Meaning Map extraction;
- schema-validated structured output;
- adaptive generation;
- repair/regeneration when a verification check fails.

Why it fits:

- fast Flash-class model;
- supports structured outputs;
- handles long input;
- suitable for iterative hackathon development.

## Verification Model

**`cross-encoder/nli-deberta-v3-base`**

Primary job:

- claim/source NLI scoring for entailment, contradiction, or neutral.

Model-card reference performance:

- SNLI test accuracy: 92.38%;
- MNLI mismatched accuracy: 90.04%.

These benchmark numbers are context, **not a claim that Linaw has the same accuracy on its own dataset**.

## Deterministic Verification

Custom TypeScript or Python functions for:

- dates;
- times;
- numbers;
- named entities;
- negations;
- conditions;
- exceptions;
- relation integrity.

## Text-to-Speech

**Web Speech API** for the MVP.

Important rule:

> TTS reads the same displayed adaptation that passed through the Meaning Check. It does not create a separate audio-only summary.

This avoids two divergent versions of the message.

## Fine-Tuning

**No custom model training is required for the hackathon.**

Linaw's technical value comes from:

- structured extraction;
- hybrid verification;
- preference-controlled generation;
- source grounding;
- evaluation.

The custom dataset is primarily for **evaluation and benchmarking**, not for claiming a newly trained foundation model.

---

# 14. Linaw Fidelity Evaluation Dataset

## Name

**Linaw Fidelity Evaluation Set v0**

## Purpose

Measure whether Linaw preserves critical information and detects known corruption patterns.

## MVP Minimum

**20 manually reviewed source messages**

## Target if Time Allows

**50 source messages**

Each source should have:

- a gold Meaning Map;
- expected critical facts;
- at least two corrupted adaptations.

At 50 sources × 2 corruptions, that creates at least **100 seeded negative cases** in addition to correct/generated outputs.

## Source Categories

Prefer realistic public/non-sensitive text:

- school announcements;
- university/student-organization notices;
- workplace-style memos;
- event instructions;
- public advisories;
- procedural/policy excerpts.

Do not build the dataset around private personal information.

## Gold Labels

For each source:

- actor;
- action;
- date/time;
- deadline;
- number/quantity;
- condition;
- exception;
- negation;
- critical relationship;
- evidence span.

## Corruption Types

Generate deliberately wrong versions containing:

- wrong date;
- wrong time;
- wrong number;
- missing condition;
- missing exception;
- reversed negation;
- wrong actor;
- actor/value swap;
- unsupported addition;
- overgeneralization.

## Train/Test Philosophy

The MVP is prompt/configuration-based, not fine-tuned.

Still keep a small unseen holdout set so the team can demonstrate that the checker was not only designed around the demo message.

---

# 15. Evaluation Metrics

The README and technical demo should report measurable results.

## Core Metrics

### Critical Fact Retention

Of the gold critical facts, how many survive the adaptation?

### Condition/Exception Preservation

How often are required conditions and exceptions retained correctly?

### Relationship Preservation Accuracy

Does the right date/time/number remain attached to the right actor/action?

### Seeded Corruption Detection Rate

Of intentionally wrong outputs, how many does Fidelity Guard flag?

### False Warning Rate

How often does the system warn about a correct adaptation?

### Unsupported Addition Rate

How often does the adaptation introduce claims that cannot be grounded in the source?

### Latency

Measure:

- extraction time;
- adaptation time;
- verification time;
- end-to-end response time.

## Evaluation Targets

These are **targets, not pre-existing claims**:

- prioritize high critical-fact retention;
- detect most seeded condition, date, number, negation, and relationship corruptions;
- keep false warnings low enough that users do not ignore the checker;
- deliver a demo response within a few seconds on typical short messages.

Do not invent benchmark results before running the evaluation.

---

# 16. Final Technical Architecture

## Frontend — Web

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- responsive desktop/mobile layout

Do not over-abstract.

## Chrome Extension

- **Chrome Manifest V3**
- **React + TypeScript**
- content script for page/selection extraction;
- injected Linaw reading panel/overlay;
- `chrome.storage` for extension-local settings/cache;
- shared API and shared schemas with the web app.

The extension should remain thin.

## Backend / API

Recommended simplest implementation:

- Next.js server routes / server actions on Vercel for orchestration;
- schema validation using **Zod**;
- Gemini API for extraction/generation;
- verification service/function for deterministic checks and NLI;
- no agent framework required.

## Preference Storage

For the intended product:

- **Supabase Auth + Postgres** can hold a user's Linaw preferences so the web app and browser extension can share the same profile.

For the hackathon demo:

- keep authentication minimal;
- use one reliable demo profile if full cross-extension authentication threatens delivery;
- `chrome.storage` can cache the last synchronized preference.

The product behavior matters more than building a complex identity system during the hackathon.

## Content Storage

Default principle:

> **Do not permanently store source page/document content unless the user explicitly chooses to save it.**

The MVP only needs to persist:

- user preference;
- optional adaptation metadata;
- evaluation data in the repository.

## Deployment

- **Vercel** — web app and API/orchestration;
- **Supabase** — preference/account storage if implemented;
- **Hugging Face inference / a small Python service / compatible hosted endpoint** — NLI model if needed;
- Chrome extension loaded unpacked for hackathon demo if store publication is not practical during the event.

## Shared Packages

Keep shared code small:

```text
/apps/web
/apps/extension
/packages/schemas
/packages/fidelity
/evals
```

Do not create unnecessary microservices.

---

# 17. Suggested API Contract

One primary endpoint is enough for the MVP.

## `POST /api/adapt`

Input:

```json
{
  "source": "...",
  "preferences": {
    "detail": "key_points",
    "wording": "plain",
    "delivery": "read"
  }
}
```

Output:

```json
{
  "adaptedText": "...",
  "meaningMap": {},
  "checks": [
    {
      "claim": "...",
      "status": "pass",
      "evidence": "...",
      "reason": "..."
    }
  ],
  "overallStatus": "pass"
}
```

Possible statuses:

- `pass`
- `warning`
- `repair_required`

Do not create dozens of APIs before they are necessary.

---

# 18. Personalization Strategy

## MVP Personalization

**Explicit preference-based personalization.**

The user tells Linaw how they want information.

This is reliable, explainable, and immediately demoable.

## Future Personalization

CAST-inspired behavior adaptation can become a future layer.

Example:

> The user repeatedly changes long pages to Key Points + Plain Language.

Linaw can ask:

> “You use Key Points on most long pages. Make this your default?”

The system should suggest, not diagnose.

## What Linaw Does Not Claim

Do not claim:

- scroll behavior proves cognitive fatigue;
- dwell time proves confusion;
- a user has ADHD, dyslexia, or another condition;
- Linaw can determine a person's cognitive type.

Behavioral telemetry can be explored later only after real usage data exists.

---

# 19. How Other Ideas Were Combined

The finalized product is **Idea #4 — Linaw AI** as the core platform.

Strong elements from other concepts are incorporated selectively without merging their full complexity into the MVP.

## Idea #1 — Education / Lumière Learner Concept

Retained:

- education as a strong initial use case;
- adaptive reading modes;
- Listen/Voice;
- plain-language direction;
- zero-disclosure philosophy;
- strong meaning preservation;
- future Taglish potential.

Future vertical:

> **Linaw Learn**

Not retained for MVP:

- disability-focused positioning;
- four named learner “Prisms” as the primary navigation;
- OCR/PDF complexity;
- claims about learner types.

## Idea #3 — Pathwise

Retained as future direction:

> **Step-by-Step / Decision Path Mode**

Possible future flow:

> policy → structured conditions → user questions → applicable path → source-linked result

This is valuable for complex procedures, but **not part of the hackathon core** because reliable arbitrary policy-to-graph conversion creates unnecessary execution risk.

## Idea #5 — CAST

Retained:

- vision of reducing repeated manual user actions;
- future adaptive defaults based on repeated user choices.

Changed:

- onboarding preferences are the MVP source of personalization;
- behavioral telemetry is not treated as proof of cognitive fatigue.

## Idea #2 — Healthcare

Not merged into the MVP.

Reason:

- medication/clinical safety;
- privacy;
- handwriting/OCR errors;
- higher consequences of incorrect adaptation;
- separate validation burden.

Healthcare can only become a specialized future vertical with domain-specific safeguards.

---

# 20. Product Variants / Expansion

One core engine can support multiple distribution contexts.

## Linaw Learn

Users:

- students;
- teachers;
- schools;
- training programs.

Content:

- lessons;
- assignments;
- announcements;
- academic procedures.

## Linaw Work

Users:

- employees;
- HR;
- internal communications;
- teams.

Content:

- policies;
- onboarding;
- memos;
- procedures.

## Linaw Org

Users:

- student organizations;
- NGOs;
- community groups.

Content:

- event instructions;
- guidelines;
- announcements;
- volunteer coordination.

## Linaw Public

Users:

- citizens;
- LGUs;
- public-service organizations.

Content:

- advisories;
- notices;
- public procedures.

These are **future market variants, not four separate systems**.

Shared technology:

> Source → Meaning Map → Adaptation → Fidelity Guard → Read/Listen

---

# 21. Competitive Positioning

Linaw operates in a market where existing tools already offer pieces of the experience:

- general-purpose LLMs can summarize and simplify;
- browser tools can summarize webpages;
- accessibility readers can change presentation and read text aloud;
- TTS tools can speak content;
- writing tools such as Grammarly demonstrate the value of an in-context browser companion.

Linaw should not compete by claiming:

> “We have more modes.”

Its differentiation is the combination of:

1. **persistent user-controlled communication preferences**;
2. **automatic/in-context browser adaptation**;
3. **structured critical-information extraction**;
4. **hybrid meaning-preservation checks**;
5. **source evidence and easy original comparison**;
6. **safe fallback when the adapted output is uncertain**.

The central competitive question is:

> **Did the important meaning survive the transformation?**

That should remain the product's technical and marketing center.

---

# 22. Business Model

## Primary Model

**B2B2C**

Institution buys/accesses Linaw → recipients personalize how information is presented.

## Individual Layer

### Free

Potentially:

- limited adaptations;
- core Full / Key Points / Plain Language;
- basic browser use.

### Pro

Potentially:

- higher usage limits;
- synced preferences;
- advanced controls;
- additional history/settings.

Exact limits and pricing are **not finalized**.

## Institutional Subscription

Schools, companies, organizations, and eventually public-sector organizations can pay for:

- organization-wide access;
- higher usage;
- centralized deployment;
- integrations;
- usage/admin controls;
- support.

## Future API

**Linaw API**

Third-party systems could send source information and receive:

- adapted output;
- Meaning Map;
- verification status;
- evidence mapping.

## Revenue Logic

The strongest long-term payer is likely the institution distributing recurring information to many recipients, while individual access helps adoption.

This is a business hypothesis to validate, not a demonstrated revenue claim.

---

# 23. Sustainability

## Technical Sustainability

All product variants use the same core engine.

Do not rebuild separate AI systems for Learn, Work, Org, and Public.

Reuse:

- extraction;
- adaptation;
- verifier;
- preference model;
- extension;
- UI components;
- evaluation harness.

## Cost Control

Potential controls:

- usage limits;
- caching Meaning Maps;
- reuse a Meaning Map when the user changes presentation mode;
- cache verified adaptations for identical source/preference combinations;
- use browser-native TTS rather than paid audio generation for MVP;
- use Gemini Flash-class inference rather than heavier models where quality is sufficient;
- avoid storing unnecessary source content.

## Operational Sustainability

Keep the architecture understandable:

- small number of services;
- schema-validated AI outputs;
- observable failures;
- versioned prompts;
- repeatable evals;
- explicit fallback.

---

# 24. Marketing Strategy

## Core Message

> **Adapt the format. Preserve the meaning.**

## End-User Message

> **Understand important information your way without losing what matters.**

## Institution Message

> **Write once. Let every recipient receive it more clearly.**

## Product Story

The strongest story is not:

> “Everyone learns differently.”

It is:

> “People regularly need the same important information presented differently, but every AI rewrite introduces the risk that something important changes. Linaw adapts the presentation and checks the meaning against the original.”

## Marketing Pillars

### 1. Personal

Your preferred format follows you.

### 2. Trustworthy by Design

The original remains visible and critical facts are checked.

### 3. Frictionless

The browser companion brings Linaw to the information instead of requiring repeated copy/paste prompting.

### 4. Flexible

Read the full version, key points, plain language, or listen.

### 5. Scalable for Organizations

One source can serve many recipient preferences.

## Initial Go-to-Market

First pilots should favor:

- schools/universities;
- student organizations;
- training organizations;
- small teams with frequent announcements.

Reason:

- high frequency of instruction-heavy communication;
- easy demo scenarios;
- clear buyer/end-user separation;
- relatively low regulatory risk compared with healthcare.

---

# 25. Branding and Language Rules

## Always Use

**Linaw AI**

## Do Not Use as Final Product Name

**Lumière**

Lumière may appear only when referencing old research/proposal history.

## Tone

- clear;
- calm;
- accessible;
- modern;
- trustworthy;
- not clinical;
- not patronizing.

## Preferred Vocabulary

- preferences;
- adapt;
- clarify;
- key points;
- plain language;
- original;
- source;
- meaning check;
- evidence;
- review.

## Avoid

- diagnose;
- detect ADHD/dyslexia;
- “learning style” claims;
- guaranteed accuracy;
- perfectly verified;
- “AI knows how your brain works.”

---

# 26. UI/UX Direction

## Visual Goal

A clean reading-focused product with low cognitive load.

The design should feel like a combination of:

- a modern document reader;
- an accessibility-friendly workspace;
- an AI verification interface.

## Main Screens

### Screen 1 — Personalized Onboarding

Choose default detail, wording, delivery, and browser behavior.

### Screen 2 — Web Input

Paste important information.

### Screen 3 — Adapted Reading View

Show the output with clear mode switches.

### Screen 4 — Meaning Check

Show detected critical facts and source evidence.

### Screen 5 — Listen

Audio player tied to the exact displayed adaptation.

### Screen 6 — Browser Companion

Show Linaw adapting content on an existing webpage using the saved profile.

## Interaction Rules

- original is always one action away;
- mode changes are reversible;
- warning states are visible but not alarming;
- verification explanations are concrete;
- avoid overwhelming the user with raw AI internals;
- detailed technical scores can exist for judges/README, not dominate the consumer UI.

---

# 27. Hackathon MVP Scope

## Must Ship

### Web App

- onboarding;
- saved preference;
- text input;
- Full;
- Key Points;
- Original Wording;
- Plain Language;
- Listen;
- Show Original;
- Meaning Map extraction;
- Meaning Check;
- source evidence;
- warning state;
- safe fallback;
- responsive UI.

### Chrome Extension

- Manifest V3;
- use saved/default Linaw preference;
- page text or selected-text ingestion;
- automatic adaptation when Auto-Adapt is enabled;
- manual override;
- injected reading panel/overlay;
- Show Original;
- Meaning Check status;
- Disable on this site.

### AI

- Gemini structured extraction;
- Gemini adaptation;
- deterministic fidelity checks;
- NLI verifier if integration remains reliable;
- repair/fallback behavior.

### Evaluation

- minimum 20 gold source cases;
- seeded corruptions;
- simple reproducible evaluation script;
- results documented honestly.

## Should Ship If Core Is Stable

- profile sync between web and extension;
- 50-source evaluation set;
- site-level extension preferences;
- evidence highlighting in source;
- automatic repair after a failed check.

## Explicitly Deferred

- OCR;
- photographed documents;
- PDF pipeline;
- translation;
- Taglish generation as a required MVP feature;
- dashboards;
- complex organization administration;
- RAG/vector database;
- cross-document knowledge search;
- custom model training;
- multi-agent architecture;
- behavioral cognitive diagnosis;
- arbitrary policy flowchart generation;
- healthcare;
- native mobile app;
- desktop app.

---

# 28. Golden Demo Scenario

Use **one short but structurally tricky announcement**.

It should contain:

- a deadline;
- multiple groups;
- different times;
- one condition or exception.

Example:

> Event volunteers must confirm by Thursday at 5 PM. Setup team members should arrive Friday at 8:30 AM. Other volunteers should arrive at 9:00 AM. Late confirmations are accepted only with written approval from the event coordinator.

## Demo Flow

### 1. Show Onboarding/Profile

User preference:

> Key Points + Plain Language + Read  
> Auto-Adapt enabled

### 2. Show Original

Open/paste the announcement.

### 3. Show Linaw Adaptation

The system immediately presents the preferred format.

### 4. Show Source Trace

Click a key point and reveal its supporting source sentence.

### 5. Show Listen

Read the same checked adaptation aloud.

### 6. Trigger the Technical Moment

Use a seeded bad adaptation:

> All volunteers arrive at 8:30 AM.

or:

> Late confirmations are accepted.

### 7. Show Fidelity Guard

Linaw flags:

> **The arrival time appears to be attached to the wrong group.**

or:

> **The written-approval condition is missing.**

### 8. Recover

Show the original evidence and repaired/correct output.

### 9. Browser Moment

Open the same or another announcement on a webpage.

Show Linaw applying the user's saved preference without requiring a new prompt.

## Demo Takeaway

> **Changing information is easy. Making sure it still means the same thing is the hard part.**

---

# 29. Technical Demo Story

For judges, explain the AI in one short sequence:

> **First, Gemini converts the source into a structured Meaning Map. Second, Linaw generates the user's preferred version. Third, Fidelity Guard checks exact facts such as dates and numbers, verifies actor-to-value relationships, and runs NLI against source evidence. If a critical detail changes, Linaw warns the user or repairs the result instead of silently presenting it.**

That is enough technical depth for the live pitch.

Do not spend the pitch explaining a large agent diagram.

---

# 30. Why AI Is Core

AI is not decorative in Linaw.

Without AI, the system cannot reliably:

- interpret unstructured natural-language content;
- extract semantic roles and conditions;
- rewrite the source into plain language;
- generate concise key points;
- evaluate semantic support for paraphrased claims.

Deterministic code alone handles the exact checks, but AI is required for the semantic transformation and semantic verification.

The strongest architecture is therefore **hybrid AI + deterministic validation**.

---

# 31. Why the Product Is More Than a Generic AI Wrapper

The product creates a repeatable system around a general-purpose model:

- structured Meaning Map;
- preference model;
- constrained generation;
- critical-fact policy;
- deterministic validator;
- independent NLI check;
- evidence mapping;
- evaluation dataset;
- browser integration;
- safe fallback.

The model is a component of Linaw, not the entire product.

---

# 32. Safety, Privacy, and Trust

## Original Source Is Authoritative

The user can always inspect the source.

## No Accuracy Guarantee

Use:

> “No issue found in these checks.”

Not:

> “Verified correct.”

## Uncertainty Is Visible

If verification fails or cannot run:

- do not display a misleading green status;
- show a warning;
- keep the original visible.

## Privacy

The extension can process sensitive webpage content, so:

- Auto-Adapt is opt-in;
- clearly explain that page text may be sent for AI processing;
- provide per-site disabling;
- do not persist page content by default;
- do not request broader browser permissions than needed.

## Domain Scope

The MVP is for ordinary informational content.

Do not market it as:

- medical instruction verification;
- legal advice;
- emergency decision automation.

---

# 33. Main Risks and Mitigations

## Risk: Linaw Looks Like “Just Another Summarizer”

Mitigation:

- center the demo on a seeded semantic error;
- show Meaning Map/evidence;
- show Fidelity Guard catching it;
- spend less pitch time on generic summary features.

## Risk: Verification Gives False Confidence

Mitigation:

- hybrid checks;
- source evidence;
- cautious user-facing language;
- false-warning and corruption-detection evaluation;
- original always accessible.

## Risk: Extension Becomes Too Big to Finish

Mitigation:

- thin extension;
- one existing API;
- injected panel;
- selected-text fallback;
- no separate extension backend.

## Risk: Automatic Adaptation Creates Privacy Concerns

Mitigation:

- explicit onboarding consent;
- visible state;
- disable per site;
- no default permanent content storage.

## Risk: NLI Model Hosting Adds Latency/Deployment Problems

Mitigation:

- deterministic verifier remains available;
- NLI runs as a separate layer that can fail gracefully;
- demo has a reliable fallback;
- do not let one model deployment block the entire product.

## Risk: Too Many Markets Make the Product Vague

Mitigation:

- broad platform vision;
- narrow hackathon persona and demo;
- market variants only in roadmap/business section.

## Risk: Overclaiming Accessibility Science

Mitigation:

- user-selected preferences;
- no learning-style theory;
- no diagnosis;
- no claims that a specific mode is objectively best for a condition.

---

# 34. Success Metrics

## User-Level

Potential future metrics:

- time to extract required actions;
- comprehension/task accuracy;
- percentage of users keeping or changing their default preference;
- number of repeated manual prompts avoided;
- user confidence in identifying deadlines/conditions.

## Institution-Level

Potential future metrics:

- reduction in repeated clarification requests;
- adaptation usage rate;
- engagement with announcements;
- number of recipients using different presentation modes.

## Technical

For hackathon:

- critical fact retention;
- seeded corruption detection;
- false warning rate;
- unsupported additions;
- latency;
- successful end-to-end runs.

---

# 35. AppCon 2026 Fit

## Assigned Sub-theme

**Adaptive Information Communication System**

Linaw directly fits because it:

- receives information;
- adapts presentation;
- uses user preferences;
- operates across read/listen/detail/wording modes;
- preserves the source;
- uses AI as core technology.

## Official Submission Constraints to Respect

Based on the AppCon 2026 Official Mechanics:

- AI must be central to the product.
- Teams have five members.
- Development begins after the Theme Draw on September 23, 2026.
- End of Hackathon & Judging is September 24, 2026.
- Awarding is September 25, 2026.
- The project must be submitted in a **public Git repository**.
- The repository must include a **README**.
- The repository must show **hackathon-period commit history**.
- An **open-source license** is required; the mechanics specify the **MIT License**.
- The team must present a **fully functional prototype/product demonstration**.
- The presentation should cover the problem, solution, AI implementation, technical architecture, and potential impact.
- A 5–10 slide presentation is recommended.
- Existing products already in use and accepting transactions cannot simply be submitted.
- Proprietary APIs/services must be documented, along with access/substitution guidance where required.

Because Linaw uses Gemini and potentially hosted NLI infrastructure, the README must clearly document those dependencies.

---

# 36. Judging Strategy

Official rubric:

- **Product — 35%**
- **Technology — 30%**
- **Creativity — 20%**
- **Presentation — 15%**

## Product

### Relevance

Directly state:

> Adaptive Information Communication System

### Impact & Value

Show one real communication problem and how the same source becomes usable in different formats.

### UI/UX

Show:

- onboarding;
- adapted reading;
- simple controls;
- source comparison;
- warning state;
- extension.

### Maintainability & Sustainability

Show:

- one shared core engine;
- reusable schemas;
- small architecture;
- usage/caching strategy;
- no duplicate backend for extension.

## Technology

### Functionality

The golden path must work live.

### Technical Innovation

Focus on:

> **Meaning Map + hybrid Fidelity Guard + relationship preservation**

not merely calling an LLM.

## Creativity

The creative concept is:

> personalization that follows the user while the system independently checks the transformation.

## Presentation

Show the working product early.

Do not spend most of the demo on slides.

---

# 37. Repository Strategy

Recommended public repository structure:

```text
linaw-ai/
├─ apps/
│  ├─ web/
│  └─ extension/
├─ packages/
│  ├─ schemas/
│  └─ fidelity/
├─ evals/
│  ├─ dataset/
│  ├─ corruptions/
│  └─ run-evals.*
├─ docs/
├─ README.md
├─ LICENSE
└─ .env.example
```

## README Must Explain

- problem;
- solution;
- demo;
- architecture;
- AI models;
- Fidelity Guard;
- dataset/evaluation;
- setup;
- environment variables;
- extension setup;
- limitations;
- proprietary external services;
- license.

## Commit Strategy

Create meaningful commits throughout development.

Examples:

- `feat: add preference onboarding`
- `feat: implement meaning map extraction`
- `feat: add plain language adaptation`
- `feat: add deterministic fidelity checks`
- `feat: add NLI verification`
- `feat: add chrome content extraction`
- `test: add fidelity corruption evals`
- `docs: document architecture and limitations`

Avoid one final giant commit.

---

# 38. Build Priority

If time becomes limited, follow this order:

1. **Working web input → adaptation**
2. **Meaning Map**
3. **Deterministic Fidelity Guard**
4. **Meaning warning + source evidence**
5. **Onboarding preferences**
6. **Listen**
7. **Chrome extension manual flow**
8. **Chrome Auto-Adapt**
9. **NLI verifier**
10. **extra polish**

The product must still make sense if items 8–10 are incomplete.

The non-negotiable differentiator is that the demo shows a real meaning-preservation check.

---

# 39. Definition of Done for the Hackathon

The MVP is considered ready when:

- a user can set a default communication preference;
- a user can submit a short real-world message;
- Linaw generates the selected presentation;
- the original remains accessible;
- at least one important source fact is traceable to evidence;
- the system catches the prepared bad-condition or wrong-relationship demo case;
- the UI has a real warning state;
- Listen works;
- the browser extension can apply or request the same type of adaptation;
- the public repo works from README instructions;
- the evaluation script runs;
- the presentation and backup demo are ready.

Everything else is secondary.

---

# 40. Product Roadmap After MVP

## Phase 1 — Hackathon

- web app;
- preference onboarding;
- adaptive modes;
- Fidelity Guard;
- basic extension;
- evaluation.

## Phase 2 — Pilot

- stronger account/profile sync;
- institution onboarding;
- better page extraction;
- history if users request it;
- more robust eval dataset;
- feedback loop for verification warnings;
- optional Taglish mode after evaluation.

## Phase 3 — Verticalization

- Linaw Learn;
- Linaw Work;
- Linaw Org;
- Linaw Public.

## Phase 4 — Advanced Adaptation

Potential features inspired by Pathwise/CAST:

- step-by-step procedural mode;
- decision-path visualization;
- user-approved preference suggestions based on repeated behavior;
- organization integrations;
- Linaw API.

---

# 41. Final Positioning Summary

## The Problem

Important information is distributed in one format, while recipients need different levels of detail, wording, and delivery.

## The Existing Workaround

Users repeatedly ask AI to summarize or simplify content.

## The New Risk

AI transformations can remove or alter critical meaning.

## Linaw's Answer

> **Personalize the presentation and check the transformation against the source.**

## Product

> **Web app + Chrome companion**

## Personalization

> **Explicit user preferences first; behavioral learning later**

## AI Core

> **Gemini 3.8 Flash + Meaning Map + deterministic checks + DeBERTa NLI**

## Technical Differentiator

> **Fidelity Guard / Meaning Check**

## Market

> **B2B2C**

## Initial Beachhead

> **Schools/universities and organizations**

## Expansion

> **Learn → Work → Org → Public**

## Tagline

> **Adapt the format. Preserve the meaning.**

---

# 42. Non-Negotiable Canonical Decisions

Unless manually changed by the team after reviewing this file:

1. The product name is **Linaw AI**.
2. Lumière is a legacy name only.
3. The product is an **Adaptive Information Communication System**.
4. The core product is a **web app with a Chrome browser companion**.
5. The web app is the primary hackathon product/demo.
6. The extension uses the **same backend and AI pipeline**.
7. Personalization begins with **user-selected preferences**, not cognitive diagnosis.
8. The core modes are **Full / Key Points, Original / Plain Language, Read / Listen**.
9. Auto-Adapt is **user-enabled and adjustable**.
10. The original source remains authoritative and accessible.
11. The main differentiator is **meaning preservation**, not the number of formats.
12. The internal representation is the **Meaning Map**.
13. The technical verifier is the **Fidelity Guard**.
14. The user-facing verifier is the **Meaning Check**.
15. The primary generative model is **Gemini 3.8 Flash**.
16. The preferred NLI verifier is **cross-encoder/nli-deberta-v3-base**.
17. Deterministic validation remains part of the verification pipeline.
18. Text-to-speech uses the **same adapted text**, not a separately generated summary.
19. The custom dataset is for **evaluation first**, not custom-model-training claims.
20. The business model is **B2B2C**.
21. Initial buyer focus is **schools/universities and organizations**.
22. Initial end-user focus is **students/young organization members**, while the platform remains expandable.
23. **Linaw Learn / Work / Org / Public** are expansion paths, not separate MVPs.
24. Healthcare is **not** part of the MVP.
25. Pathwise-style decision trees are **future**, not core MVP.
26. CAST-style behavioral adaptation is **future** and may only suggest preferences.
27. The product must never claim to diagnose learning/cognitive conditions.
28. The system must never present verification as a guarantee.
29. The hackathon demo must include a **deliberately corrupted adaptation that Linaw catches**.
30. Build reliability beats adding more features.

---

# 43. Technical Source Notes

These are implementation references, not product marketing claims.

## Gemini 3.8 Flash

Google AI for Developers documentation lists `gemini-3.8-flash` as a stable Gemini API model and documents structured-output support.

Reference:

`https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash`

## DeBERTa NLI

Hugging Face model:

`cross-encoder/nli-deberta-v3-base`

The model card describes it as a DeBERTa-v3-base NLI cross-encoder trained on SNLI and MultiNLI with entailment, contradiction, and neutral outputs.

Reference:

`https://huggingface.co/cross-encoder/nli-deberta-v3-base`

## Product/Research Inspirations

- Grammarly browser companion pattern;
- Microsoft Immersive Reader / adaptive reading tools;
- Mochi adaptive-content inspiration;
- AssisT adaptive augmentation research/concepts;
- W3C accessibility guidance;
- factuality/meaning-preservation evaluation literature.

These are inspirations and comparison points. Linaw should not imply affiliation.

---

# 44. Required Next Workflow

After this canonical context is accepted, the project workflow is:

## Step 1 — Analyze This Final `.md`

Use this file as the source of truth.

Check:

- contradictions;
- build risks;
- missing technical decisions;
- scope issues;
- judging alignment.

Do not restart ideation unless a blocking flaw is discovered.

## Step 2 — Manually Adjust Existing Docs

Update:

- Centralized Paper;
- proposal;
- README draft;
- architecture notes;
- judging mapping;
- pitch outline;
- task allocation.

Replace outdated Lumière/#4 wording with the canonical Linaw AI definition.

Remove features that conflict with this file.

## Step 3 — Start Design + Development Execution

Then move directly into:

- final user flow;
- UI wireframes;
- design system;
- repo initialization;
- data/schema contracts;
- web MVP;
- Fidelity Guard;
- evaluation;
- Chrome extension;
- testing;
- deployment;
- demo/pitch.

At that point, the question is no longer:

> “What should we build?”

It becomes:

> **“What is the highest-priority implementation task required to make the canonical Linaw AI demo work end to end?”**

---

# Final Project Statement

> **Linaw AI is an AI-powered adaptive information platform that remembers how a user prefers to receive information, applies those preferences in a web app and browser companion, and checks adapted content against the original so important actions, deadlines, numbers, conditions, exceptions, and relationships are less likely to be silently changed or lost.**

> **Adapt the format. Preserve the meaning.**
