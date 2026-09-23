# 08 — Risks and pitfalls

Ordered by (probability × cost to our score). Each has a pre-commitment you can apply in the moment.

## A. Format and rules risks

| Risk | Why it matters | Mitigation |
|---|---|---|
| The emailed rules differ from the public site (e.g., "no pre-written code", specific stack, specific submission format) | Disqualification or wasted prep | Read the participant email and any rules PDF before doing anything else; keep pre-work to templates/skeletons and document what was pre-built; ask the organizers in the official channel if unclear |
| Sub-theme draw lands on an unfamiliar category | Weak Relevance/Impact | Idea bank covers 12 categories ([05](05-candidate-ideas-ranked.md)); run the 90-minute selection procedure; recruit domain knowledge from the team's personal networks in the first hour |
| Schedule unknown (pitch length, submission cut-off, time zone) | Unfinished demo or missed cut-off | Paste the emailed schedule into [06](06-strategy-and-execution-plan.md) and set alarms 2 hours and 30 minutes before every deadline |
| Repo is organizer-provided: access/permissions arrive late; history must be pushed there | Code review sees nothing | Develop in your own repo from hour 1; mirror-push to the organizer repo every 3 hours; confirm access on Day 1 |
| Organizer may use your code for marketing/sponsors ([site](https://appcon.otismanila.com/about)) | Licensing/IP surprises | Use MIT/Apache-licensed dependencies; no proprietary or client code; no secrets in git; LICENSE file present |

## B. Team-formation risks (strangers, curated match)

| Risk | Mitigation |
|---|---|
| No shared stack among the 3 devs | Decide in first 15 minutes: pick the stack the majority knows; the third dev owns AI/data/evals in Python if needed; never split into two frontends |
| No clear decision-maker → scope creep | Team leader (who also draws the theme) is the scope owner; write a 1-page charter (goal, golden path, roles, decision rule, working hours, channel) |
| Uneven contribution (judges may check commits) | Everyone commits daily; small PRs; the product designer owns data/README/deck in the repo so their work is visible too |
| Timezone/availability mismatch (professionals + students) | Agree core hours and two daily syncs; async updates in one channel; a shared Kanban with ≤15 cards |
| Personality conflict | Pre-agree the tiebreak: PM decides scope, lead dev decides tech, designer decides UI; disagreements time-boxed to 10 minutes |

## C. Technical risks

| Risk | Mitigation |
|---|---|
| LLM/API outage, latency, rate limits during demo | Cache all golden-path responses (key = hash of input); secondary provider configured behind an env flag (Vercel AI SDK makes the swap one line); recorded backup video |
| Sponsor-provided tool/API is flaky or credits run out mid-event | Use it for the visible "bold" feature, not for the golden path's critical call; keep your own funded key as the primary path |
| Taglish speech-to-text mis-transcribes the demo utterance | Test the exact 3 demo utterances on Day 1 evening; pick the utterances the STT gets right; keep text input as the golden path and voice as the bold lever |
| Free-tier quotas exhausted (Vercel/Render/OpenAI/Gemini) | Two funded accounts; monitor usage Day 2 night; keep local fallback |
| Model hallucination on stage | Constrain outputs with schemas; retrieval with citations; show confidence and a "needs human review" path; demo only tested inputs |
| Data unavailable or dirty | Choose ideas with data confirmed in the first 90 minutes; collect 30 real samples yourselves; document provenance in `data/README.md` |
| Speech/vision in Taglish underperforms | Test the exact demo utterances early; if weak, switch to text input and keep voice as a shown-but-not-live feature |
| Deployment breaks on Day 3 | Freeze deploy Day 3 morning; `v1.0` tag; hotfix only from a branch; keep a local run as fallback |
| Merge hell in the last hours | Trunk-based with feature flags; the lead dev is the only merger after the scope freeze |
| Late pivot | Hard rule: no pivot after Day 1 22:00; "pivoting after hour 12 … is almost always fatal" ([lablab guide](https://lablab.ai/guide/how-to-win-an-ai-hackathon)) |
| Repo shows one giant final push | Judges read `git log`; single-blob histories have triggered eligibility reviews ([Devpost Gemini 3 update](https://gemini3.devpost.com/); [HackerNoon](https://hackernoon.com/the-git-log-never-lies)). Commit small and often from hour 1 |
| Demo only runs on localhost | "Scores as if it doesn't work" ([lablab guide](https://lablab.ai/guide/how-to-win-an-ai-hackathon)); deploy Day 1 evening, freeze Day 3 morning |
| Over-engineered AI chain | "Chaining 5 LLM calls when 1 would do adds latency and failure points" (same) — one call with a schema unless the hard thing needs more |

## D. Judging and pitch risks

| Risk | Mitigation |
|---|---|
| "It's just a GPT wrapper" | Retrieval + structured outputs + eval table + one classical model; say the hard thing out loud on slide 6 |
| Judges can't see maintainability | README with Mermaid diagrams, tests, CI badge, cost model, privacy note — and show a screenshot of it on slide 9 |
| Demo looks like a mockup | Real data, real phone receiving the message, deployed URL judges can open |
| Over-long pitch; cut off before the demo | Demo starts by minute 1:30 at the latest; 3-minute cut rehearsed |
| Weak Q&A | Q&A bank with owners ([07 §4](07-pitch-and-demo-playbook.md)) |
| Judges are Japanese executives with limited Taglish | Slides self-explanatory; slow down; avoid idioms during the technical part |
| A special sponsor award appears with unpublished criteria **[UNCERTAIN]** | Ask on Day 1 whether special awards exist and their criteria; align one slide if cheap |

## E. Ethics, privacy, safety

| Risk | Mitigation |
|---|---|
| Personal data of real people in demo | Use synthetic or consented data; redact; reference [RA 10173](https://privacy.gov.ph/data-privacy-act/) in the deck and `SECURITY.md` |
| Medical/legal/psychological advice liability | Frame as assistive + human-in-the-loop; show the escalation path; do not claim diagnosis |
| Scraping terms of service | Prefer official open data (data.gov.ph, PSA OpenSTAT, PAGASA, DOH); cite sources; do not scrape personal profiles |
| AI-generated code with unclear licenses | Keep dependencies mainstream and licensed; the organizers explicitly welcome AI-assisted development ([primer slide 10](https://www.canva.com/design/DAG-QGNyPF4/CBOk-pFxBwUieoTgo0rMtA/view)) |

## F. Personal and logistics (virtual)

| Risk | Mitigation |
|---|---|
| Power/internet outage at a member's home | Each member knows their nearest backup (coworking, relative, mobile hotspot); demo driver and backup driver on different ISPs |
| Burnout in a 72-hour sprint | Sleep at least 6 hours Day 1 and Day 2; the plan in [06](06-strategy-and-execution-plan.md) budgets it; a tired pitch loses more points than a missing feature |
| Speaker sessions consume build time | Split attendance: one member attends and summarizes; never all five |

## G. Knowledge gaps in this research (be honest with yourselves)

- Judges' identities, scoring sheets, and deliberation style for 2026 are unknown; the rubric is the only hard evidence ([site](https://appcon.otismanila.com/about)).
- The sub-theme pool is unpublished; the idea bank is inference from history.
- The March 2026 postponement post was seen only via a search index summary, not retrieved directly.
- Which sponsors signed for 2026 and whether special awards exist is unknown.
- Exact pitch format and submission requirements are in the participant email only.
