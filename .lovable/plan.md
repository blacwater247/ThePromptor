## Connect backend to Railway URL

Set the Railway FastAPI URL as the `API_BASE_URL` secret so the existing server functions in `src/lib/railway.server.ts` and `src/lib/railway.functions.ts` route to your backend.

### Steps

1. **Store `API_BASE_URL`** = `https://the-promptor-production.up.railway.app` via Lovable's secure secret form (server-only env var, never shipped to browser).
2. **Ask about `API_KEY`** — do you want to also set an API key now for `Authorization: Bearer` on upstream calls? If yes, I'll open the secret form for it. If your FastAPI is currently open, we can skip it and add later.
3. **Verify** — invoke `pingRailway` server-side against `/health` and report status. If your backend uses a different health path (e.g. `/`), I'll adjust `pingRailway` in `railway.functions.ts`.

### Notes

- No code changes required for the URL itself — it's read from `process.env.API_BASE_URL` inside the handler.
- No CORS setup needed on FastAPI (server-to-server).
- If `/health` doesn't exist on your backend, ping will return "Not found." — tell me the correct health path and I'll update it.
