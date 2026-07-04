## Changes

### 1. `src/components/RailwayActions.tsx`
- Remove "Send to Suno" and "Send to Udio" buttons.
- Remove `sunoGenerate` / `udioGenerate` imports.
- Remove `"suno"` and `"udio"` from the `Busy` union.
- Change actions grid from 3 columns to 1 (just "Save prompt").
- Keep the Title input, Save prompt button, and Test backend section unchanged.

### 2. `src/lib/railway.functions.ts`
- Delete the `sunoGenerate` and `udioGenerate` server functions (unused after UI removal).
- Delete the `MusicJobResponse` type.
- Update `testBackendRailway` to POST `/suno/generate` instead of `/api/suno/generate` so it matches the current FastAPI backend.

### Not changing
- Backend `main.py` (lives outside this project — you'll add stacked `/api/*` decorators there if you want both paths).
- `savePromptRailway`, `generatePromptRailway`, `listMyPromptsRailway`, `pingRailway` — untouched.
- Auth middleware and Supabase integration — untouched.
