# 03 — Judging criteria decoded

Official rubric for AppCon 2026 (100 points) from the [site's Judging tab](https://appcon.otismanila.com/about):

| Category | Weight | Sub-criteria (points) |
|---|---|---|
| Product | 35 | Relevance 5 · Impact & Value 10 · UI/UX Design 10 · Maintainability & Sustainability 10 |
| Technology | 30 | Functionality 15 · Technical Innovation 15 |
| Creativity | 20 | Originality 10 · Innovation in Design 10 |
| Presentation | 15 | Clarity & Storytelling 10 · Demo & Delivery 5 |

Also official: code goes to an organizer-provided GitHub repo; "source codes are used to evaluate the application from the point of the Technology criteria"; a separate ₱10,000 **Best in Pitching** prize exists ([site](https://appcon.otismanila.com/about)).

## 1. Read the rubric as a judge would

Hackathon judges typically score ~20 teams in one sitting with a few minutes each; scores cluster in the middle unless something is clearly strong or clearly broken. Two consequences:

1. **Avoid zeros.** A criterion where you show *nothing* (no README → Maintainability; demo crash → Functionality and Demo) costs more than a criterion where you are merely average.
2. **Make each criterion visibly scoreable** in the pitch and the repo. If a judge has to infer your "maintainability", you get the median; if you show a one-slide architecture diagram + tests + README, you get the top band.

The weights say the organizers care most about **Product (35)** and **Technology (30)**, and they deliberately split "working" (Functionality 15) from "clever" (Technical Innovation 15). Presentation is only 15 — but it is the *channel* through which every other criterion is perceived in a virtual event, and it carries its own ₱10k prize.

## 2. Criterion-by-criterion decode and evidence plan

### Product — 35

**Relevance (5).** Does the project fit (a) the AI-core theme and (b) the drawn sub-theme, and address a Philippine social issue? Evidence: state the sub-theme verbatim on slide 1; one sentence "AI is the core because X cannot work without the model"; a real statistic about the problem with a source (PSA, DOH, PAGASA, LTFRB, DepEd, DOLE, MMDA). Historically AppCon frames social issues as "traffic, poverty, inequality, garbage" ([OTis 2019 release](https://otis.company/archives/915)).

**Impact & Value (10).** Who benefits, how much, how soon. Evidence: a named user (barangay health worker, jeepney driver, fisherfolk in Pangasinan, OFW family), a quantified before/after (minutes saved, cases caught, pesos recovered), and a deployment path (which LGU/agency/NGO would run it). Past champions ended their story with agency pilots (DOTr/LTFRB/MMDA for TransiTech) ([Corner Magazine](https://www.cornermagazineph.com/2025/07/05/grand-winner-of-appcon-2024-competition-transitech-smart-transportation-management-system-project-wins-top-prize/)). Use verified national numbers for scale — e.g., unemployment 6.0% / 3.14 million in July 2026 ([PSA via BusinessWorld](https://bworldonline.com/top-stories/2026/09/09/775424/philippine-jobless-rate-rises-to-6-highest-in-four-years/)); Metro Manila transport cost ₱3.5 billion/day ([JICA](https://openjicareport.jica.go.jp/pdf/1000041638_03.pdf)) — then bring it down to one person's day. The impact-model template is in [05 §4](05-candidate-ideas-ranked.md). The only judge-feedback phrase on record praises **"global impact potential"** ([LinkedIn, Neypes](https://www.linkedin.com/posts/jlrnrph_hala-totoo-ba-panalo-tayo-maam-we-did-activity-7346357023657140224-uiQz)): show that the solution replicates beyond one barangay/city (every LGU has the same office; the same pattern applies in other ASEAN cities or in Japan's ageing-society services — one sentence, no overreach).

**UI/UX Design (10).** The one criterion your UI/UX teammate owns end-to-end. Evidence: consistent design system (shadcn/ui or Material 3), mobile-first layouts (most Filipino users are mobile), Taglish/Filipino copy where the user would expect it, accessible contrast/size, empty/loading/error states, and the AI's uncertainty shown honestly (confidence, sources, "I'm not sure" fallback). Show a 20-second screen-recorded flow, not static mockups.

**Maintainability & Sustainability (10).** Two meanings, cover both: (a) engineering maintainability — readable structure, README, `.env.example`, seed data, tests, CI badge, architecture diagram, clear AI pipeline; (b) real-world sustainability — who pays/operates it, cost per user (LLM cost per 1,000 requests), offline/SMS fallback, data privacy (Data Privacy Act of 2012 — RA 10173 — is the reference judges will recognize; cite in the deck as [RA 10173](https://privacy.gov.ph/data-privacy-act/)). This is the most neglected 10 points in hackathons — see §4. Two calibration points: Philippine social-enterprise judging (BPI Sinag) weights Scalability 20 and Sustainability & Adaptability 20 with questions like "Is the market enough to sustain the enterprise's operations?" ([BPI Sinag briefer](https://www.bpisinagbootcamp.com.ph/briefer)); and research finds continuation depends on "skill diversity … and their intention to expand the reach of a project" rather than effort ([Nolte et al. 2020](https://doi.org/10.1145/3415216)) — so name the owner and the next pilot, and show the five roles on the team slide.

### Technology — 30

**Functionality (15).** Does it work, end to end, live? The single largest sub-criterion. Evidence: a live demo of the primary flow with real inputs; a pre-recorded backup video; a deployed URL judges can open themselves; no "this part is mocked" on the golden path. In a virtual event the judges only see your screen — so screen-share quality *is* functionality.

**Technical Innovation (15).** This is where source-code review bites. Judges will look for: a real AI pipeline (retrieval + generation, multimodal input, structured outputs, tool use/agents, fine-tuned or classical model where appropriate), evaluation (even a 20-example golden set with accuracy), guardrails (schema validation, prompt-injection checks, PII redaction), and sensible engineering (typed code, separation of concerns). A chat wrapper around one prompt will score in the low band here regardless of the UI. Note the judges' reference class: every AI winner so far was **applied ML with a metric** (k-NN at 84% on MMDA tweets in 2019; YOLO + XGBoost in 2023–2024) ([02 §1](02-past-winners-analysis.md)) — a reported accuracy/latency table is the fastest way to be read as "real AI" by this panel. This matches where AI-hackathon rubrics have gone in 2025–2026: "meaningfully integrated (not just a chatbot wrapper)" and "only became possible with this generation of AI models" ([lablab guide](https://lablab.ai/guide/how-to-win-an-ai-hackathon)); a Technical Depth scale whose lowest anchor is "Basic wrapper around existing tools" ([Seoul 2026 rubric](https://github.com/Two-Weeks-Team/seoul-26th-april-hack-judges/blob/refs/heads/main/docs/official-track-rubrics.md)); and PH winners quoting numbers ("91% accuracy and works fully offline") ([Impact Hub Manila](https://impacthub.ph/article-ai-for-good-2026.html)). One human-in-the-loop safety mechanism visible in the demo also reads as technical maturity — the DICT jury chair's phrase was "keep humans in the loop" (same source).

### Creativity — 20

**Originality (10).** Is the idea new to the judges? Not "novel in the world" — novel relative to the other ~19 teams and past AppCon entries (see [02](02-past-winners-analysis.md)). Evidence: name the obvious solution and say why you did not build it; pick a specific under-served user segment or an unexpected data source (e.g., CCTV → wait times; Facebook Marketplace posts → price indices; barangay blotter → hotspot maps).

**Innovation in Design (10).** Design here likely means solution design/interaction design, not visuals (visuals are under UI/UX). Evidence: a non-obvious mechanism — incentives (ReVendo's points), a new interface (voice-first for elders, SMS/USSD for offline, camera-first for illiterate users), or a novel workflow (human-in-the-loop verification queue for barangay staff).

### Presentation — 15

**Clarity & Storytelling (10).** Problem → person → insight → solution → proof → ask, in the allotted minutes, with one voice per section, no jargon walls. **Demo & Delivery (5).** Smooth, rehearsed, audible, visible; handles Q&A crisply. Best in Pitching (₱10k) almost certainly draws from these two plus judges' overall impression — treat the pitch as a product in itself ([07](07-pitch-and-demo-playbook.md)).

## 2b. What loses points (judge's-eye view)

Judges score ~20 teams in one afternoon and calibrate **relative to the field**, not to an ideal. The fastest way to drop a band on each criterion:

| Criterion | Typical band-dropper |
|---|---|
| Relevance | Sub-theme never named; AI is a garnish ("we also added a chatbot") |
| Impact & Value | "Millions of Filipinos" with no named user, no number, no adopter |
| UI/UX | Desktop-only layout shown on a phone-first problem; raw JSON on screen; no loading/error states; English-only copy for a barangay user |
| Maintainability & Sustainability | Empty README; secrets in git; one 2,000-line file; no answer to "who pays for the tokens?" |
| Functionality | Live demo stalls or errors; "imagine this works"; features shown only in slides |
| Technical Innovation | Single prompt + UI; no evals; no guardrails; no data; hard part is a mock |
| Originality | The idea a judge would list first for that sub-theme; a clone of a known app |
| Innovation in Design | Web form → table → done; no mechanism, no new interface |
| Clarity & Storytelling | Market-size opener; three people talking over each other; jargon wall; over time |
| Demo & Delivery | Reading from notes; tiny fonts; debugging on camera; no backup |

## 3. Where points are cheap and where they are expensive

| Cheap points (low effort, high certainty) | Expensive points (high effort or high variance) |
|---|---|
| Relevance 5 — state theme + statistic (30 min of work) | Technical Innovation 15 — needs real pipeline + evals (day-2 focus) |
| Maintainability 10 — README, diagram, `.env.example`, tests, cost model (2–3 hours, mostly docs) | Originality 10 — depends on idea selection in the first 3 hours |
| Demo & Delivery 5 — rehearse 3×, record backup (2 hours) | Impact & Value 10 — needs a credible user + numbers + deployment path |
| UI/UX 10 — design system + mobile-first + states (your designer's whole job) | Functionality 15 — the golden path must not break live |

A team that secures the cheap column (≈30 points at high confidence) and executes one hard thing well (Functionality) is already ahead of most hackathon teams, who typically leave Maintainability and Demo at the median.

## 4. How the code review likely works (and what to put in the repo)

The rule says source code informs the **Technology** criteria ([site](https://appcon.otismanila.com/about)). With ~20 repos and limited time, reviewers will realistically: open the README, glance at the tree, open the AI/service layer, check commits. Optimize for that first 3 minutes:

0. **Commit history that narrates the build.** A 2026 judge: "The first thing I check is `git log --oneline` … A project with two commits … I have no evidence of iteration" ([HackerNoon](https://hackernoon.com/the-git-log-never-lies)); "an empty repo with one final push raises red flags" ([lablab guide](https://lablab.ai/guide/how-to-win-an-ai-hackathon)). Small commits from all five members from hour 1; never squash the event into one push.
1. `README.md`: what/for whom/sub-theme; architecture diagram (Mermaid renders on GitHub); AI pipeline diagram; how to run in 3 commands; demo URL + video link; team roles; evaluation results table; known limitations; roadmap; license; **AI-assisted-coding disclosure** (which tools; MLH's standard rules require this and it costs nothing — [MLH rules](https://github.com/MLH/mlh-policies/blob/main/standard-hackathon-rules.md)). Keep every README claim literally true — automated auditors now diff pitch claims against code ([Devfolio](https://devfolio.co/blog/the-discerning-machine/)).
2. Top-level layout that reads as a product: `apps/web`, `apps/api` (or `src/`), `ai/` (prompts, evals, datasets), `infra/`, `docs/`.
3. `ai/evals/` with a small golden dataset and a script that prints accuracy/latency — even 20 cases signals rigor no other team will show.
4. Guardrails visible in code: Pydantic/Zod schemas for model output, prompt-injection filter, PII redaction, rate limiting, timeouts and fallbacks.
5. Meaningful commit history from all three devs (matching is curated; judges may check contribution spread).
6. `.env.example`, `docker-compose.yml` or one-command dev script, CI running tests/lint (GitHub Actions badge).
7. No secrets committed; a `SECURITY.md`/privacy note referencing RA 10173 if you touch personal data.

Note the organizer "has the right to use the submitted code … for marketing and sponsors" ([site](https://appcon.otismanila.com/about)) — do not include third-party code you cannot license, and keep proprietary keys out.

## 5. Scoring simulation — what a Grand Winner profile looks like

Illustrative target bands for a winning submission (our judgment, not official):

| Criterion | Target | How |
|---|---|---|
| Relevance | 5/5 | verbatim sub-theme + stat + AI-core sentence |
| Impact & Value | 8–9/10 | named user, quantified outcome, agency/LGU deployment path, cost per user |
| UI/UX | 8–9/10 | design system, mobile-first, Taglish copy, honest AI states |
| Maintainability | 9/10 | repo checklist §4 fully done |
| Functionality | 13–14/15 | live golden path + deployed URL + backup video |
| Technical Innovation | 11–13/15 | real pipeline + evals + guardrails + one genuinely hard component |
| Originality | 7–9/10 | unexpected angle chosen in idea sprint |
| Innovation in Design | 7–9/10 | mechanism/interface innovation |
| Clarity & Storytelling | 9/10 | rehearsed narrative |
| Demo & Delivery | 5/5 | rehearsed, recorded backup |
| **Total** | **≈82–91** | |

Most hackathon teams land 55–70 because they leave Maintainability, Demo, and Evals at the median and lose Functionality points to a live failure.
