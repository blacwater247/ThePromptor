## Goal
Make the "Send to Suno" button in `RailwayActions` actually trigger a Suno generation via the Railway backend.

## Current state
- Button calls `sunoGenerate` server fn → `POST {API_BASE_URL}/suno/generate` with `{ user_id, prompt, title, tags }` and `Authorization: Bearer ${API_KEY}`.
- On success it just toasts "Sent to Suno." — no job status, no link, no way to know if it worked.
- No visibility into failures beyond a generic toast.

## Questions before building

1. **Does the Railway backend `/suno/generate` endpoint actually exist and work today?** If you hit it directly with `curl` and a valid API key, do you get `{ job_id, status, url? }` back? If not, the button can't work regardless of frontend changes — the fix is backend-side.

2. **What should happen after clicking Send to Suno?** Options:
   - (a) Fire-and-forget — just toast success (current behavior, but confirm the request reached upstream).
   - (b) Show the returned `job_id` / status inline and a link if `url` is returned immediately.
   - (c) Poll a `/suno/status/{job_id}` endpoint until the track is ready, then show a play/download link.

3. **Any Suno-specific inputs to expose in the UI** (tags/style, instrumental toggle, model version)? Right now only `title` is collected; `tags` is wired in the server fn but never sent from the UI.

## Proposed plan (pending answers)

Assuming the backend endpoint works and you want option (b) — visible feedback with job id + link when available:

1. **Verify the endpoint** — hit `https://the-promptor-production.up.railway.app/suno/generate` from the running app; capture the exact response shape and any error. Adjust `MusicJobResponse` typing if it differs.
2. **Extend `RailwayActions` UI**:
   - Add an optional "Tags / style" input (e.g. `trap, dark, 140bpm`).
   - After a successful Suno response, render a small result block under the actions showing `job_id`, `status`, and an "Open track" link when `url` is present.
   - Keep Udio + Save behavior unchanged.
3. **Better errors** — surface the upstream error string from `railwayFetch` (already sanitized) in the toast instead of a generic "Request failed."
4. **Verify** in the live preview: click Send to Suno with a generated prompt, confirm the request hits Railway (network tab), and confirm the result block renders.

If you want polling (option c), add step 5: a `getSunoStatus` server fn + a `useQuery` with `refetchInterval` until `status === "complete"`.

Reply with answers to the 3 questions (especially #1 and #2) and I'll lock the plan.