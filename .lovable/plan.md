## Goal

Wire the Railway backend (`https://the-promptor-production.up.railway.app`) and its bearer token (`BLACURE_API_KEY_001`) into the app so `savePromptRailway`, `listMyPromptsRailway`, `sunoGenerate`, `udioGenerate`, and `testBackendRailway` actually hit it.

## What's already in place

`src/lib/railway.server.ts` already reads `process.env.API_BASE_URL` and `process.env.API_KEY` and sends `Authorization: Bearer <API_KEY>`. All server functions in `src/lib/railway.functions.ts` already route through it. So no code changes are needed — just secrets.

The reason "My Saved Prompts · Cloud" shows **Not found** today is `API_BASE_URL` isn't set, so `railwayFetch` short-circuits with an error.

## Plan

1. Store `API_BASE_URL = https://the-promptor-production.up.railway.app` as a runtime secret (via `set_secret`).
2. Store `API_KEY = BLACURE_API_KEY_001` as a runtime secret (via `set_secret`).
3. No file edits. No new dependencies.

## Verification

After secrets land, in the app:
- Click **Test backend** → expect a 2xx status and JSON body from `/api/suno/generate` (or a real upstream error instead of "API_BASE_URL is not configured").
- Click **Save prompt** on a generated prompt, then refresh **My Saved Prompts · Cloud** → the new prompt should appear.

## Note on `user_id`

The example uses `user_id: "blac"` hardcoded. The current server functions send the authenticated Supabase `userId` instead, which is safer (each signed-in user sees only their own saved prompts). I'll keep that behavior unless you want every user to share the `"blac"` bucket.

## Out of scope

- Changing the auth model to a shared `user_id`.
- Any UI changes.
- Rotating the API key or moving it to a per-user token.
