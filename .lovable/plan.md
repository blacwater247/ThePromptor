## Context

Backend at `the-promptor-production.up.railway.app` now has:
- `/prompts/*` endpoints (PR #1)
- `/api/prompts/*` variants (PR #2)
- `/api/suno/generate` and `/api/udio/generate` variants (PR #3)

Current frontend calls unprefixed paths (`/suno/generate`, `/udio/generate`, `/save-prompt`, `/prompts/:userId`, `/generate-prompt`, `/health`) via `src/lib/railway.functions.ts` → `railwayFetch`. Earlier probes to `/` and `/health` returned Railway's edge 404 ("Application not found") — need to re-verify now that PRs are deployed.

## Plan

1. **Verify backend is live** — curl `/health`, `/api/suno/generate` (with a minimal body), and `/api/prompts/{fake-id}` to confirm the service responds (any status other than the Railway edge 404 means the app is up).
2. **Switch all frontend paths to `/api/*`** in `src/lib/railway.functions.ts`:
   - `/health` → keep as-is (or `/api/health` if backend exposes it — will check in step 1)
   - `/generate-prompt` → `/api/generate-prompt`
   - `/save-prompt` → `/api/save-prompt`
   - `/prompts/{userId}` → `/api/prompts/{userId}`
   - `/suno/generate` → `/api/suno/generate`
   - `/udio/generate` → `/api/udio/generate`
3. **Improve Suno button feedback** in `src/components/RailwayActions.tsx`:
   - Add an optional "Tags / style" input (wired to the existing `tags` field in `sunoGenerate`).
   - After a successful call, render an inline result block showing `job_id`, `status`, and an "Open track" link when `url` is present.
   - Surface the sanitized upstream error message in the toast instead of the generic "Request failed."
4. **Verify** — from the live preview, click **Send to Suno** with a generated prompt, confirm the network call hits `/api/suno/generate` on Railway, and confirm the result block renders.

## Technical notes

- `railwayFetch` reads `API_BASE_URL` / `API_KEY` at request time from Cloudflare env; no restart or secret change needed.
- Only `src/lib/railway.functions.ts` and `src/components/RailwayActions.tsx` change. Server helper, auth middleware, and secrets stay untouched.
- If step 1 shows the backend still 404s at the edge, I'll stop and report back — no frontend change fixes an undeployed backend.