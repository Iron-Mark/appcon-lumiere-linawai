# 07 — Pitch and demo playbook (virtual)

Presentation is 15 points (Clarity & Storytelling 10, Demo & Delivery 5) plus the separate **Best in Pitching ₱10,000** prize ([site](https://appcon.otismanila.com/about)). In a virtual event the pitch is also the only channel through which Product and Technology are perceived. Build the pitch on Day 2, not Day 3.

The exact pitching format (minutes, live vs recorded, Q&A) is in the participant email, not public **[UNCERTAIN]**. Plan for a **5-minute pitch + 3–5 minute Q&A**, and keep a 3-minute cut ready.

## 1. Slide skeleton (10 slides, ≤5 minutes)

| # | Slide | Time | Content |
|---|---|---|---|
| 1 | Title | 0:10 | Product name, one-line promise, **sub-theme verbatim**, team name, roles |
| 2 | The person | 0:30 | One named (or archetypal) Filipino, one moment of pain, one real statistic with source |
| 3 | Why now / why AI | 0:20 | What was impossible before; the sentence "AI is the core because without the model X cannot happen" |
| 4 | The loop | 0:30 | One diagram: input → AI → institution → back to person |
| 5 | **Live demo** | 1:30 | Golden path with real input; end with the action reaching a phone |
| 6 | Under the hood | 0:30 | Pipeline diagram; the "one hard thing"; eval table (N cases, accuracy, latency); guardrails |
| 7 | Impact & adoption | 0:30 | Who runs it (LGU/agency/NGO), cost per 1,000 users, what changes in 12 months |
| 8 | Design & creativity | 0:20 | The bold mechanism/interface choice and why |
| 9 | Sustainability & repo | 0:20 | README/tests/CI screenshot, privacy (RA 10173), roadmap |
| 10 | Ask | 0:10 | Pilot partner named; QR/URL to live app and repo |

Speaker assignment: **one lead speaker for slides 1–4 and 7–10** (the most fluent English/Taglish speaker), **the UI/UX or a dev drives the demo** while the lead narrates, **the AI dev speaks slide 6**. Never more than three voices.

## 1b. Scripts you can adapt

**One-sentence pitch (say it on slide 1 and again on slide 10):**
"*[Product]* lets *[person]* *[send a voice note / snap a photo]* and get *[outcome]* from *[institution]* in *[time]* — because our AI *[does the specific hard thing]*."
Example: "Sakay Signal lets a commuter say 'Pauwi ako Cubao papuntang Bacoor' and get the cheapest safe route by text in 20 seconds — because our model turns messy Taglish speech into a structured trip and matches it to live fare and advisory data."

**Cold open (0:00–0:10):** play the real input — a 6-second Taglish voice note or show the photo. **Then the identity sentence immediately (0:10–0:20):** "[Product] is a tool that turns that into [outcome] for [person]." Judges say teams lose ground when "a problem statement … took forty seconds to arrive at the product" — anchor first, story second ([Kurbaitaev](https://dev.to/kurbaitaev/what-judges-actually-score-notes-from-a-year-of-hackathon-judging-3p4l)).

**Person slide (0:20–0:50):** "[Name], [role], [place]. Every day she [does the manual thing] [N] times. Nationally that is [verified number with source]. Nobody has time to fix the form; so the form never changes." Make the judges "share your frustration with the problem" ([JetBrains](https://blog.jetbrains.com/ai/2026/06/how-to-win-a-hackathon-notes-from-the-judging-table/)) — but in 30 seconds, not 90.

**Demo start by 1:30 at the latest** — "You have to be able to show something working within about 90 seconds" ([JetBrains](https://blog.jetbrains.com/ai/2026/06/how-to-win-a-hackathon-notes-from-the-judging-table/)).

**AI-core sentence (slide 3):** "Take away the model and this is just another form. The product *is* the extraction/prediction: it turns [input] into [structured thing] with [X%] accuracy on [N] real samples."

**Adoption sentence (slide 7):** "The [barangay/LGU office/cooperative] runs it from a browser; it costs about ₱[x] per 1,000 cases in model calls and ₱0.56 per confirmation SMS ([Semaphore](https://www.semaphore.co/)). We would pilot with [named unit] first."

**Impact-potential sentence (slide 7, last line):** "Every one of the country's 1,600-plus cities and municipalities has this same office and this same form, so the pilot copies without re-engineering — and the same pattern fits [one honest analogue abroad, e.g., ageing-society care paperwork in Japan]." OTis's only recorded praise of a winner was for "global impact potential" ([LinkedIn, Neypes](https://www.linkedin.com/posts/jlrnrph_hala-totoo-ba-panalo-tayo-maam-we-did-activity-7346357023657140224-uiQz)); say it once, then stop.

**Closing line (slide 10):** repeat the five-word promise; "Live at [URL]; code and evals in the repo; thank you, judges."

**3-minute cut (if the format is shorter):** cold open (0:15) → person + number (0:30) → live demo (1:15) → under the hood + eval (0:30) → adoption + ask (0:30). Drop slides 3, 8, 9 into the README instead.

## 2. Storytelling rules (for Clarity & Storytelling 10)

- Open with the person, not the market. "Aling Nena, a barangay health worker in Valenzuela, visits 18 homes a day and writes each visit twice."
- One number early, one number late. Early: the problem's scale (with source). Late: your measured result (eval accuracy, seconds per task).
- Say the sub-theme and "social issue in the Philippines" explicitly; say "AI is the core technology" explicitly. Judges score against the rubric; give them the words.
- Name the institution that adopts it and what it costs them — sustainability is a scored criterion.
- Tell the truth about mocks: "SMS is simulated on screen; production uses Semaphore" beats a judge discovering it.
- Close with the loop closed: the phone buzzes, the confirmation appears. End on the outcome, not the roadmap.
- Taglish is fine and often warmer for Filipino judges; keep technical terms in English; if OTis Japan executives judge, slow down and keep slides self-explanatory.

## 3. Demo protocol (for Functionality 15 + Demo & Delivery 5)

Before the pitch day:
1. Deployed URL live; seed data loaded; API keys funded; rate limits checked.
2. **Pre-warm** every model call in the golden path 5 minutes before; cache responses for the exact demo inputs so a cold API cannot stall you.
3. Record a **60–90 s backup video** of the golden path (OBS, 1080p, cursor highlight, captions). Upload to YouTube (unlisted) and Drive; put the link in the README and on slide 5.
4. Prepare a **second device** (phone) on camera to show the SMS/push arriving; if no SMS credits, show the simulated inbox.
5. Dry-run 3 times on the actual video platform (Zoom/Meet) with screen share: check font sizes (zoom browser to 125–150%), hide bookmarks/notifications, close other tabs, use a clean OS profile.
6. Assign a **demo driver** and a **backup driver** with the same setup.

During:
- Lead announces: "We'll show the live app; if the network fails, we switch to a recording." Then it's not a failure, it's a plan.
- Driver narrates nothing; lead narrates everything. Driver moves slowly; 1.5 seconds pause after each click.
- If the live path stalls > 5 seconds, say "switching to recording" and play the video. Do not debug on camera.

Redundancy (virtual-specific):
- **Backup speaker** has the deck open and can continue any slide if the lead's connection drops; agree the rule: "if silence > 5 seconds, backup continues."
- **Backup demo driver** on a different ISP/device with the same cached inputs and the video.
- Deck lives in two places (Google Slides + PDF on a second machine).

After:
- Post in the judges'/event chat within one minute: "Team [X] — [sub-theme] — live: [URL] · repo: [URL] · 90-s demo: [URL] · evals in README §Results. Salamat po!"

## 4. Q&A bank (prepare written answers Day 2 night)

Expected from OTis/industry judges (based on rubric and organizer profile):
- How is AI the *core*? What breaks without the model?
- What is your accuracy/error rate, and on what data? What happens when the model is wrong?
- Where does the data come from; do you have consent; how do you handle personal data (RA 10173)?
- Who pays for this and what does it cost per user/month (LLM cost)? Can an LGU run it?
- How is this different from [existing app / a chatbot]? Why hasn't the government done it?
- What did each team member build? (Contribution spread — matched teams.)
- How would you deploy in low-connectivity areas?
- What would you do with 3 more months? (Roadmap — keep it to three items.)
- What's the hardest technical problem you solved in 72 hours?
- **What part did you build this weekend, and what did you wire together?** Answer cleanly — "blur reads as hiding" ([Kurbaitaev](https://dev.to/kurbaitaev/what-judges-actually-score-notes-from-a-year-of-hackathon-judging-3p4l)).
- **What breaks first at scale?** Name one specific weakness out loud; "Admitting a limitation raised scores in my sheets" (same source).
- Which model, which data, and how did you measure output quality? (Standard AI-hackathon questions — [AngelHack](https://angelhack.com/blog/10-tips-to-help-you-rock-your-next-hackathon-demo/).)
- If a Japanese partner wanted to adopt it, what would you change? (OTis's stated purpose is linking talent to Japanese partners ([site](https://appcon.otismanila.com/about)) — have a one-sentence answer.)

Answer style: one sentence of answer, one sentence of evidence, stop. Assign each question to an owner.

## 5. Best in Pitching — the extra ₱10,000

It is a separate prize, so a team can lose Grand and win this. Its likely drivers: storytelling clarity, energy, demo smoothness, confident Q&A. Concrete edges:
- A 15-second cold open with the person's voice note or photo playing before the title slide.
- Consistent visual identity (same palette as the app).
- A closing line that repeats the product promise in five words.
- No reading from notes; camera on, framed at eye level, decent light, wired internet if possible.

## 6. Pitch-day checklist

- [ ] Deck exported to PDF and Google Slides (two formats)
- [ ] Live URL tested from a phone on mobile data
- [ ] Backup video uploaded, link in README and slide 5
- [ ] Demo inputs pre-cached; API keys funded; rate limits checked
- [ ] Second device ready to show SMS/push
- [ ] Screen-share rehearsed on the actual platform 3×; zoom level set; notifications off
- [ ] Speakers assigned; Q&A owners assigned; timer visible
- [ ] Repo README final; last commit tagged `v1.0-appcon2026`
- [ ] Chat message drafted with URLs to post after the pitch
