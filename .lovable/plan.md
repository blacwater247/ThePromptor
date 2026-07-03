Update the `API_BASE_URL` runtime secret to `https://the-promptor-production.up.railway.app`.

No code changes are needed — server-side `railwayFetch` reads `process.env.API_BASE_URL` at request time, so the new backend takes effect immediately after the secret update.

Steps:
1. Update the `API_BASE_URL` secret to `https://the-promptor-production.up.railway.app`.
2. Verify the app can reach the new backend from the live preview.