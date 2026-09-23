# 06 — Strategy and 72-hour execution plan

Format facts this plan is built on: 3-day **virtual** hackathon, **Wed 23 – Fri 25 Sep 2026**; phases **Theme Draw → Speaker Sessions → Hackathon Proper → Project Pitching → Awarding**; **teams of 5 (3 dev / 1 UI-UX / 1 product designer) formed by curated matching at the event**; **sub-theme drawn by the team leader by lottery**; **code pushed to an organizer-provided GitHub repo and reviewed**; rubric Product 35 / Technology 30 / Creativity 20 / Presentation 15 ([FB 22 Sep](https://www.facebook.com/OTisPhilippinesInc/posts/pfbid02P7CgGBvrezZc8huwZ6WZs46Amrat1G8f7WGsbhLSjHNDzCDRr3GuNhFi1zqgbMyvl); [site](https://appcon.otismanila.com/about)).

**Clock times below are assumptions** (typical PH virtual hackathon: opening ~09:00 PHT Day 1, submission ~12:00 Day 3, pitching afternoon Day 3, awarding evening Day 3). The real schedule is in the participant email. **First action tonight: overwrite the "Assumed" column with the emailed times.**

## 0. Strategy in one paragraph

Win Product and Technology with a **software-only, AI-core, closed-loop "frontline copilot"** inside the drawn sub-theme ([05 §1](05-candidate-ideas-ranked.md)); lock scope within 3 hours of the draw; build **one flawless golden path** on a deployed URL with real data and a 20-case eval; harvest the **cheap points** (Relevance, Maintainability, Demo) that other teams leave on the table ([03 §3](03-judging-criteria-decoded.md)); spend Creativity effort on the **input channel and mechanism**, not on backend complexity; and treat the pitch as a second product built on Day 2 and rehearsed three times ([07](07-pitch-and-demo-playbook.md)).

## 1. Night-before checklist (Tue 22 Sep, tonight)

Read first
- [ ] Re-read the Confirmation of Participation email and any rules/schedule/platform links; note: platform (Zoom/Meet/Discord), Day-1 start time, submission cut-off, pitch length, whether pre-written code/templates are allowed, repo hand-off procedure, judging panel if named.
- [ ] Fill the "Actual" column in §2 below with the emailed schedule. Set phone alarms: 30 min before each session, 2 h and 30 min before submission.
- [ ] Skim [03](03-judging-criteria-decoded.md) (rubric decode) and [05 §6](05-candidate-ideas-ranked.md) (90-minute selection procedure) so you can run them from memory tomorrow.

Accounts and tools (each member, 45 minutes)
- [ ] GitHub logged in; SSH keys work; `gh` CLI authenticated.
- [ ] Deployment accounts ready: Vercel (web), Render/Railway/Fly (API), or a single VPS; one teammate holds a funded LLM key (OpenAI/Anthropic/Gemini) and a second provider as fallback; check spending limits.
- [ ] SMS/notification: Semaphore (PH) or Twilio trial credits, or decide now to simulate SMS on-screen.
- [ ] Speech-to-text option tested with one Taglish sentence (e.g., Whisper API / Gemini / Deepgram); vision model tested with one photo.
- [ ] Local dev environment: Node LTS, Python 3.11+, Docker, VS Code/Cursor with AI assistant — the organizers explicitly expect AI-assisted coding ([primer slide 10](https://www.canva.com/design/DAG-QGNyPF4/CBOk-pFxBwUieoTgo0rMtA/view)).
- [ ] OBS or built-in recorder tested for a 1080p screen capture with mic.
- [ ] Second device (phone) able to join the call and show a received SMS/notification.

Chassis and kits (if pre-work is allowed — otherwise prepare *outside* the repo as notes)
- [ ] Repo template skeleton per [05 §2](05-candidate-ideas-ranked.md): monorepo layout, README skeleton with Mermaid blocks, `.env.example`, CI workflow, LICENSE, `SECURITY.md`, `ai/evals/` runner stub, `data/README.md` template.
- [ ] Deck template (10 slides, [07 §1](07-pitch-and-demo-playbook.md)) in Google Slides with the team's placeholder branding.
- [ ] Data bookmarks: data.gov.ph, PSA OpenSTAT, PAGASA, DOH, DepEd, LTFRB/MMDA, DA price monitoring, DSWD, Project NOAH, TESDA — one tab group.
- [ ] Idea bank ([05 §5](05-candidate-ideas-ranked.md)) open; add two ideas of your own per category from personal experience.

Personal
- [ ] Workspace: wired internet or tested hotspot; power bank/UPS if brownouts are common; headset; camera at eye level; quiet room for pitch day.
- [ ] Sleep ≥7 h. Food planned for three days. Tell family/employer your hours.
- [ ] Introduce yourself in the event channel tonight if it exists: role, stack, one-line "what I'm good at", timezone, hours — it improves the curated match and lets you find a compatible leader/team early.

## 2. Schedule anchors (fill in)

| Anchor | Assumed (PHT) | Actual (from email) |
|---|---|---|
| Day 1 opening / orientation | Wed 09:00 | |
| Team matching announced | Wed 09:30 | |
| Theme Draw | Wed 10:30 | |
| Speaker Sessions | Wed 11:00–13:00 | |
| Hackathon Proper starts | Wed 13:00 | |
| Day 2 check-in / mentoring (if any) | Thu 09:00 | |
| Submission cut-off (repo + deck + video) | Fri 12:00 | |
| Project Pitching | Fri 13:00–17:00 | |
| Awarding | Fri 18:00 | |

**If the real schedule differs, keep the proportions, not the clock times.** From "scope freeze" to "submission cut-off", budget: **10% choosing** (idea sprint), **55% building the golden path**, **20% hardening + repo/docs**, **15% pitch + rehearsal**. If hacking runs overnight (some virtual hackathons keep the clock running 24 h), still sleep ≥6 h per night — the plan's outputs per block hold, the wall-clock shifts.

### 2a. Six questions to ask the organizers on Day 1 (in the official channel, politely, early)

1. Is the pitch **live or pre-recorded**, how many minutes, and how long is Q&A?
2. What exactly must be **submitted** and by when (repo, deck, video, form)? Is a **deployed URL** expected?
3. How does the **organizer-provided GitHub repo** work — do we push to it, or do they clone ours? When do we get access?
4. Is **pre-existing code/templates** allowed, and must AI-generated code be disclosed?
5. Are there **sponsor special awards** this year and what are their criteria? Are any **sponsor tools/APIs/credits** provided (use them visibly if so — the primer asked sponsors for GenAI dev tooling ([primer slide 10](https://www.canva.com/design/DAG-QGNyPF4/CBOk-pFxBwUieoTgo0rMtA/view)))?
6. Who are the **judges** (names/affiliations) so we can pitch to their background (Japanese executives vs. PH academics vs. industry engineers)?

### 2b. First hour with strangers (script for the team-matching block)

1. **Round-robin (10 min):** name · role · stack you can ship in *tonight* · timezone/hours · one thing you built that worked · one thing you are bad at. PD writes a skills grid.
2. **Stack vote (5 min):** default is the TypeScript stack in [05 §2](05-candidate-ideas-ranked.md); override only if 2 of 3 devs share something else. No hybrid frontends.
3. **Decision rights (5 min):** PD owns scope and the deck; D1 owns technical architecture and is the only merger; UX owns UI decisions; D3 owns AI pipeline and evals. Disagreements: 10-minute timebox, then the owner decides. Leader (TL) is the tie-break.
4. **Rituals (5 min):** one channel; syncs at 09:00 / 15:00 / 22:00; "DECISION:" prefix; a ≤15-card board; commit at least once per block.
5. **Charter (10 min):** one page in `docs/charter.md`: goal, roles, decision rights, hours, golden path (to be filled after the draw), definition of done, sleep rule.
6. **Set up (25 min):** repo from the chassis, deploy pipeline green with "hello world", `.env` distributed via a password manager link (never in chat), everyone can run the app locally.

## 3. Hour-by-hour playbook

Roles used below: **PD** = product designer (also PM/scribe/data/pitch owner), **UX** = UI/UX designer, **D1** = lead dev (web/app + integration, sole merger), **D2** = backend/API dev, **D3** = AI/data/evals dev. **TL** = team leader (whoever the organizers designate, or PD by default). Roles per official composition ([site](https://appcon.otismanila.com/)).

### Day 1 — Wednesday 23 Sep (matching, draw, scope, skeleton)

| Time (assumed) | Block | What to do | Output |
|---|---|---|---|
| 08:00–09:00 | Pre-flight | Join platform early; camera on; post intro again; test screen share and mic | Green checks |
| 09:00–09:30 | Opening | One member takes notes on every rule mentioned verbally (submission format, judging, special awards); ask in chat: "Are sponsor special awards being given? Criteria?" and "Is the pitch live or recorded, and how long?" | Rules notes in `docs/rules-notes.md` |
| 09:30–10:30 | **Team matching** | First 15 min: names, roles, stacks, timezone, hours; **pick the stack the majority of devs know**; agree channel (Discord/Slack/Messenger) + one Kanban (GitHub Projects) + one Google Drive. Write the 1-page charter (goal, roles, decision rule: PD owns scope, D1 owns tech, UX owns UI; core hours; sync times 09:00/21:00). Create the team repo now (private, later mirrored to the organizer repo) | Charter, repo, board |
| 10:30–11:00 | **Theme Draw** | TL draws; everyone writes the sub-theme verbatim in the charter and the README title. Immediately start the 90-minute selection procedure ([05 §6](05-candidate-ideas-ranked.md)) — run it *during* speaker sessions with one member attending and summarizing | Sub-theme locked |
| 11:00–13:00 | Speaker Sessions + idea sprint | PD/UX attend one session each and summarize (speakers may hint at what judges value); D1–D3 run the selection procedure with PD facilitating in chat; D3 checks data availability for the top 3 candidates in parallel | Idea chosen by 12:30; golden path (6 steps) written; "done" definition |
| 13:00–13:30 | Scope freeze | TL posts scope freeze; PD creates ≤15 cards; UX starts low-fi flow in Figma (mobile-first); D1 scaffolds from chassis; D2 sets up API + DB + deploy pipeline; D3 starts data harvest + prompt/schema design | Cards, deploy pipeline green with "hello world" |
| 13:30–15:30 | Build sprint 1 — **text/photo path first** | D1: app shell, role switch, screens for steps 1–3; D2: upload endpoint, DB schema, notification adapter (simulated inbox first); D3: `generateObject` extraction with Zod schema on 5 real **text or photo** samples (voice comes Day 2 — STT adds a failure mode you do not need on Day 1); UX: hi-fi for golden path; PD: problem statistic with source + user persona + institution to adopt | Vertical slice: input → structured output visible in UI |
| 15:30–15:45 | Sync 1 | 10-minute demo of the slice; kill anything not on the golden path | Updated board |
| 15:45–18:30 | Build sprint 2 | D1: steps 4–6 UI, states (empty/loading/error); D2: routing to "institution" role, review queue + status, SMS/push via adapter; D3: start the **one hard thing** chosen in the idea sprint (retrieval corpus + citations, *or* classical model, *or* multimodal, *or* agent) — one only; UX: design system tokens, Taglish copy; PD: `data/README.md` provenance, README skeleton, first deck draft (slides 1–4) | End-to-end golden path works locally with real data |
| 18:30–19:30 | Dinner | Mandatory break | |
| 19:30–22:00 | Build sprint 3 | Deploy to staging URL; first full run on deployed URL; D3 writes `ai/evals/` with 20 golden cases + runner; D2 caching layer for demo inputs; UX polish of the two most-seen screens | **Deployed golden path by 22:00**; eval runner prints numbers |
| 22:00–22:20 | Sync 2 + push | Mirror-push to organizer repo (confirm access); tag `day1`; write tomorrow's top 5 | Repo mirrored |
| 22:30 | Sleep | ≥6 h. Nobody codes after midnight on Day 1 | |

Day-1 exit criteria: sub-theme + idea locked; charter; deployed URL with the golden path at least 70% working on real inputs; eval runner exists; README skeleton; deck slides 1–4 drafted.

### Day 2 — Thursday 24 Sep (make it real, make it measurable, build the pitch)

| Time | Block | What to do | Output |
|---|---|---|---|
| 08:00–09:00 | Solo warm-up | Each member fixes their own top bug; no merges | |
| 09:00–09:15 | Sync 3 | Demo on deployed URL; re-confirm scope; assign Day-2 owners | |
| 09:15–12:30 | Build sprint 4 (hard thing + loop) | D3: improve the hard component, run evals, log accuracy/latency table; D2: close the loop (real SMS if credits, else simulated inbox with realistic UX), status page for institution role; D1: role 2 (staff/institution) screens, verification queue (human-in-the-loop); UX: mobile-first pass, accessibility, honest AI states (confidence, sources, "needs review"); PD: impact numbers (before/after), cost per 1,000 users (LLM tokens × price), adoption path, and slide 5–7 drafts | Both roles working; eval table v1 |
| 12:30–13:30 | Lunch | | |
| 13:30–15:00 | **Bold mechanism** sprint | Implement the creativity lever chosen in [05 §6](05-candidate-ideas-ranked.md) (voice-first input / SMS mode / camera-first / incentive points / agent with tools) — timebox 90 min; if not demo-ready by 15:00, downgrade to a "shown, not live" slide. If a **sponsor tool/API** was provided, this is where to use it visibly and credit it | Feature or honest slide |
| 15:00–15:15 | Sync 4 | Decide final feature set; **feature freeze at 15:15** | |
| 15:15–18:30 | Hardening + repo quality | D1: bug bash on golden path with 10 fresh inputs; D2: guardrails (schema validation, prompt-injection filter, PII redaction, rate limit, timeouts, fallbacks), CI green, `.env.example`, one-command run; D3: finalize `ai/evals/` + results in README, prompts documented; UX: visual QA, empty/error states; PD: README full draft (architecture + pipeline Mermaid, run steps, team roles, limitations, roadmap, license, privacy note) | Repo passes [03 §4 checklist](03-judging-criteria-decoded.md) |
| 18:30–19:30 | Dinner | | |
| 19:30–21:00 | **Pitch build** | PD + UX finalize 10 slides; D3 writes slide 6 (pipeline, eval table, hard thing); D1 scripts the demo click-path (exact inputs, exact order) and pre-caches responses; record **backup demo video v1** (60–90 s) | Deck v1, video v1 |
| 21:00–22:00 | Rehearsal 1 | Full 5-minute run on the actual video platform with screen share; time it; fix handoffs; write Q&A bank with owners ([07 §4](07-pitch-and-demo-playbook.md)) | Timing sheet, Q&A doc |
| 22:00–22:20 | Sync 5 + push | Mirror-push; tag `day2`; list Day-3 tasks (must be ≤ 8) | |
| 22:30 | Sleep | ≥6 h | |

Day-2 exit criteria: both roles work on the deployed URL; eval table in README; guardrails in code; CI green; deck v1; backup video v1; one full rehearsal done.

### Day 3 — Friday 25 Sep (freeze, submit early, pitch, awards)

| Time | Block | What to do | Output |
|---|---|---|---|
| 08:00–09:30 | Final fixes | Only P0 bugs on the golden path; D1 sole merger; **deploy freeze 09:30**; tag `v1.0-appcon2026` | Frozen build |
| 09:30–10:30 | Submission pack | README final (URLs to live app, video, deck); `docs/` in repo with the deck PDF; final mirror-push to the organizer repo; verify from a clean browser that judges can open the URL and the README renders (Mermaid, images); submit via the official form/channel **at least 60 minutes before the cut-off** | Submitted |
| 10:30–11:30 | Rehearsal 2 | Full run with the frozen build; re-record backup video v2 from the frozen build; pre-cache demo inputs; second device test | Video v2 |
| 11:30–12:30 | Lunch + quiet | No code changes | |
| 12:30–13:00 | Rehearsal 3 (dress) | Camera/light/framing check for all speakers; notifications off; browser zoom 125–150%; timer; Q&A drill 10 minutes; **redundancy check**: backup speaker and backup demo driver each have the deck, the URL, the cached inputs and the video open on a different ISP/device | |
| 13:00–17:00 | **Project Pitching** | Join 20 min early; when not pitching, one member watches other teams and notes judges' questions to pre-empt; post URLs in chat right after your slot | |
| 17:00–18:00 | Buffer | Prepare a thank-you message naming judges/organizers; screenshot everything | |
| 18:00– | Awarding | Camera on; if you win, the leader speaks 30 seconds: thank, name the sub-theme, state the pilot ask; connect with OTis/partners afterwards (LinkedIn) — the talent-pipeline goal is explicit ([site](https://appcon.otismanila.com/about)) | |

### 3a. Milestones that must not slip (cross-checked against 72-hour guides)

| Milestone | Deadline | Why |
|---|---|---|
| One-sentence identity written and pinned | Day 1 12:30 | Every scope decision is checked against it ([Kurbaitaev](https://dev.to/kurbaitaev/what-judges-actually-score-notes-from-a-year-of-hackathon-judging-3p4l)) |
| Clickable skeleton with hard-coded output | Day 1 15:30 | "Hours 2–6: clickable skeleton" ([Since AI 72h](https://sinceai.ai/blog/how-to-build-a-demo-in-72-hours)) |
| First real AI call end-to-end on 5 real inputs | Day 1 18:30 | "Hours 6–18: one AI feature + 5–10 demo inputs" (same) |
| **Last possible pivot** | Day 1 22:00 | "Pivoting after hour 12 … is almost always fatal" ([lablab guide](https://lablab.ai/guide/how-to-win-an-ai-hackathon)) |
| Deployed URL with golden path | Day 1 22:00 | "A working local demo that can't be accessed by judges scores as if it doesn't work" ([lablab guide](https://lablab.ai/guide/how-to-win-an-ai-hackathon)) |
| Feature freeze | Day 2 15:15 | Reliability block: caching, retries, timeouts, offline fallback ([Since AI 72h](https://sinceai.ai/blog/how-to-build-a-demo-in-72-hours)) |
| Backup video v1 + first full rehearsal | Day 2 21:00 | "Record a 60-second screen capture of the working flow as insurance" ([Kurbaitaev](https://dev.to/kurbaitaev/what-judges-actually-score-notes-from-a-year-of-hackathon-judging-3p4l)) |
| Integration/deploy freeze | ≥6 h before submission cut-off | "All code must work together 6 hours before submission" ([Reskilll online guide](https://reskilll.com/blogs/online-hackathon-tips-2026-how-to-win-not-same-room/)) |
| Final backup video from frozen build | ≥3 h before cut-off | "Demo recording slot … 3 hours before deadline" (same) |
| Submission | ≥60 min before cut-off | Buffer for form/upload failures |

Cut immediately if they appear on the board: sign-up/auth flows, a third user role, settings pages, features not shown in the demo, a second hard AI component ([lablab guide](https://lablab.ai/guide/how-to-win-an-ai-hackathon)).

## 4. Working agreements (put in the charter)

- One channel, one board, one repo, one deck. Decisions are written in the channel with "DECISION:" prefix.
- Golden path is sacred: no merge that risks it after Day 2 15:15.
- Definition of done for the demo: works on the deployed URL from a clean browser with the scripted inputs, twice in a row.
- Everyone commits **small and often from hour 1** (judges read `git log`; single-blob pushes invite scrutiny — [04 §4.12](04-winning-patterns.md)); PD's docs/data/deck live in the repo (visible contribution).
- Truth in demos: anything simulated is labelled on screen and in the pitch; the README's claims are literally true.
- Two-hour rule: if a piece is not working after 2 hours, cut it or mock it and say so ([Since AI team guide](https://sinceai.ai/blog/how-to-form-a-hackathon-team)).
- Sleep is scheduled; a tired pitch loses more points than a missing feature.

## 5. Point-harvest tracker (check off during Day 2 hardening)

| Points | Item | Owner | Done |
|---|---|---|---|
| Relevance 5 | Sub-theme verbatim + statistic with source + "AI is core because…" sentence on slide 1–3 and README | PD | |
| Impact 10 | Named user, before/after number, institution + cost per 1,000 users | PD | |
| UI/UX 10 | Design system, mobile-first, Taglish copy, empty/loading/error states, honest AI states | UX | |
| Maintainability 10 | README (diagrams, run steps, roles, limits, roadmap), tests, CI, `.env.example`, cost model, privacy note | D2 + PD | |
| Functionality 15 | Golden path live on deployed URL ×2 clean runs; backup video | D1 | |
| Tech Innovation 15 | Retrieval/structured outputs/multimodal or classical model; eval table; guardrails visible in code | D3 | |
| Originality 10 | Non-obvious angle stated on slide 8 ("we did not build X because…") | PD | |
| Innovation in Design 10 | Bold input channel or mechanism implemented or honestly shown | UX + D1 | |
| Storytelling 10 | Person → pain → loop → proof → ask; 3 rehearsals | PD | |
| Demo & Delivery 5 | Demo by minute 1:30; pre-cached; driver + backup; recording ready | D1 | |
