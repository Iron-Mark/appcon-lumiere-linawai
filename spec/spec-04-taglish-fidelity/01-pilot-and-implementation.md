# 01 — Pilot evidence and implementation

## Purpose

Stop Meaning Check from telling a reader that a Taglish clarification dropped a rule when the rule is still there. Keep warning when a time, number, condition, or ban actually changed.

AppCon scores a measured model, not a canned paragraph. These 20 runs are that measurement for the wording people in the Philippines actually use.

## What was run

Date of the run: the deployed app at `https://appcon-lumiere-linawai.vercel.app/api/adapt`.

Twenty committed eval notices, one call each. Profiles rotated through Key Points and Full, and through Original, Plain Language, and Taglish. The runner is `evals/pilot-20.live.test.ts`. It does not run in CI. Set `PILOT_LIVE=1` to repeat it.

Fact needles were the gold `value`, `condition`, and `exception` strings that already appear in the source and are at least four characters.

## Result

| Result | Count |
| --- | --- |
| Model answer, all tracked facts present, status pass | 18 |
| Model answer, status warning, one fact string missing | 1 |
| Model answer, status repair_required, tracked fact string present | 1 |
| Fixture answer | 0 |

Both non-pass rows were **Full + Taglish**. Shorter Taglish (Key Points) passed.

### Science lab (warning)

Source: students must not enter after 5:00 PM. Teachers may stay until 6:30 PM. Equipment loans require a signed pass.

Model: "Kailangan ng signed pass para sa Equipment loans." Times stayed. The checker warned "Important condition may have changed" because the English string "require a signed pass" was gone, even though "signed pass" remained.

### Boil water (repair_required)

Source: boil 3 minutes, distribution at 6:00 AM, ice from unboiled water is not allowed for drinking.

Model: "Hindi allowed for drinking ang ice from unboiled water." The ban is still there. The checker treated it as a dropped negation because it only looked for English "not".

## Already in the tree

Not deployed until this branch ships.

- `lib/fidelity/normalize.ts`: `hindi`, `bawal`, `huwag`, and the "hindi pwedeng" forms count as negation.
- `lib/fidelity/deterministic.ts`: a condition counts as kept when its content words remain (`signed pass`) after filler words such as "require" are translated.
- Tests in `lib/fidelity/deterministic.test.ts` cover those two sentences.

A cached production answer will keep the old warning until that server process restarts. A new notice uses the new check only after deploy.

## Remaining work

Implement in this order. Do not start the next item until the previous test is green.

1. **Obligation and permission in Taglish.** `hasObligationMarker` and `hasPermissionMarker` know must/may. Full Taglish uses "dapat" and "kailangan" for must, and "pwede" or "puwede" for may. Add those markers. A sentence with "hindi dapat" or "bawal" stays a negation, not a new obligation. Test: "Teachers may stay" rewritten as "Pwedeng mag-stay ang Teachers" does not warn. "Students must not enter" rewritten as "Pwedeng pumasok ang Students" still warns.

2. **Do not let content-word matching hide a real drop.** "signed pass" kept is a pass. "signed" kept and "pass" dropped is a warning. Add that negative test next to the lab test.

3. **Re-run the same 20 after deploy.** `PILOT_LIVE=1` and `npx vitest run evals/pilot-20.live.test.ts`. Record adapter, status, and missing fact strings. Success: the lab and boil-water rows are pass, and any new warning names a fact that is actually absent from the clarified text.

4. **Show the reader the source sentence, not a scare.** When a Taglish check does warn, the card evidence stays the original English sentence. Do not add a second score. Do not say guaranteed.

## Acceptance

- [ ] The two pilot sentences above do not raise condition or negation warnings.
- [ ] An English "must not" that becomes "may" still raises a warning.
- [ ] A condition whose content word is deleted still raises "Important condition may have changed."
- [ ] The 20-run table is updated in this file after the next live run.
- [ ] No em dash in new user-facing check reasons.

## Out of scope

- Paying for Hugging Face inference.
- Hosting `nli-service`. Layer 3 may stay "Semantic check not connected."
- Fine-tuning DeBERTa.
- Changing Gemini's Taglish prompt unless the re-run shows a fact that is truly missing, not a false alarm.
