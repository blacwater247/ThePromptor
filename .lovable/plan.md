# Connect Blacure to your Railway FastAPI backend

Goal: call your Railway endpoints from Blacure without exposing the API key and without touching your existing OpenAI generator or prompt packs. Calls go **browser → Lovable server function → Railway**, so there is no CORS wiring on your end (server-to-server calls skip the browser CORS check).

## What you'll get

1. **Secure config** — `API_BASE_URL` and `API_KEY` stored as Lovable Cloud secrets (server-only, never shipped to the browser). Adding future endpoints is just new function calls; adding future services is one more secret.
2. **A single Railway client** (`src/lib/railway.server.ts`) that:
   - Reads `API_BASE_URL` / `API_KEY` inside the handler (never at module scope).
   - Sends `Authorization: Bearer ${API_KEY}` when set.
   - 20s timeout via `AbortSignal.timeout`, JSON in/out, safe error mapping (never forwards raw upstream errors to the user).
3. **Typed server functions** in `src/lib/railway.functions.ts`, one per Railway route, all behind `requireSupabaseAuth` so only signed-in Blacure users can hit them:
   - `generatePromptRailway` → `POST /generate-prompt`
   - `savePromptRailway` → `POST /save-prompt`
   - `listMyPromptsRailway` → `GET /prompts/{user_id}` (userId is injected from the verified session — the client cannot spoof another user's ID)
   - `sunoGenerate` → `POST /suno/generate`
   - `udioGenerate` → `POST /udio/generate`
   Each validates its input with a small inline schema and returns a plain `{ data } | { error }` shape.
4. **New UI section on `/app`** (added alongside — nothing existing is removed):
   - "Send to Suno" and "Send to Udio" buttons under the existing prompt preview, using the current polished prompt.
   - "Save prompt" button and a "My saved prompts" panel powered by the Railway list endpoint.
5. **Health check** — a tiny `pingRailway` server function + a dev-only status pill so you can confirm connectivity after deploying.

## Why server functions, not direct browser fetch

- API_KEY never reaches the browser bundle.
- No CORS config needed on FastAPI — Railway only ever sees requests from Lovable's server, not from `thepromptor.life`.
- The signed-in user's ID is attached server-side, so `GET /prompts/{user_id}` can't be called for someone else.
- Matches how Stripe and OpenAI are already wired in this project.

## Secrets you'll add

I'll trigger Lovable's secure secret form for:
- `API_BASE_URL` — e.g. `https://your-app.up.railway.app` (no trailing slash)
- `API_KEY` — optional; if you don't set it, the client just omits the Authorization header

Future services are the same pattern: add `FOO_BASE_URL` / `FOO_API_KEY`, drop in another `foo.server.ts` client and a `foo.functions.ts` file.

## FastAPI expectations (your side)

- Auth: read `Authorization: Bearer <API_KEY>` and reject if missing/wrong (when you set the secret).
- Return JSON with a stable shape per endpoint; document error responses as `{ "error": "message" }` so the client can surface a clean message.
- Suggested contracts (adjustable):
  - `POST /generate-prompt` → `{ prompt: string, meta?: object }`
  - `POST /save-prompt` → `{ id: string }`
  - `GET /prompts/{user_id}` → `{ prompts: Array<{ id, prompt, created_at }> }`
  - `POST /suno/generate` and `POST /udio/generate` → `{ job_id: string, status: string, url?: string }`
- CORS: **not required** for this integration. Only add it if you also want to call Railway directly from a browser later.

## Files touched

```text
src/lib/railway.server.ts       (new — fetch client + error mapping)
src/lib/railway.functions.ts    (new — 5 server fns + pingRailway, all auth-gated)
src/routes/_authenticated/app.tsx (add Suno/Udio/Save UI section at the bottom)
src/components/SavedPromptsPanel.tsx (new — small list component)
```

Nothing in `src/lib/prompt.functions.ts`, `payments.functions.ts`, `packs.functions.ts`, or the existing generator UI is modified.

## Verification

After you paste the secrets, I'll invoke `pingRailway` from the server to confirm the base URL resolves and auth is accepted, then take a Playwright screenshot of the new `/app` section wired to a real Railway call.
