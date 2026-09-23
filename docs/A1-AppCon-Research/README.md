# How to win AppCon 2026 ("Virtual AI Matsuri") — research and strategy

**Read this first if the event is tomorrow:** [06 — Strategy and 72-hour execution plan](06-strategy-and-execution-plan.md) (night-before checklist + hour-by-hour playbook), then [03 — Judging criteria decoded](03-judging-criteria-decoded.md), then [05 — Candidate ideas](05-candidate-ideas-ranked.md) §1 and §4.

Status of this document set: **iteration 3 — final** (first draft → six-lens critique → merged past-winner deep-dive and comparable-hackathon/literature research). What changed between drafts is recorded in [10 — Iteration log](10-iteration-log.md).

## The situation in five facts

1. **AppCon 2026 is a 3-day virtual AI hackathon, Wed 23 – Fri 25 Sep 2026** — not the months-long capstone contest of 2019–2024. Phases: Theme Draw → Speaker Sessions → Hackathon Proper → Project Pitching → Awarding ([OTis FB, 22 Sep 2026](https://www.facebook.com/OTisPhilippinesInc/posts/pfbid02P7CgGBvrezZc8huwZ6WZs46Amrat1G8f7WGsbhLSjHNDzCDRr3GuNhFi1zqgbMyvl)). It was originally planned in-person for August 2026 and shifted to virtual in September ([site timeline](https://appcon.otismanila.com/about); postponement details partly unverified — see [01](01-event-overview-and-rules.md)).
2. **100 participants, curated into ~20 teams of 5 (3 dev / 1 UI-UX / 1 product designer) at the event; each team's sub-theme is drawn by lottery; AI must be the core technology** ([site](https://appcon.otismanila.com/); [FB 12 Jun 2026](https://www.facebook.com/OTisPhilippinesInc/posts/pfbid02hyVDxvNcvDAbunV83vWs6zwveVyPGzJUZZhR4sGqUwDa955BnLpoxKXTxsowrDxZl)).
3. **Rubric (100 pts):** Product 35 (Relevance 5, Impact & Value 10, UI/UX 10, Maintainability & Sustainability 10) · Technology 30 (Functionality 15, Technical Innovation 15) · Creativity 20 (Originality 10, Innovation in Design 10) · Presentation 15 (Clarity & Storytelling 10, Demo & Delivery 5). **Source code is pushed to an organizer-provided GitHub repo and reviewed for the Technology score** ([site](https://appcon.otismanila.com/about)).
4. **Prizes:** Grand Winner ₱100,000 (+ plaque, medals, certificates, sintra board); Best in Pitching ₱10,000 ([site](https://appcon.otismanila.com/about)). Sponsor-named special awards are sold to Gold/Diamond sponsors and may appear ([primer](https://www.canva.com/design/DAG-QGNyPF4/CBOk-pFxBwUieoTgo0rMtA/view)).
5. **The organizer, OTis (Tomakomai, Hokkaido; Makati subsidiary), runs AppCon to find "excellent talent with an entrepreneurial spirit" for its talent-referral platform and offshore development partners; the 2026 purpose adds connecting devs with "local and Japanese industry partners"** ([OTis 2019 release](https://otis.company/archives/915); [site](https://appcon.otismanila.com/about)). OTis's own products are practical AI copilots for non-technical staff ("make your work easier") ([OTis works](https://otis.company/works)).

## Top findings

- Past Grand Winners (traffic routing 2019, job matching 2020, accident detection 2022, reverse vending machine 2023, e-jeepney AI+IoT 2024) were **complete, closed-loop, multi-stakeholder systems on mainstream Filipino pains**, typically with real data and a measured ML model, often hardware ([02](02-past-winners-analysis.md)). Hardware is impossible in 2026, which **levels the field** and shifts the game to software AI quality, UX, repo quality, and pitch. The only recorded judge feedback praised a winner's **"global impact potential"**; the awards behave like an ordered 1st–5th ranking; and **AppCon is a real hiring funnel** — at least five past awardees/finalists later worked at OTis ([02 §6](02-past-winners-analysis.md)).
- The rubric has **~30 "cheap" points** most hackathon teams forfeit: Relevance (5), Maintainability & Sustainability (10), Demo & Delivery (5), plus a large share of UI/UX (10) — earned with a README/architecture/tests/cost model, a stated sub-theme + statistic, a rehearsed demo with a recorded backup, and a designer-owned mobile-first UI ([03](03-judging-criteria-decoded.md)).
- **Functionality (15) is the largest single line**: one flawless live golden path on a deployed URL beats three half-features. **Technical Innovation (15) is scored partly from code**: retrieval, structured/validated outputs, multimodal input or a classical model, guardrails, and a small eval table separate you from "GPT wrappers".
- The organizers' own words for 2026 are "get crazy with ideas… no limits" and "truly imaginative and unconventional" ([FB 19 Jan 2026](https://www.facebook.com/share/p/1APYbQVGnT/); [site](https://appcon.otismanila.com/about)); with Creativity at 20%, boldness in the **input channel/mechanism** (voice/SMS/camera-first, incentives, agentic workflow) is the cheapest way to earn it without risking the golden path.
- Because the sub-theme is random, **preparation must be theme-agnostic**: a pre-built chassis, a 12-category idea bank, and a 90-minute selection procedure ([05](05-candidate-ideas-ranked.md)).
- The 2025–2026 judging literature and comparable Philippine AI hackathons converge on the same rules: **whether the demo ran is the largest differentiator; narrow beats platform; say what it is in the first sentence; show something working by ~90 seconds; be honest about what is mocked and what breaks first; "not a chatbot wrapper" is now a literal rubric anchor; ship a metric and one human-in-the-loop safeguard; deploy it; commit small and often because judges read `git log`; never pivot after hour 12** ([04 §4](04-winning-patterns.md)). Winners of Philippine AI hackathons in 2025–26 were Filipino-language, offline-capable, grounded in real local data, and quoted numbers.

## The single recommended direction

Build a **software-only, AI-core "frontline-worker copilot with a closed loop"** inside whatever sub-theme is drawn: a Filipino citizen or frontline worker sends messy real-world input (Taglish voice note, photo, SMS, scanned form) → the AI turns it into a structured, verified record (schema-validated extraction, retrieval with citations, or a classical prediction model) → it routes to the right institution (barangay, health station, LGU office, cooperative) with a human-in-the-loop review queue → and closes the loop to the person (SMS/push confirmation). Two roles, one golden path, real open data, a 20-case eval table, visible guardrails, a repo that reads like a product, and a bold input channel for Creativity. Rationale and per-category variants: [05](05-candidate-ideas-ranked.md); execution: [06](06-strategy-and-execution-plan.md); pitch: [07](07-pitch-and-demo-playbook.md).

## Files

| File | Purpose |
|---|---|
| [01-event-overview-and-rules.md](01-event-overview-and-rules.md) | What AppCon is, what changed in 2026, verified timeline, rules, organizer/partners/sponsors, prizes |
| [02-past-winners-analysis.md](02-past-winners-analysis.md) | Every awardee 2019–2024, domain frequencies, how the 2024 champions worked, judges' taste inferred |
| [03-judging-criteria-decoded.md](03-judging-criteria-decoded.md) | Each sub-criterion decoded into evidence you can show; cheap vs expensive points; repo checklist for the code review |
| [04-winning-patterns.md](04-winning-patterns.md) | Patterns that transfer from AppCon history and hackathon literature; patterns that no longer apply |
| [05-candidate-ideas-ranked.md](05-candidate-ideas-ranked.md) | Recommended archetype, theme-agnostic chassis, 12-category idea bank, 90-minute selection procedure |
| [06-strategy-and-execution-plan.md](06-strategy-and-execution-plan.md) | Night-before checklist, schedule anchors, hour-by-hour 72-hour playbook, working agreements, point tracker |
| [07-pitch-and-demo-playbook.md](07-pitch-and-demo-playbook.md) | 10-slide skeleton, storytelling rules, virtual demo protocol, Q&A bank, Best in Pitching tactics |
| [08-risks-and-pitfalls.md](08-risks-and-pitfalls.md) | Format, team, technical, judging, ethics, logistics risks with pre-committed mitigations |
| [09-sources.md](09-sources.md) | Every URL used, what it supported, and what could not be found |
| [10-iteration-log.md](10-iteration-log.md) | What changed between drafts and why |

## Confidence and caveats

High confidence: 2026 format, dates, team rules, rubric, prizes, organizer motives, past winners list. Medium: inferred sub-theme categories, judges' taste. Low/unknown: judges' identities, exact schedule and pitch format (in the participant email), signed sponsors, the postponement post text. Flags are inline as **[UNCERTAIN]**.
