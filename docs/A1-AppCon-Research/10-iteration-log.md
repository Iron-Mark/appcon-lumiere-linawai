# 10 — Iteration log

Method: write a full draft, then critique it from six deliberately different lenses (judge, past winner, organizer/sponsor, technical builder, pitch/demo coach, business/impact), let the lenses argue, rewrite. Three passes minimum. This file records what changed and why.

## Iteration 1 — first full draft

Inputs: official site content (extracted from the SPA bundle), OTis Facebook posts (via post permalinks and a rendered browser session), the Canva sponsorship primer, OTis Japanese press releases and product pages, press/school/LinkedIn coverage of 2023–2024 winners.

Key discoveries that reshaped the draft before it was even finished:
- The event is **not** the months-long contest the site's history describes; it is a **3-day virtual hackathon starting Sep 23** with curated stranger teams and a **lottery sub-theme**. The whole plan therefore had to become theme-agnostic and hour-by-hour.
- The rubric is public and specific; **source code is reviewed** — so repo quality is a scored deliverable.
- OTis's business motive (talent pipeline to Japan; practical AI for non-technical users) is documented in Japanese press releases — this shaped the recommended archetype.

Delivered: 01–09 + README + this log.

Known gaps at end of iteration 1 (queued for iteration 2):
- Comparable hackathons and the "what wins hackathons" literature are summarized in [04 §4](04-winning-patterns.md) from practitioner consensus without per-claim citations; a dedicated research pass is in progress and will be merged with URLs.
- Past-winner deep-dive (judges' names, per-award prize amounts across all editions, any repos/demo details) is in progress.
- The postponement post and the reason for going virtual remain unverified.

## Iteration 2 — multi-lens critique and rewrite

Critique, lens by lens, and what changed:

**Judge lens.** "I score 20 teams relative to each other in one afternoon; tell me how each team *loses* a band, not just how to earn one. And two roles in five minutes is too much." → Added [03 §2b](03-judging-criteria-decoded.md) "What loses points" table; added the relative-scoring note; role 2 is now shown as a one-click status board ([05 §1](05-candidate-ideas-ranked.md)). Impact evidence now cites verified national numbers (PSA July 2026 LFS; JICA ₱3.5B/day) instead of placeholders.

**Past-winner lens.** "Every Grand Winner was public-facing; your 'frontline copilot' sounds like a back-office tool — a Matsuri crowd wants the citizen's moment." → Archetype re-centred: the citizen's voice note/photo is the star, the institution copilot is backstage; demo must open with the citizen ([05 §1](05-candidate-ideas-ranked.md), [07 §1b](07-pitch-and-demo-playbook.md) cold open). Kept the closed loop, which is the historical constant.

**Organizer/sponsor lens.** "OTis is recruiting and showcasing; sponsors were asked for GenAI tooling and can buy named awards." → Added patterns 8–9 in [04 §3](04-winning-patterns.md) (you are being recruited; use sponsor tools visibly), Day-1 question list for organizers ([06 §2a](06-strategy-and-execution-plan.md)), marketing-ready README guidance, Japanese-business-norm delivery notes.

**Technical builder lens.** "Day 1 asks for voice + retrieval + classical model + deploy by 22:00 — that's three hard things; and 'choose a stack' with strangers burns an hour." → Introduced the **one-hard-thing rule** and a **default TypeScript stack** with provider-agnostic AI SDK, Supabase/pgvector, Semaphore SMS + simulated inbox, response cache keyed by input hash ([05 §2](05-candidate-ideas-ranked.md)); Day 1 now builds the text/photo path only, voice moves to the Day-2 bold-mechanism sprint ([06 §3](06-strategy-and-execution-plan.md)); added the first-hour-with-strangers script ([06 §2b](06-strategy-and-execution-plan.md)) and STT-failure and sponsor-tool risks ([08](08-risks-and-pitfalls.md)).

**Pitch/demo coach lens.** "No scripts, no cold open, no plan for when the lead speaker's connection drops, no 3-minute variant." → Added [07 §1b](07-pitch-and-demo-playbook.md) (one-sentence pitch formula, cold open, person slide, AI-core sentence, adoption sentence, closing line, 3-minute cut), redundancy rules (backup speaker/driver on a different ISP), and the post-pitch chat template.

**Business/impact lens.** "Impact claims were hand-wavy; sustainability had no cost line; data sources were named but not verified." → Added the impact-model formula with a cost side ([05 §4](05-candidate-ideas-ranked.md)), a verified data kit with live URLs and access caveats (PAGASA token; NOAH file sizes) ([05 §3](05-candidate-ideas-ranked.md)), and new sources in [09 §D](09-sources.md).

**Where the lenses disagreed and how it was resolved.** Builder wanted the safest possible product (text-only, one role); past-winner and organizer lenses wanted boldness and a two-role loop. Resolution: golden path is text/photo + two roles (role 2 as a status board), boldness is time-boxed to a 90-minute Day-2 sprint with an honest downgrade path. Judge lens wanted more rubric-mapping in the pitch; coach lens warned against reading the rubric aloud. Resolution: give judges the rubric's *words* (sub-theme, "AI is the core", "runs on ₱x per 1,000 cases") inside the story, never as a checklist slide.

Still open for iteration 3: merge the comparable-hackathon and what-wins literature with per-claim citations into [04 §4](04-winning-patterns.md) and [09 §E](09-sources.md); merge any new past-winner facts (judges, prize tiers); final consistency pass on cross-references and uncertainty flags.

## Iteration 3 — research merge and final pass

### Part 1 — past-winner deep-dive merged

A dedicated research pass on every awardee 2019–2024 (rosters, stacks, prizes, press, school news, LinkedIn, repos) was merged. Spot-verified before merging: the coach's account of OTis's feedback on the 2024 winner and AMA's report of the 2023 Best Technology prize and funnel.

What changed and why:
- **[02](02-past-winners-analysis.md)** rewritten: build details per Grand Winner (MMARRS's k-NN at 84% on MMDA tweets and IEEE papers; ReVendo's YOLOv8/Raspberry Pi stack; TransiTech's roster and stack), the **only recorded judge feedback ("global impact potential")**, the **ordered-ranking inference** (Excellence = 1st runner-up, Best Technology = 3rd place, Best Product = top 5), Best Technology ₱30,000 (2023), Most Creative going to the concept despite immature AI, thesis-reuse norm, team sizes 2–10, recurring advisers, **the hiring funnel (five past participants later at OTis; Top-20 interviews with OTis Japan leadership)**, named OTis leaders (president Omiya, COO Lecias), candidate identities of the CKC/LIEH sponsors, and the **2022 date conflict** on the official site.
- **[01](01-event-overview-and-rules.md)**: organizer section now names the founder and COO and the no-published-judges fact; prize economics adds Best Technology ₱30k and the 2022 date caveat.
- **[03](03-judging-criteria-decoded.md)**: Impact & Value adds the "global impact potential" replication line; Technical Innovation notes the judges' reference class is applied ML with a metric.
- **[04](04-winning-patterns.md)**: patterns 9–10 (say "impact potential" and mean it; concept wins Creativity even with immature AI); replacements for the lost adviser and thesis-reuse advantages.
- **[05](05-candidate-ideas-ranked.md)**: impact model cites PSGC for LGU/barangay counts and closes with the replication line.
- **[07](07-pitch-and-demo-playbook.md)**: impact-potential sentence for slide 7.
- **[09](09-sources.md)**: 20+ new sources; not-found list sharpened (no Grand Winner repos exist publicly; CKC/LIEH identities are inferred; one LinkedIn claim not re-verified).

Lens check on the merge: the *past-winner* lens strengthened the case for a measured model and a replication story; the *organizer* lens strengthened "you are being recruited"; the *judge* lens cautioned that a single second-hand quote is thin evidence — it is therefore used as one sentence in the pitch, not as a thesis.

### Part 2 — comparable hackathons and what-wins literature merged; final pass

A second research pass covered 20+ comparable Philippine/APAC events (AI Fest PH 2026, DICT Philippine Startup Challenge X, Impact Hub Manila AI for Good 2026, Alibaba Cloud PH 2025, Google APAC Solution Challenge 2025, GenAIus 2025, BPI Sinag, PLDT–Smart InnoGen, DEVCON/iThink, Byte Forward, AWS Innovation Cup, Imagine Cup, Hack&Roll, Devpost/lablab/Seoul AI rubrics) and the judging literature (Devpost/MLH/JetBrains/lablab/AngelHack guides, judges' essays, Nolte et al. 2020, Falk et al. CHI 2025, Imam Mahmoud et al. 2022). Five load-bearing sources were re-fetched and quote-checked before use (Kurbaitaev; JetBrains; lablab; Impact Hub Manila; Falk et al.).

What changed and why:
- **[04 §4](04-winning-patterns.md)** rewritten from seven uncited "consensus" bullets into 20 cited principles in four groups (how judges score; AI-specific; team/continuation/format research; what PH AI winners looked like in 2025–26), including an explicit **"where the literature and AppCon disagree"** item (generic judges ignore UI polish and code quality; AppCon scores both).
- **[03](03-judging-criteria-decoded.md)**: Sustainability calibrated against BPI Sinag's weights and Nolte et al.'s continuation findings; Technical Innovation tied to the "not a wrapper" rubric anchors and PH winners' metrics; repo checklist gains item 0 (commit history as evidence) and an AI-tool disclosure line.
- **[05](05-candidate-ideas-ranked.md)**: selection procedure ends with "the one sentence a judge will repeat" and a hard pivot deadline; levers that won PH AI hackathons in 2025–26 added to the tie-breakers.
- **[06](06-strategy-and-execution-plan.md)**: new §3a "Milestones that must not slip" (identity sentence by 12:30, skeleton by 15:30, first real AI call by 18:30, last pivot 22:00 Day 1, integration freeze ≥6 h and final recording ≥3 h before cut-off) cross-checked against 72-hour guides; "cut immediately" list; 2-hour rule and commit-cadence agreements.
- **[07](07-pitch-and-demo-playbook.md)**: cold open restructured to *input → identity sentence → person* to satisfy both "say what it is first" and "start with the problem"; demo-by-1:30 rule sourced; Q&A bank adds "what did you build this weekend", "what breaks first", "model/data/measurement".
- **[08](08-risks-and-pitfalls.md)**: late pivot, single-blob commit history, localhost-only demo, over-engineered AI chain.
- **[09 §E](09-sources.md)**: placeholder replaced with the curated, grouped source list (✔ marks re-verified items); §F gaps extended (no PH analogue publishes weights; no other Japanese-run PH hackathon found).
- **[README](README.md)**: status set to final; top findings extended with the converged judging rules.

Lens arguments in this pass and how they were settled:
- *Pitch coach* ("open with the person's story") vs. *judge* ("say what it is in the first sentence or I can't anchor the story"): settled by a 6-second real input, then a 10-second identity sentence, then a 30-second person — both satisfied inside 50 seconds.
- *Technical builder* ("clean architecture nobody sees is wasted at a hackathon", per JetBrains' judges) vs. *organizer* ("AppCon reviews the source and scores Maintainability"): settled by scoping code quality to what a reviewer sees in three minutes — README, tree, AI layer, commit log, tests — and nothing deeper.
- *Business/impact* ("bigger numbers") vs. *judge* ("specificity tells me whether you talked to anyone or guessed"): settled by one national statistic with a source, one named user, one cost line, one replication sentence.
- *Past-winner* ("two roles and a closed loop") vs. *literature* ("cut multiple user roles"): settled by keeping the loop but demoting role 2 to a one-click status board.

## Summary — what changed across the three iterations

| Area | Iteration 1 | Iteration 2 | Iteration 3 |
|---|---|---|---|
| Recommended direction | Frontline copilot, institution-first | Same loop, **citizen moment first**, role 2 as status board | Unchanged; plus "one sentence a judge repeats" and PH-winner levers |
| Stack and scope | Options listed | **Default TypeScript stack; one-hard-thing rule** | Pivot deadline; cut list; commit cadence |
| Rubric decode | Per-criterion evidence | **"What loses points" table**; verified stats | Calibrated against Sinag/Seoul/lablab rubrics; commit-history item; AI-tool disclosure |
| Execution plan | Hour-by-hour + night-before checklist | First-hour script; Day-1 organizer questions; proportional fallback; Day 1 narrowed to text/photo | **Milestones that must not slip** (cross-checked against 72-hour guides) |
| Pitch | Skeleton + protocol | **Scripts, cold open, 3-minute cut, redundancy** | Input → identity → person ordering; demo by 1:30; harder Q&A bank |
| Evidence base | Primary sources (site, FB, primer, OTis PRs, press) | + verified national stats and data portals | + past-winner dossier (rosters, prizes, hiring funnel, judge quote) + 20-event/literature dossier with 30+ cited sources |
| Uncertainty | Flags on dates/sponsors/pool | + STT/sponsor-tool risks | + explicit disagreements between literature and AppCon; not-found list extended |
