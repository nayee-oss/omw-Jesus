# A+ Essay Copilot for Google Docs

A focused Google Docs sidebar for philosophy and political theory essay planning. It is designed to challenge reasoning, expose missing links, and improve structure. It is not a general essay writer and it never inserts or replaces text automatically.

## V1 flow

```text
Google Docs
  -> Apps Script sidebar reads question, selection, headings, and bounded plan context
  -> HTTPS bridge with a separate access token
  -> OpenClaw-configured OpenAI-compatible model provider
  -> concise tutor response
  -> user chooses Insert at Cursor, Replace Selection, or Copy
```

## What is included

- `apps-script/Code.gs`: Google Docs menu, context extraction, question detection, bounded requests, explicit insertion actions.
- `apps-script/Sidebar.html`: compact sidebar with `DEVELOP`, `CHALLENGE`, `EXPLAIN`, `CONNECT`, `IMPROVE`, and `PROFESSOR` actions.
- `apps-script/Setup.html`: stores only the bridge URL and bridge token in Google user properties.
- `bridge/server.mjs`: token-protected Node bridge. It reads the existing OpenClaw config on the server and calls the configured provider. No model key is sent to Google or the browser.
- `test/smoke.mjs`: local mock-provider integration test.

## Current OpenClaw integration

The server currently uses the provider configuration already present in `/root/.openclaw/openclaw.json` for the `business2` agent. That means the current default is the existing `yunzhuhub/gpt-5.6-sol` provider/model selection, unless overridden with `ESSAY_COPILOT_MODEL`.

The OpenClaw Gateway itself is currently loopback-only (`127.0.0.1:18789`). The bridge therefore uses the same OpenClaw-managed provider credentials server-side instead of exposing the Gateway token. This avoids putting any model key in Apps Script. A future version can route through `/hooks/agent` after the Gateway is deliberately exposed behind authenticated HTTPS.

## Run locally

From this directory:

```bash
export ESSAY_COPILOT_TOKEN="generate-a-long-random-token"
node bridge/server.mjs
```

The local endpoint is `http://127.0.0.1:8789`; Google Apps Script cannot call loopback, so local mode is for testing only.

Run the integration test:

```bash
node test/smoke.mjs
```

The smoke test uses a fake provider and does not contact the real model or read real credentials.

## Production bridge exposure

Google Apps Script requires an HTTPS URL reachable from Google's servers. Do not expose port 8789 directly and do not put the OpenClaw provider key in Apps Script.

Recommended options, in order:

1. Put the bridge behind an existing HTTPS reverse proxy with a dedicated path and a long random `ESSAY_COPILOT_TOKEN`.
2. Use Tailscale Serve/Funnel with an authenticated route to the bridge. Keep the OpenClaw Gateway itself private.
3. Deploy the bridge on a private serverless service with its provider key stored as a server-side secret. This is a fallback, not the preferred reuse of the current OpenClaw host.

The bridge has CORS headers because Apps Script may use cross-origin requests, but authorization is still required. Use HTTPS only in production.

## Install into Google Docs

1. Open a test Google Doc.
2. `Extensions` -> `Apps Script`.
3. Replace the default script with `apps-script/Code.gs`.
4. Add two HTML files named exactly `Sidebar` and `Setup`, then paste the matching `.html` files.
5. Save and reload the Google Doc.
6. Open `A+ Essay Copilot` -> `Set bridge configuration`.
7. Enter the HTTPS bridge URL and the bridge access token. Never enter a model API key.
8. Open `A+ Essay Copilot` -> `Open Copilot`.
9. Grant the requested Google Docs authorization.

## Test question

```text
Is Rawls's theory of justice preferable to Nozick's entitlement theory?
```

A useful test plan:

- Put the question at the top as `Question:`.
- Add a short thesis, two argument bullets, an objection, and a weak response.
- Highlight one paragraph and press `CHALLENGE`.
- Press `DEVELOP` on the same selection.
- Press `CONNECT` with Rawls, Nozick, Hayek, redistribution, and self-ownership in the notes.
- Press `IMPROVE` to run the A+ checklist.
- Insert only the specific suggestion you accept.

## Security and limitations

- Keep `ESSAY_COPILOT_TOKEN` private. Rotate it if exposed.
- Do not put OpenClaw API keys, Gateway tokens, or provider credentials in Apps Script HTML.
- The bridge sends bounded context, not an unlimited document: question, selected text, current section, and up to 24,000 characters of document context.
- V1 detects a question from a `Question:` label or an early line ending in `?`; it remains editable in the sidebar.
- V1 replacement handles the first selected text range. Multi-range and rich-format replacement should be improved before broad deployment.
- The tutor does not have a course reading database yet and must say when a reference is uncertain.
- The bridge has no user account layer or usage quotas yet; add rate limiting before sharing it with other students.
