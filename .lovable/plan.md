## Root cause

Server logs on the live app show:

```
TypeError: Invalid URL: the-promptor-production.up.railway.app/prompts/...
```

The `API_BASE_URL` secret was stored without a scheme (missing `https://`), so `fetch()` in `src/lib/railway.server.ts` throws before the request even leaves the Worker. That error is caught and returned to the client as the generic "Could not reach backend." message.

The Railway backend itself is healthy — `https://the-promptor-production.up.railway.app/health` returns `200 {"status":"ok"}`.

## Fix

Update the `API_BASE_URL` secret value to include the scheme:

- From: `the-promptor-production.up.railway.app`
- To:   `https://the-promptor-production.up.railway.app`

This is a one-secret update — no code changes needed. `railway.server.ts` reads `process.env.API_BASE_URL` at request time, so the new value takes effect on the next invocation (no redeploy required).

## Verification

After updating, I'll call `pingRailway` server-side and confirm it returns `{ ok: true }` and that the "My Saved Prompts" panel loads without the error.
