## Changes

### 1. `src/routes/_authenticated/app.tsx` — route Generate to Railway
Swap the `generatePrompt` call in `handleGenerate` for `generatePromptRailway` from `src/lib/railway.functions.ts`.

- New import: `import { generatePromptRailway } from "@/lib/railway.functions";`
- Drop the AI-gateway import.
- Call shape:
  ```ts
  const res = await generatePromptRailway({ data: { inputs, mode } });
  if ("error" in res) { toast.error(res.error); setError(res.error); return; }
  setPrompt(res.data.prompt);
  ```
- Keep the existing client-side gating (`isPro`, `balance >= cost`) so non-subscribers with 0 credits still get blocked before the call.

### 2. `src/lib/railway.functions.ts` — fix Test backend endpoint
In `testBackendRailway`, change `/api/suno/generate` → `/suno/generate` to match the real Railway route.

## Credit-deduction tradeoff (call out)

The current AI-gateway `generatePrompt` also spent credits server-side and returned the new balance. Railway's `/generate-prompt` doesn't. After this switch:
- Non-subscribers can still generate as long as their **cached** balance ≥ cost (client-side check), but nothing decrements the DB balance.
- Effectively, credits become a soft cap that never depletes.

If that's not desired, next step (out of scope for this turn) would be either:
- Have Railway call back to spend credits, or
- Keep a thin `spendCredits` server function and call it alongside `generatePromptRailway`.

Confirming the swap either way — just flagging.

## Not changed

- `savePromptRailway`, `listMyPromptsRailway`, `sunoGenerate`, `udioGenerate` already hit the correct Railway paths via `API_BASE_URL`.
- `user_id` stays as the authenticated Supabase user id (not the hardcoded `"blac"` from your example).
- No UI changes, no new secrets.
