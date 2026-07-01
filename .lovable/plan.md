# Switch prompt generation to your OpenAI API key

Currently, prompt generation runs through the Lovable AI Gateway (billed via credits). You want to use your own OpenAI account with `gpt-4.1-mini` instead.

## What changes

**1. Store your OpenAI key as a secret**
- Request `OPENAI_API_KEY` via the secure secret form. You'll paste your key from https://platform.openai.com/api-keys.
- The key stays server-side only — never exposed to the browser.

**2. Rewire the server function** (`src/lib/prompt.functions.ts`)
- Replace the Lovable AI Gateway provider with the OpenAI provider (`@ai-sdk/openai`).
- Model: `gpt-4.1-mini`.
- Keep everything else identical: the same Zod input validation (enum guards, newline stripping), the same system prompt, the same output shape, and the same credit spend/refund flow around the call.
- If `OPENAI_API_KEY` is missing → return a clear error.
- If OpenAI returns 401/429/quota errors → refund the 2 credits and surface a friendly message.

**3. Install the OpenAI provider**
- `bun add @ai-sdk/openai` (the `ai` SDK is already installed).

## What stays the same

- Credit system (10 free prompts, 2 credits per generation, packs/subscription).
- Auth, RLS, database, UI, all form options, randomizer, history.
- Landing page, pricing, `/app` route.

## Notes

- Your OpenAI usage will be billed directly by OpenAI, not through Lovable credits — but the in-app credit gate still runs (so free/paid tiers still work for your users).
- If you later want to fall back to Lovable AI on OpenAI failures, that's a small follow-up.

Approve to implement.