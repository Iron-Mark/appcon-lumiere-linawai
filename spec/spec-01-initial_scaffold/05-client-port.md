# 05 — Client port (`adapt`)

## Purpose

Single client integration point for adaptation. Web and extension call `adapt()`; they never import the fixture or the HTTP module directly.

## Ownership

| File | Owner |
| --- | --- |
| `lib/adapt/port.ts` | Wave 0 (done) — defines `adapt(input)` type |
| `lib/adapt/index.ts` | **Only** selector. Re-exports `adapt()` from `./http`. |
| `lib/adapt/fixture.ts` | Campus-pilot sample, seeded bad adaptation, and the offline fallback. |
| `lib/adapt/prompts.ts` | Prompt builders used by `app/api/adapt/model.ts` when a key is set. |
| `lib/adapt/http.ts` | Client. `POST /api/adapt`, then the in-browser fixture if the route is unreachable. |
| `app/api/adapt/route.ts` | Server. Fixture by default. Model only when `modelConfigured()` is true. Seeded failure source always stays on the fixture. |

Callers must not import `fixture.ts` or `http.ts` directly.

## Contracts (canon §17)

Request:

```ts
{
  source: string
  preferences: {
    detail: "full" | "key_points"
    wording: "original" | "plain"
    delivery: "read" | "listen"
    // browserBehavior is stored for extension; adapt request uses presentation prefs
  }
}
```

Field names stay stable when Gemini arrives. Prefer domain Zod types in `lib/domain`.

Response:

```ts
{
  adaptedText: string
  meaningMap: MeaningMap
  checks: Array<{
    claim: string
    status: "pass" | "warning" | "repair_required"
    evidence: string
    reason: string
  }>
  overallStatus: "pass" | "warning" | "repair_required"
}
```

NLI-related fields in checks/pipeline may report `neutral` with reason like “Semantic check not connected” until a model is wired. Deterministic/relationship layers still return pass/warning/repair_required.

## Wave 0 fixture stub

`fixture.ts` ships as a **typed stub** returning valid domain objects so the app typechecks. Comment in file: fixture track owns the campus-pilot development sample and the seeded bad adaptation. **Do not** implement that sample content in Wave 0.

## Development sample (fixture track)

Source:

> Members of the Linaw campus pilot must confirm their orientation seat by Thursday at 5 PM. Mentors should arrive Friday at 8:30 AM. Other members should arrive at 9:00 AM. Late confirmations are accepted only with written approval from the program coordinator.

Seeded bad adaptation:

> All members arrive at 8:30 AM.

Warning line: “The time appears to be attached to the wrong group.”

Default profile for exercising the path: **Key Points**, **Plain Language**, **Read**. Auto-Clarify stays an explicit opt-in; the sample does not assume it is on. The stored value is still `auto_adapt`.

## Fixture track responsibilities

1. Implement `adapt()` body in `fixture.ts` only.
2. Use the campus-pilot source above (deadline, two groups, two times, written-approval exception).
3. Control path that yields the seeded bad adaptation so warning/relationship failure is exercisable offline.
4. Prefer Key Points + Plain Language output for the happy path matching the default profile above.
5. Build `/todo` page listing backend plugs (see `09-backend-todo.md`).

## Acceptance checks

- [ ] UI imports only from `lib/adapt` (index), never `fixture.ts`.
- [ ] Request/response parse with domain Zod schemas.
- [ ] Fixture track: seeded corruption produces `overallStatus` warning (or repair_required) with evidence.
- [ ] Switching to HTTP later requires only `http.ts` + selector change.

## Out of scope

- `app/api` routes in this slice.
- Live Gemini / Supabase.
- Editing domain field names for demo convenience.
