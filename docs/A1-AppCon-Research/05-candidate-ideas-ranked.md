# 05 — Candidate ideas and directions, ranked

Constraint that shapes everything: **you do not choose your topic — your team leader draws a sub-theme by lottery at the start of the event**, from "a predefined pool of challenge categories", and each team's sub-theme is distinct ([site /about → Theme; FAQ](https://appcon.otismanila.com/about)). The pool itself is unpublished. So the winning move is not "pick the best idea" but **(1) pre-decide a stack and a product archetype, (2) hold an idea bank covering every plausible category, and (3) run a 90-minute selection procedure after the draw.**

## 1. The single recommended direction (archetype)

**"Closed-loop frontline copilot" — with the citizen moment as the star and the institution copilot backstage.**

The shape: an ordinary Filipino sends **messy real-world input** (a Taglish voice note, a photo, an SMS, a scanned form) → the AI turns it into a **structured, verified record** (schema-validated extraction; retrieval with citations over a real corpus; or a classical prediction/classification model) → it is **routed to the right frontline institution** (barangay hall, health station, LGU office, cooperative, school) into a **human-in-the-loop review queue** → and the loop **closes back to the person** (SMS/push confirmation with what happens next). Two roles, one golden path.

Why this archetype, across any sub-theme:
- It is what AppCon has historically rewarded: closed loop, multi-stakeholder, mainstream pain, institutional adoption story ([02](02-past-winners-analysis.md), [04](04-winning-patterns.md)).
- AI is genuinely core (extraction/matching/prediction *is* the product) → Relevance and Technical Innovation ([03](03-judging-criteria-decoded.md)).
- It mirrors OTis's own product line (AI that drafts records from raw inputs for non-technical staff; "make your work easier") ([OTis works page](https://otis.company/works)) — so OTis judges will recognise it as "real".
- It is buildable in ~30 working hours by 3 devs with a pre-agreed stack, and it demos on a shared screen: speak/upload → watch structure appear → watch the phone buzz.
- The **creativity lever sits at the input channel and the mechanism** (voice-first for elders, camera-first, SMS/USSD reach, incentive points, an agent that calls tools), which is cheap to make bold.

Past-winner lens check: every Grand Winner was **public-facing** (commuters, jobless people, citizens near an accident, people with bottles). So the **demo must open with the citizen's moment** — the voice note, the photo — not with a staff dashboard. The dashboard appears for 15 seconds to prove the loop, then the phone buzzes.

Judge lens check: two roles in a 5-minute pitch is feasible only if role 2 is shown as a **status board with one click**, not a second walkthrough.

## 2. Pre-decisions to make tonight (so the team spends zero minutes debating)

**Default stack (choose this unless the matched devs strongly share something else):**
- One language end-to-end: **TypeScript**. Next.js (App Router) + Tailwind + shadcn/ui for both roles; Route Handlers or a small Hono/Express service as the API.
- AI layer: **Vercel AI SDK** (`generateObject` for schema-validated structured output with Zod), provider-agnostic so you can swap **Gemini ↔ OpenAI ↔ Anthropic** behind an env var — a Google Developer Group is a community partner, so Gemini credits are plausible **[UNCERTAIN]** ([primer slide 1](https://www.canva.com/design/DAG-QGNyPF4/CBOk-pFxBwUieoTgo0rMtA/view)).
- Speech-to-text: provider STT (OpenAI Whisper/gpt-4o-transcribe, Gemini audio, or Deepgram) — test one Taglish sentence tonight.
- Data: **Supabase Postgres + pgvector** (retrieval) or SQLite + a JSON embedding index for zero-ops; Drizzle/Prisma optional.
- Notifications: **Semaphore** SMS (PH gateway; ₱0.56 per 160-char SMS; `POST https://api.semaphore.co/api/v4/messages` with `apikey, number, message`) ([Semaphore docs](https://semaphore.co/docs); [pricing](https://www.semaphore.co/)) — plus a **simulated inbox** component so the demo works even with zero credits.
- Classical model (only if the idea needs prediction/classification): Python + scikit-learn/XGBoost, trained offline on an open dataset, exported and served as a tiny FastAPI endpoint or precomputed table. One dev only.
- Deploy: Vercel (web + API routes), Supabase (DB); keep `ngrok` as fallback for local demos.
- Evals: `ai/evals/cases.jsonl` (input → expected fields) + `ai/evals/run.ts` printing exact-match/F1 per field and p50 latency; results pasted into README.

**The "one hard thing" rule:** pick exactly one of (a) retrieval with citations over a real PH corpus, (b) multimodal input (voice/photo) with structured extraction, (c) a classical prediction model on real data, (d) an agentic multi-step workflow with tool calls. Everything else is a plain LLM call with a schema. Teams that attempt two hard things in 72 hours ship neither.

**Chassis to prepare tonight** (skeleton only — check the participant email for any "no pre-written code" rule **[UNCERTAIN]**; if pre-work is disallowed, prepare these as private notes and re-type them live):
- Repo layout: `apps/web`, `apps/api` (or Route Handlers), `ai/{prompts,evals,schemas}`, `data/`, `docs/`; README skeleton with Mermaid architecture + pipeline blocks; `.env.example`; GitHub Actions (lint, typecheck, eval run); MIT `LICENSE`; `SECURITY.md` referencing [RA 10173](https://privacy.gov.ph/data-privacy-act/).
- Web shell: mobile-first, two-role switch (Citizen / Staff), empty/loading/error states, Taglish copy slots, an "AI confidence + sources + needs-review" component, a simulated SMS inbox component.
- API shell: upload endpoint → STT/vision → `generateObject` → Zod validation → DB → notification adapter; **response cache keyed by input hash** (so live demo inputs never wait on a cold model); PII redaction + prompt-injection filter middleware; timeouts and provider fallback.
- Pitch kit: 10-slide template ([07](07-pitch-and-demo-playbook.md)), OBS profile, Q&A doc.

## 3. Data kit (verified live)

| Source | What you get | Notes |
|---|---|---|
| [Open Data Philippines (data.gov.ph)](https://data.gov.ph/) | Cross-agency datasets catalog | Public domain unless stated |
| [PSA OpenSTAT](https://openstat.psa.gov.ph/) | Official statistics with API (PC-Axis) | Open license with attribution |
| [PAGASA TenDay Forecast API](https://tenday.pagasa.dost.gov.ph/static/media/api-doc.c9cf6abbaa781437ed96.pdf) | 10-day forecasts by region/province/municipality (PSGC), seasonal and climate-projection endpoints | **Token required — request it tonight**; fallback: scrape the public advisory page |
| [BetterGov Open Data Portal](https://data.bettergov.ph/) | Project NOAH flood/landslide/storm-surge hazard maps; hierarchical barangay boundaries GeoJSON | ODC-ODbL; large files — download tonight if disaster/geo themes are plausible |
| PSA Labor Force Survey, July 2026 | Unemployment 6.0% ≈ 3.14 million; underemployment 12.9% | via [BusinessWorld](https://bworldonline.com/top-stories/2026/09/09/775424/philippine-jobless-rate-rises-to-6-highest-in-four-years/), [Philstar](https://www.philstar.com/business/2026/09/09/2554903/jobless-rate-hits-4-year-high-july) |
| JICA Roadmap 2 (Greater Capital Region) | Metro Manila transport cost ₱3.5 billion/day (2017) → ₱5.4 billion/day by 2035 if nothing is done | [JICA final report PDF](https://openjicareport.jica.go.jp/pdf/1000041638_03.pdf); [JICA 2025 press](https://www.jica.go.jp/english/overseas/philippine/information/press/2024/rdsigningctmp02212025.html) |
| Agency PDFs for retrieval corpora | DOH clinical guidelines, DepEd MELCs, LGU Citizen's Charters (ARTA), TESDA course lists, DA price monitoring | Download 10–30 PDFs for the drawn category during the idea sprint; document provenance in `data/README.md` |
| Your own samples | 30 real voice notes/photos/texts from teammates and friends | Consented, anonymised; this is the eval set |

## 4. Impact model template (fill during the idea sprint; put on slide 7)

`Impact per year = (# of frontline units) × (cases per unit per day) × (minutes saved or errors avoided per case) × (₱ value per minute or per error) × 250 days`

Worked shape (replace with the drawn category's numbers): ~42,000 barangays × 10 cases/day × 8 minutes saved × ₱2/min ≈ ₱1.7 billion/year of frontline time — take the barangay and LGU counts from the [PSA Philippine Standard Geographic Code](https://psa.gov.ph/classification/psgc/) and the wage rate from DOLE, and say "order of magnitude, not a forecast". Close with the replication line OTis rewarded in 2024 — "global impact potential" ([LinkedIn, Neypes](https://www.linkedin.com/posts/jlrnrph_hala-totoo-ba-panalo-tayo-maam-we-did-activity-7346357023657140224-uiQz)): the same office and form exist in every LGU, so the pilot copies without re-engineering. Add the **cost side**: LLM tokens per case × current provider price ≈ ₱ per 1,000 cases, and SMS at ₱0.56 each ([Semaphore](https://www.semaphore.co/)). Judges score Sustainability; a cost line is worth more than a bigger impact number.

## 5. Idea bank by likely sub-theme category

Categories are inferred from AppCon's own awardees and Top-20 entries ([winners page](https://appcon.otismanila.com/winners)) and OTis's stated social issues "traffic, poverty, inequality, garbage" ([OTis 2019 release](https://otis.company/archives/915)). For each: the recommended build (fits the archetype), the bold lever (Creativity), data you can get in hours, the eval you can show. Ranked within each category by our estimate of win probability × buildability.

### A. Transport / mobility / road safety (won 2019, 2022, 2024)
1. **"Sakay Signal"** — commuter sends a Taglish voice note ("Pauwi ako galing Cubao papuntang Bacoor, gabi na") → AI extracts origin/destination/time → multimodal route + fare options + current advisory → SMS with the best option; dispatcher board shows demand by corridor. Hard thing: (b) voice → structured extraction. Data: LTFRB fare matrices, open Metro Manila route datasets on GitHub, MMDA advisories, JICA cost figure for the problem slide. Eval: origin/destination extraction accuracy on 30 voice notes. Bold lever: SMS-only mode for no-data users.
2. **Dashcam/CCTV incident triage** — upload a clip → vision model drafts a structured incident report + severity → nearest station queue (TRAVIS successor, software-only). Data: public dashcam clips. Eval: precision on 20 clips.

### B. Health access (Best Product magnet)
1. **"Barangay Health Copilot"** — a BHW records a home visit by voice in Taglish → structured FHSIS-style record + danger-sign flags (retrieval over DOH guideline PDFs, with citations) → follow-up scheduled → household gets an SMS. Hard thing: (a) retrieval with citations. Eval: field extraction on 20 visit notes + citation correctness. Bold lever: feature-phone call-in transcription.
2. **Medication label reader** — photo of a prescription/box → plain-Taglish instructions + reminders + counterfeit-alert heuristics (LunasTalaan lineage).

### C. Disaster and climate resilience (largest Top-20 cluster)
1. **Flood-report triage** — residents send photo + location → vision model estimates passability/depth class, dedupes reports → LGU dispatch list → residents get SMS routing to open evacuation centres. Data: PAGASA TenDay API, Project NOAH hazard maps, barangay GeoJSON, DSWD evacuation lists. Hard thing: (b) photo classification with structured output. Eval: passability class on 30 labelled images. Bold lever: voice SOS in dialect.
2. **Relief-goods demand forecaster** — per-barangay relief needs from population × hazard × prior reports (classical model, hard thing (c)).

### D. Waste and environment (won 2023; Most Creative ×3)
1. **"Basura Buddy"** — photo → material class + nearest junkshop price + points → LGU hotspot map (SnapTrash + ReVendo without hardware). Data: LGU MRF lists, junkshop price boards you photograph today. Eval: classification on 30 photos. Bold lever: barangay leaderboard and redeemable points.

### E. Agriculture and fisheries (Excellence 2023, 2024)
1. **"Ani Advisor"** — farmer sends leaf photo + voice question → diagnosis + PAGASA forecast → action plan; cooperative board aggregates outbreaks. Data: PAGASA API, DA price monitoring, PlantVillage images. Eval: top-3 disease accuracy. Bold lever: Messenger/SMS-first.
2. **Fish-kill early warning** from public water-quality + weather data (AquArdent, software-only).

### F. Employment, livelihood, gig economy (6 awardees; unemployment 6.0% in July 2026)
1. **"Trabaho Match"** — job seeker speaks skills in Taglish → structured skills profile → matched to TESDA courses / local openings → application drafted; employer side verifies documents. Data: TESDA course lists, PhilJobNet/DOLE postings, PSA LFS figure for the problem slide. Eval: match relevance on 20 profiles. Bold lever: mock-interview coach with scoring (STEPJOB lineage, Best Technology 2019).

### G. Education and youth
1. **"Guro Copilot"** — teacher uploads a DepEd MELC/lesson → differentiated Taglish materials + quiz + parent SMS summary. Data: DepEd MELCs, curriculum guides. Eval: quiz-item validity checklist. Bold lever: student read-aloud fluency scorer.

### H. Governance, civic services, transparency
1. **"Serbisyo Tracker"** — citizen photographs a document/complaint → AI classifies to the right office using the LGU **Citizen's Charter** (retrieval with citations) → request drafted, SLA tracked, status SMS; LGU backlog board. Eval: routing accuracy on 30 complaints. Bold lever: agent that fills the actual form PDF.

### I. Financial inclusion / MSMEs
1. **"Tindahan Ledger"** — sari-sari owner speaks or snaps sales → ledger + cash-flow forecast + lender-ready summary. Data: PSA CPI, DTI price guides. Eval: line-item extraction accuracy.

### J. Mental health and social support (Mood.ly, Folderly, WemInd)
1. **Peer-support triage** with strict safety guardrails and human handoff. Pick only with a domain-aware teammate; frame as assistive.

### K. Accessibility / PWD / seniors (PARA PO, E-Dikta)
1. **Voice-first "Kuya Bot"** — reads documents aloud in Filipino, fills government forms from speech, texts a caregiver. Data: PhilSys/SSS/PhilHealth form PDFs. Eval: form-field fill accuracy.

### L. Tourism, culture, language (DAILEKTO 2024)
1. **Dialect learning/translation assistant** with community audio — bold but weaker on Impact; pair with a livelihood angle (tour guides) if drawn.

## 6. Selection procedure after the draw (90 minutes, timed — run it during Speaker Sessions)

1. **0–15 min** Read the sub-theme aloud; paste it verbatim into the charter and README. Each member writes 3 pains they have personally seen in that category (specific person, specific moment). Post in the channel.
2. **15–35 min** Cluster; keep the 3 pains a Japanese executive and a Filipino professor would both recognise instantly. Write each as: "*[Person]* sends *[messy input]* → AI *[structures/predicts/matches]* → *[institution]* acts → *[person]* gets *[SMS]*."
3. **35–55 min** Score each 1–5 on: judge recognisability · AI necessity (delete the model — does it die?) · 30-hour buildability with the default stack · data confirmed available *now* (D3 checks live) · demo wow. Kill anything <3 on buildability or data.
4. **55–75 min** Pick one. Choose the **one hard thing**. Write the golden path as 6 screens/steps. Assign owners. Write the "done" definition: *works on the deployed URL from a clean browser with the scripted inputs, twice in a row.*
5. **75–90 min** Leader posts "DECISION: scope freeze" in writing. UX starts the flow; D1 scaffolds; D2 wires API + deploy; D3 harvests data and drafts the schema + prompts; PD hunts the problem statistic with a source.

Tie-breakers: prefer the pain with a **real public dataset** and a **two-role loop**; prefer the lever that is **boldest at the input channel** (voice/SMS/camera) rather than in backend complexity. Then write **the one sentence you want a judge to repeat to another judge an hour later** ([Kurbaitaev](https://dev.to/kurbaitaev/what-judges-actually-score-notes-from-a-year-of-hackathon-judging-3p4l)) and check every later scope decision against it. Pivot deadline: none after Day 1 22:00 — "pivoting after hour 12 … is almost always fatal" ([lablab guide](https://lablab.ai/guide/how-to-win-an-ai-hackathon)).

Levers that won Philippine AI hackathons in 2025–2026 and fit any category ([04 §4.19](04-winning-patterns.md)): Filipino-language and offline/low-end-Android operation; reusing infrastructure that already exists (CCTV, barangay records, LGU forms); document understanding for consumer protection; access to government services for seniors; cheap-signal decision support; an agent that *acts* (books, files, negotiates) rather than a dashboard that reports.

## 7. Directions to avoid

- "AI chatbot for X" with a single prompt, no retrieval, no schema, no eval — loses Technical Innovation and Originality.
- Anything needing hardware, real IoT, or field deployment to be credible.
- Blockchain-first ideas (two past awardees, but it dilutes the AI-core requirement and no longer signals innovation).
- Sensitive domains (clinical diagnosis, suicide prevention, legal advice) without a domain-aware teammate; if drawn, frame as assistive with human review and escalation.
- More than two user roles, or more than one hard AI component.
- A dashboard-first demo. Open with the citizen's moment.
