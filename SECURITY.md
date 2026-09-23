# Security and data handling

Linaw reads other people's messages — notices, emails, lessons — so the honest
question is *where does that text go*. This file answers it for the build as it
is, not as planned. Update it when the answer changes.

## Where text goes today

| Data | Where it is processed | Where it is stored | Leaves the device? |
| --- | --- | --- | --- |
| Source text you paste, drop, or upload (PDF/TXT) | In the browser. PDFs are parsed client-side with pdf.js | `sessionStorage` while you draft (cleared when you clear the source); `localStorage` only if you press **Save on this device** (`linaw.pieces.v1`, up to 20,000 characters per piece) | **No** |
| Adapted note and Meaning Check results | In the browser (`lib/adapt/fixture.ts`, `lib/fidelity/`) | Not stored; recomputed on demand | **No** |
| Reading preferences (detail, wording, delivery, listen speed) | — | `localStorage` (`linaw.preferences.v1`, `linaw.listen.rate`); extension uses `chrome.storage.local` | **No** |
| Optional device profile | — | `localStorage` (`linaw.auth.v1`): display name and email you type, plus titles of saved pieces. No password, no server account | **No** |
| Share links (`/read?s=…`) | The source text is base64url-encoded **in the URL** | Wherever you paste the link: chat apps, browser history, server logs of whoever hosts the app | **Yes — by your action.** Treat a share link like forwarding the message itself. Links are capped at 4,000 characters |
| Listen (read aloud) | Browser Web Speech API | Not stored | **Depends on the browser.** Some browsers synthesise speech locally; some (e.g. Chrome's network voices) send the text to the vendor's speech service. Choose a local voice if this matters |
| Chrome extension | Content script reads only the text you select (or the page's main text when you turn Auto-Adapt on for that site); stored transiently in `chrome.storage.local` as `pendingSourceText` | Cleared when the panel consumes it | **No**, unless you turn on a model key. Same `adapt()` port as the web app |
| Semantic verification (NLI layer) | Off by default. When `NLI_ENDPOINT` is set (Node-side: evals, CI), the source sentence and the claim are POSTed to that URL | Not stored by Linaw | **Only to the endpoint you configure.** The bundled `nli-service/` runs on localhost |

`POST /api/adapt` is the only server route. With no model key, that route runs the fixture on the Linaw server and does not call Gemini. There is no analytics script on the reading pages.

## When a model key is set

If `GEMINI_API_KEY` or the OpenAI-compatible gateway env is set, `/api/adapt` sends the source text to that provider for adaptation and meaning-map extraction. The reading screen says so before you adapt. The seeded failure example stays on the fixture. The key stays in `.env` (git-ignored). See [`.env.example`](.env.example). An empty key means the model is not called.

## Personal data and RA 10173

The Data Privacy Act of 2012 ([RA 10173](https://privacy.gov.ph/data-privacy-act/))
applies to personal information in the messages people paste — names, schedules,
medical or school details. Linaw's position for this build:

- **Data minimisation:** nothing is collected server-side because there is no
  server. The only identifiers Linaw itself asks for are an optional name and
  email, kept in the browser; **Sign out** in Settings removes them (saved
  titles and pieces stay until you remove them or clear site data).
- **Purpose limitation:** text is used to produce the adapted note and its
  Meaning Check, and for nothing else.
- **Retention:** sources persist only if the reader saves them, and can be
  removed from *My Content*. Clearing site data removes everything.
- **Transparency:** every layer that did not run says "Not run"; a note that
  was not produced from the reader's own text says so on screen.
- **Human in the loop:** Meaning Check flags; it does not auto-correct. A
  warning always points at the source sentence so the reader decides.

## Reporting

Found a way text leaks, a stored secret, or an XSS path? Open an issue on the
repository or message a team member directly. Please do not paste real
personal data into public issues — use the campus-pilot sample.

## Known limitations

- Share links expose the full source to anyone who receives them.
- `localStorage` is not encrypted; anyone with access to the browser profile can
  read saved pieces.
- The Web Speech voice provider is chosen by the browser, not by Linaw.
- The seeded failure demo and the offline adapter mean the app cannot yet be
  tested against arbitrary real notices end to end.
