# 01 — Onboarding

## Purpose

Collect the user’s default communication preferences in four calm steps, persist them via `PreferenceStore`, then navigate to `/read`. Later steps and the live sample react to answers already chosen. Those choices also shape how `/read` first opens (note layout and a short defaults line). This is preference setup only, not diagnosis, CAST, or inferred ability labels.

## Ownership

- Directories: `components/onboarding/`, `app/onboarding/`
- Do not edit `lib/domain/`, `lib/storage/`, or `components/sindi/` contracts—consume them.
- **Route gap (landing track):** `/` is now the public landing (`components/landing/`, `app/page.tsx`). Onboarding ships at `/onboarding`. Ownership maps that still list only `app/page.tsx` for this track are stale until updated in `docs/AGENTS.md` / phase README.
- Reading-side first-arrival behavior (glance vs text, empty-state preference line) lives under `components/read/` and must stay aligned with this contract.

## User-visible behavior

Route: `/onboarding` (entry from landing CTA). Not `/`. Re-entry for editing: `/onboarding?edit=1`.

Four steps, one preference dimension each. Stored values do not change; question copy, hints, Sindi lines, and the live sample do.

| Step | Dimension | Choices (labels) | Stored values |
| --- | --- | --- | --- |
| 1 | Detail | Full · Key Points | `full` · `key_points` |
| 2 | Wording | Original · Plain Language · Taglish | `original` · `plain` · `taglish` |
| 3 | Delivery | Read · Listen | `read` · `listen` |
| 4 | Browser behavior | Auto-Clarify · Manual | `auto_adapt` · `manual` |

### Adaptive copy and sample

- After **Detail**, the wording step’s question, hints, idle prompt, and sample speak to Key Points vs Full. Key Points keeps the short list; Full keeps the longer form.
- After **Wording**, the delivery step does the same for the subject (key points vs full message, plain vs original).
- If **Listen** is chosen, the last step explains that Clarify is still read aloud on this page and that Auto-Clarify is only about the browser extension (not a second product).
- If **Read** is chosen, the last step does not pitch Listen.
- Progress still shows where the user is. Back keeps earlier choices. Continue stays disabled until a choice on the current step.

Chrome pattern (Duolingo-inspired calm preference setup; keep Linaw paper, ink, olive, Lora/Raleway):

- One question / one choice set per step.
- Progress indicator and a back chevron.
- Large selectable cards (not tiny chips).
- **Continue** pinned to the bottom; inactive until a choice; active fill uses the olive action token.
- Selected card: light olive fill + olive border; press-in ~scale 0.98 on select.
- Sindi in **prompt** state beside the question (not inside the reading measure—there is no reading column yet). After a choice, Sindi’s line may name the preference just chosen (see `04-mascot.md`).
- Live sample preview updates with prior and current choices (`ChoiceExample`).

On final Continue: write preferences through `PreferenceStore`, seed the note layout for first arrival (Key Points → glance / At a glance; Full → text), then route to `/read`.

If preferences already exist, either resume at `/read` or allow re-entry via `/onboarding?edit=1`. Do not invent new preference fields.

### First arrival at `/read` (aligned contract)

- Empty / first-run state names the saved choices in one short line (for example `Key Points · Plain Language · Read`), not a lecture.
- Key Points opens the existing glance note layout; Full opens the text layout. Do not invent a third product surface.
- Listen still auto-plays the clarified note when a note exists.
- Changing a preference in the reading dialog still re-clarifies, as today.
- On-screen verb remains Clarify / Auto-Clarify. The code function stays `adapt()`.

## States

- **empty step** — no card selected; Continue disabled.
- **selected** — one card selected; Continue enabled; sample and Sindi line update.
- **saving** — optional brief disable while `set` resolves (localStorage is sync; keep UI honest).
- **error** — if store write fails, show a short recoverable message; do not navigate.

## Copy rules

- Use preference labels above only. No streaks, XP, hearts, ability labels, or diagnosis language.
- Prefer short questions such as “How much detail?” not “What is your learning style?”
- Brand “Linaw” may appear as a calm header signal; do not overpower with a marketing hero.
- No em dashes in new UI strings.
- Never put “Adapt” back on screen; Auto-Clarify maps to stored `auto_adapt`.

## Data contracts

Use Zod types from `lib/domain` (`Preferences`). Persist with `lib/storage/preferences` (`PreferenceStore`). Do not invent parallel shapes.

## Acceptance checks

- [ ] Four steps match the table; Continue disabled until a choice.
- [ ] After Detail, wording copy and sample match Key Points vs Full.
- [ ] After Wording, delivery copy and sample match prior answers.
- [ ] Listen changes the last-step copy (extension vs on-page listen); Read does not pitch Listen.
- [ ] Back returns to the previous step without losing prior selections.
- [ ] Final Continue persists preferences and lands on `/read` with matching layout and a short defaults line.
- [ ] Selected card styling uses olive tokens from `app/globals.css`.
- [ ] Sindi `prompt` state renders; no emoji mascot.
- [ ] No streak/XP/score chrome.
- [ ] Works on desktop and narrow mobile widths.

## Out of scope

- Account/auth, cloud sync, CAST behavioral suggestions, diagnosis, or inferred ability labels.
- Hidden tracking of reading behavior to change preferences.
- Building `chrome.storage` (extension track).
- Meaning Check, Listen playback implementation details (reading track owns the player; onboarding only sets `delivery`).
- Changing `lib/adapt/index.ts` or domain schemas.
- Renaming `adapt()` or the `/api/adapt` route.
