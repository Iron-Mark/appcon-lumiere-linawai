# Security and data handling

Linaw reads other people's messages — notices, emails, lessons — so the honest
question is *where does that text go*. This file answers it for the build as it
is, not as planned. Update it when the answer changes.

## Where text goes today

| Data | Where it is processed | Where it is stored | Leaves the device? |
| --- | --- | --- | --- |
| Source text you paste, drop, or upload (PDF/TXT) | In the browser. PDFs are parsed client-side with pdf.js. If a model key is set, `/api/adapt` then sends the source to that provider | `sessionStorage` while you draft (cleared when you clear the source); `localStorage` only if you press **Save on this device** (`linaw.pieces.v1`, up to 20,000 characters per piece). The server does not write it to disk. A successful model answer also keeps that source in process memory until the server stops | **Only when a model is configured** — then yes, to Gemini and/or the OpenAI-compatible gateway. With no key, **no** |
| Clarified note and Meaning Check results | On the Linaw server inside `/api/adapt` (`lib/fidelity/`, plus a model when keyed). The browser renders the response. If the route is down, the in-browser fixture runs the same Guard | A successful model answer is held in server memory (up to 50, keyed by source + detail + wording) so a repeat does not call the model again. Not written to disk. Cleared when the server process stops. Fixture answers are not kept | Same as the source row: **only if a model produced the note** |
| Reading preferences (detail, wording, delivery, listen speed) | — | `localStorage` (`linaw.preferences.v1`, `linaw.listen.rate`); extension uses `chrome.storage.local` | **No** |
| Optional device profile | — | `localStorage` (`linaw.auth.v1`): display name and email you type, plus titles of saved pieces. No password, no server account | **No** |
| Share links (`/read?s=…`) | The source text is base64url-encoded **in the URL** | Wherever you paste the link: chat apps, browser history, server logs of whoever hosts the app | **Yes — by your action.** Treat a share link like forwarding the message itself. Links are capped at 4,000 characters |
| Listen (read aloud) | Browser Web Speech API | Not stored | **Depends on the browser.** Some browsers synthesise speech locally; some (e.g. Chrome's network voices) send the text to the vendor's speech service. Choose a local voice if this matters |
| Chrome extension | Content script reads only the text you select (or the page's main text when you turn Auto-Clarify on for that site); stored transiently in `chrome.storage.local` as `pendingSourceText`. The service worker then POSTs that text to the Linaw app at `http://127.0.0.1:3000`, then `http://localhost:3000` | Pending selection is cleared when the panel consumes it. Reading display choices stay in `chrome.storage.local` (`linaw.readingComfort.v1`) and are not synced | **Yes, when the Linaw app is running and a model is configured.** The app then sends the text to Gemini and/or the gateway. If the app is down, the extension uses the in-browser fixture and the page text is not replaced. A model answer is written into the article; **Page as it was** restores the original words. Keys stay on the server |
| Semantic verification (NLI layer) | Off by default. When `NLI_ENDPOINT` is set (Node-side: evals, CI), the source sentence and the claim are POSTed to that URL | Not stored by Linaw | **Only to the endpoint you configure.** The bundled `nli-service/` runs on localhost |

`POST /api/adapt` is the only server route. With no model key, that route runs the fixture on the Linaw server and does not call a model. There is no analytics script on the reading pages. Provider order, timeouts, and what the gateway actually is: [`docs/architecture.md`](docs/architecture.md).

## When a model key is set

If `GEMINI_API_KEY` or the OpenAI-compatible gateway env is set, `/api/adapt` sends the source text and the reader's detail/wording preference to that provider for adaptation and meaning-map extraction. Provider order is Gemini, then the gateway, then the offline fixture; every response is labelled `adapter: "model" | "fixture"` and the reading screen shows which produced the note. The reading screen also says, before you adapt, that text will be sent. Facts whose quoted evidence does not occur verbatim in the source are dropped before Meaning Check runs. The seeded failure example stays on the fixture. Keys live in `.env.local` (git-ignored) and are read only on the server. See [`.env.example`](.env.example). An empty key means the model is not called. Data retention on the model side is the provider's — for a third-party gateway it is unknown, so do not paste personal data into a build that uses one.

## Personal data and RA 10173

The Data Privacy Act of 2012 ([RA 10173](https://privacy.gov.ph/data-privacy-act/))
applies to personal information in the messages people paste — names, schedules,
medical or school details. Linaw's position for this build:

- **Data minimisation:** the only server work is `POST /api/adapt`. Source
  text is not logged and is not written to disk. A successful model answer
  is kept in process memory so the same note is not sent again. The only identifiers Linaw itself asks
  for are an optional name and email, kept in the browser; **Sign out** in
  Settings removes them (saved titles and pieces stay until you remove them
  or clear site data).
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
- The seeded failure demo always uses the fixture, even when a model is keyed.
- The fallback gateway's retention policy is unknown — do not paste personal
  data into a build that uses it.
