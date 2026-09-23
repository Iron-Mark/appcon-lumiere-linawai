# 08 — Acceptance

## Purpose

Definition of done for this MVP slice (canon §39 + mascot).

`POST /api/adapt` is in the app. With no model key it runs the fixture. The seeded bad adaptation always uses the fixture. A model key spends tokens and is not required for the demo.

## Browser verification path (after Wave 1 tracks)

Run offline / fixture-backed (no server required). Use the campus-pilot development sample from `05-client-port.md`.

1. Onboarding: set **Key Points + Plain Language + Read**. Leave Auto-Adapt off unless explicitly testing that opt-in.
2. Open/paste or load the campus-pilot source via fixture.
3. Adapted note appears in the reading workspace (Granola-style measure).
4. Meaning Check shows evidence for at least one critical fact.
5. Seeded bad adaptation (“All members arrive at 8:30 AM”) shows a real **warning** with line “The time appears to be attached to the wrong group.”
6. Sindi reacts: working → reading → pass or warning as appropriate; listening when Speak is used.
7. Listen reads the **exact displayed** adaptation.
8. Extension can apply or request the same adaptation type (manual path minimum; Auto-Adapt only when the user opts in).

## Must be true

- [ ] Preferences persist (web localStorage; extension storage when built).
- [ ] Original remains one action away.
- [ ] Warning state is visible, calm, and evidence-linked.
- [ ] Copy never claims guarantee / 100% verified.
- [ ] Public repo runs from `docs/README.md` instructions (`npm install` && `npm run dev`).
- [ ] Eval/corruption check runnable for the seeded case (fidelity track).
- [ ] `/todo` lists unbuilt backend plugs (fixture track).

## Explicitly not required for this slice’s “done”

- Live Gemini, Supabase, DeBERTa host, repair regeneration, account sync.
- OCR, PDF, auth, RAG, dashboards, healthcare.
- Scores, streak/XP, prompt catalogs.

## Wave 0 gate (this agent)

- [ ] Docs + spec manager + `spec-01` files present.
- [ ] Next app typechecks / builds with placeholders.
- [ ] Domain Zod, adapt port/selector/stub, PreferenceStore, Sindi API in place.
- [ ] Placeholder routes name owning tracks.
- [ ] No Wave 1 directory bodies beyond empty ownership reservations.
