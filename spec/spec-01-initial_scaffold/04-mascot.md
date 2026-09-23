# 04 — Mascot (Ray)

## Purpose

Define **Ray**, a small sun guide for clarity (“Less confusion. More clarity.”). Presentational API only; screens pass `state` and optional short line. The component export remains `Sindi` / `components/sindi/` so existing imports stay stable.

## Ownership

- Wave 0: `components/sindi/` API and SVG.
- Other tracks compose the component; they do not fork a second mascot.

## Character rules

- Visible name: **Ray**. Metaphor: sun / clarity (not a paper lantern).
- Custom **SVG**, never an emoji or raster.
- Palette: warm yellow (body), pale yellow (rays), cream (subtle mouth accents), navy (eyes, default smile, wordmark), cool gray (secondary UI only).
- Sits beside the question the way Duo sits beside a Duolingo prompt during onboarding.
- Stays **out of the reading measure** (adapted text column).
- Does not diagnose, score the person, or claim text is guaranteed correct.
- Same states in the extension header, smaller (extension track).

## Sheet looks ↔ product `state`

| Sheet look | Product `state` | Motion / look | Default line (one short sentence) |
| --- | --- | --- | --- |
| **Default** — calm smile, ready to help | `prompt`, `reading` | Soft presence; `reading` may shrink so the note leads | `prompt`: names the preference just chosen when applicable; otherwise a short prompt helper. `reading`: minimal or empty |
| **Processing** — working behind the scenes | `working` | Rays may rotate; **reduced motion** → still frame (no spinner that hides the page) | e.g. “Adapting…” |
| **Success** — information is clearer now | `pass` | Closed happy eyes; extra bloom rays; no confetti | “No issue found in these checks.” |
| **Empty** — a fresh start | `empty` | Peaceful closed eyes; static rays | e.g. “A fresh start, whenever you're ready.” |
| **Listening** (product iteration) | `listening` | Eyes open and soft; a few rays quieter; stops when speech stops | e.g. “Listening…” / reading aloud cue |
| **Warning** (product iteration) | `warning` | Concerned, not scary or angry; slight turn toward flagged claim | Cautious line from §12, e.g. “The time appears to be attached to the wrong group.” or “Important condition may have changed. Review source.” |

Motion duration 150–300ms (spin may be slower). Honor `prefers-reduced-motion`.

## Component API (Wave 0)

- Props: `state`, optional `line` (override), optional `className` / size variant later.
- No screen logic, no `adapt()` calls, no routing.

## Acceptance checks

- [ ] All product states render without throwing (`prompt`, `working`, `reading`, `listening`, `pass`, `warning`, `empty`).
- [ ] SVG sun (Ray) present; no emoji, no lantern.
- [ ] Reduced-motion path does not rely on continuous animation for meaning.
- [ ] Pass/warning copy never uses guarantee language.

## Out of scope

- Confetti, XP, streak celebrations.
- Voice/personality chat beyond one short line.
- Diagnosis or scoring the user.
