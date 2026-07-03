The user wants to switch their backend from the old Railway URL to the new one: `the-promptor.up.railway.app`.

Current state: The backend URL is stored as the `API_BASE_URL` runtime secret. The application reads this secret at runtime; there is no hardcoded URL in the codebase.

Plan:
1. Update the `API_BASE_URL` secret to `https://the-promptor.up.railway.app`.
2. Verify the app can reach the new backend by checking the live preview.

That's it — a single secret update. No code changes are required.