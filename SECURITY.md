# Security and data handling

Linaw reads notices, emails, and lessons. This file says where that text goes.

## Where text goes

| Data | Where it is processed | Where it is stored | Leaves the device? |
| --- | --- | --- | --- |
| Source text you paste, drop, or upload (PDF/TXT) | In the browser. PDFs are parsed in the browser with pdf.js. When a model key is set, `POST /api/adapt` sends the source to that provider | `sessionStorage` (`linaw.read.draft`) until you clear the source. `localStorage` (`linaw.pieces.v1`, up to 20,000 characters) only after **Save on this device**. The server does not write it to disk. A successful model answer also keeps that source in process memory until the server stops | **When a model key is set**, yes, to Gemini and then, if needed, the OpenAI-compatible gateway. With no key, no |
| Clarified note and Meaning Check results | On the Linaw server inside `/api/adapt` (`lib/fidelity/`, plus a model when keyed). The browser renders the response. If the route is down, the in-browser fixture runs the same Guard | A successful model answer is held in server memory (up to 50, keyed by source + detail + wording) so a repeat does not call the model again. Not written to disk. Cleared when the server process stops. Fixture answers are not kept | Same as the source row: only if a model produced the note |
| Reading preferences (detail, wording, delivery, listen speed) | In the browser | `localStorage` (`linaw.preferences.v1`, `linaw.listen.rate`). The extension uses `chrome.storage.local` | **No**, unless cloud sign-in is configured. Then preferences sync to the account row. Source text does not |
| Optional account | In the browser. With cloud sign-in, also at the account service | On this device: `localStorage` (`linaw.auth.v1`), display name and email, no password. When `NEXT_PUBLIC_SUPABASE_URL` and the publishable key are set, sign-in uses a password and stores the display name, preferences, and saved titles in `linaw_profiles`. Source text is not in that row | **Only the account fields above**, and only when cloud sign-in is configured |
| Share links (`/read?s=…`) | The source text is base64url-encoded in the URL | Wherever you paste the link: chat apps, browser history, server logs of whoever hosts the app | **Yes, when you send the link.** Treat a share link like forwarding the message. Links are capped at 4,000 characters |
| Listen | The Linaw voice (`en_US-hfc_female-medium`) downloads once into the browser and speaks there. If that play fails, the browser speech engine speaks the line | The voice file stays in the browser after download. The spoken line is not stored | **The Linaw voice does not send the line to a speech vendor.** Some browser voices do |
| Chrome extension | The content script reads only the text you select, or the page's main text when Auto-Clarify is on for that site. Pending text sits in `chrome.storage.local` as `pendingSourceText`. The service worker then POSTs it to `https://appcon-lumiere-linawai.vercel.app`, then `http://127.0.0.1:3000`, then `http://localhost:3000` | Pending selection is cleared when the panel consumes it. Reading display choices stay in `chrome.storage.local` (`linaw.readingComfort.v1`) and are not synced | **Yes, when that app is reached and a model key is set.** The app then sends the text to Gemini and, if needed, the gateway. If the app is down, the extension uses the in-browser fixture and the page text is not replaced. A model answer is written into the article. **Page as it was** restores the original words. Keys stay on the server |
| Semantic verification (NLI) | The hosted app posts the source sentence and the claim to `https://linaw-nli.onrender.com/predict`. That address is `NLI_ENDPOINT` on Vercel production. The service runs `cross-encoder/nli-deberta-v3-base`. If the call fails, or the variable is unset, the layer says Not run and stays out of the verdict | Linaw does not store that exchange. `nli-service/` is the same verifier for a local run and does not include model weights | **Yes, to that host**, for the source sentence and the claim |

`POST /api/adapt` is the only server route that receives source text. With no model key, that route runs the fixture and does not call a model. Each network address may send 20 uncached model clarifications per 10 minutes. A repeat of the same note is served from memory and does not count. Bodies over 80 KB and sources over 20,000 characters are refused. Text that is only an instruction to override the system prompt is not sent to a model. Vercel Web Analytics counts page views. A Clarify click sends the detail and wording choices only. The pasted message, the note, and the account email are not included. Provider order, timeouts, and the gateway: [`docs/architecture.md`](docs/architecture.md).

## When a model key is set

The hosted app calls Gemini first, then the OpenAI-compatible gateway. `GET /api/adapt` reports that order as `gemini`, then `openai-compatible`.

`/api/adapt` sends the source text and the reader's detail and wording choices to that provider for the clarified note and the Meaning Map. Every response is labelled `adapter: "model"` or `adapter: "fixture"`, and the reading screen shows which produced the note. The reading screen also says, before Clarify, that text will be sent. Facts whose quoted evidence does not occur verbatim in the source are dropped before Meaning Check runs. The seeded failure example stays on the fixture. Keys live in server environment variables and are not committed. See [`.env.example`](.env.example). An empty key means the model is not called. Retention after the provider receives the text is that provider's policy. The gateway's retention is not stated here, so do not paste personal information when the gateway is the provider that answers.

## Personal data and RA 10173

The Data Privacy Act of 2012 ([RA 10173](https://privacy.gov.ph/data-privacy-act/)) applies to personal information in the messages people paste: names, schedules, medical or school details. Linaw does not publish an NPC registration number.

- **Data minimisation.** The only server work on source text is `POST /api/adapt`. Source text is not logged and is not written to disk. A successful model answer is kept in process memory so the same note is not sent again. The only identifiers Linaw asks for are an optional name and email. **Sign out** in Settings removes them. Saved titles and pieces stay until you remove them or clear site data.
- **Purpose limitation.** Text is used to produce the clarified note and its Meaning Check, and for nothing else.
- **Retention.** Sources persist only if the reader saves them, and can be removed from My Content. Clearing site data removes everything on this device.
- **Transparency.** Every layer that did not run says "Not run". A note that was not produced from the reader's own text says so on screen.
- **Human in the loop.** Meaning Check flags. It does not auto-correct. A warning points at the source sentence so the reader decides.

## Reporting

Found a way text leaks, a stored secret, or an XSS path? Open an issue on the repository. Do not paste a real personal message into a public issue. Use the campus-pilot sample.

## Known limitations

- Share links expose the full source to anyone who receives them.
- `localStorage` is not encrypted. Anyone with access to the browser profile can read saved pieces.
- A failed Linaw voice falls back to the browser speech engine, and Linaw does not choose that vendor.
- The seeded failure example always uses the fixture, even when a model key is set.
- The gateway's retention policy is not stated here. Do not paste personal information when that gateway is the provider that answers.
- The semantic check waits 4 seconds. A slow wake of `linaw-nli.onrender.com` reports Not run and stays out of the verdict.
