## Goal
Rip out all Railway code and add tiny client-side helpers for prompt generation and saved prompts (localStorage). Nothing in the app currently renders `RailwayActions` or `SavedPromptsPanel`, so this is pure cleanup + two new files.

Note: the main `/app` page already uses `generatePrompt` from `src/lib/prompt.functions.ts` (a Lovable server function backed by Lovable AI Gateway, not Railway). That stays. The new `generatePrompt` helper you pasted would collide with it, so I'll name the new client helper `generatePromptLocal` to avoid the clash — you can wire it in later if you want to fully replace the server one.

## Changes

### Add
- `src/lib/generatePrompt.ts` — exports `generatePromptLocal(inputs)` and the `PromptInputs` / `GeneratedPrompt` types from your snippet (renamed to avoid collision with the existing server `generatePrompt`).
- `src/lib/savedPrompts.ts` — exports `savePromptLocal`, `listSavedPromptsLocal`, `deleteSavedPromptLocal`, and `SavedPrompt` type. Uses `localStorage` key `promptor:saved-prompts`.

### Delete
- `src/lib/railway.functions.ts`
- `src/lib/railway.server.ts`
- `src/components/RailwayActions.tsx` (unused)
- `src/components/SavedPromptsPanel.tsx` (unused, calls Railway)
- `.lovable/plan.md` (stale plan doc)

### Leave alone
- `src/lib/prompt.functions.ts` and the `/app` route — still working via Lovable AI, not Railway.
- `src/routes/_authenticated/app.tsx` — no Railway imports.

## Post-change actions (you do these)
- Delete secrets `API_BASE_URL` and `API_KEY` in Lovable project settings — nothing references them after this.
- Shut down / delete the Railway project.
- Domain `thepromptor.life` is already on Lovable — no DNS changes.

## Not doing (unless you ask)
- Wiring `generatePromptLocal` / `savePromptLocal` into any UI. Your app already generates prompts via Lovable AI server-side, which is better than the client-side stub. Say the word if you want me to swap the `/app` page over to the local helpers instead.
