# Two-Tier Prompt Generation

Split generation into a cheap default and a premium "Pro Studio" mode gated by a paid subscription. Keep the system prompt hidden, short, and enforce a max length. Return only the final usable prompt (no preamble, no explanations).

## UX changes (`src/routes/_authenticated/app.tsx` + `PromptBuilder.tsx`)

- Replace the single "Generate Prompt" CTA with two buttons:
  - **Generate Prompt** — 2 credits. Fast, ~60–90 word prompt.
  - **Pro Studio Prompt** — 6 credits. Longer (~200–280 words), section-structured (Intro / Verse / Hook / Bridge / Outro, production notes, mix notes). Locked with a lock icon for non-subscribers; clicking routes to `/pricing`.
- Show a small "Pro" badge on the second button. Tooltip: "Included with Monthly plan".
- In `PromptBuilder`, prefer dropdowns over free text where feasible:
  - Convert **Topic / story** default entry to a `Theme preset` dropdown (already exists) + a short 200-char textarea only revealed via "Add custom detail" toggle.
  - Convert **Avoid words** to a multi-select chip list of common avoid tokens (artist names, explicit, brand names, etc.) with an "Other…" chip that opens a 120-char input.
  - Keep `title` as text (unavoidable) but reduce maxLength to 80.
- Add a header hint: "Long advanced mode is a Pro feature."

## Server changes (`src/lib/prompt.functions.ts`)

- Add `mode: "standard" | "pro"` to the validated input (Zod enum).
- Two hidden system prompts (kept server-side, never sent to client):
  - **standard**: 3–4 lines. "You write concise, ready-to-use AI music prompts. Max 90 words. Output only the prompt. No preamble, no markdown, no quotes."
  - **pro**: 5–6 lines. "You write studio-grade music prompts with sections: [Intro][Verse][Hook][Bridge][Outro], plus Production and Mix notes. Max 280 words. Output only the prompt."
- Credit cost by mode: standard = 2, pro = 6. Use existing `spend_credits` / `refund_credits`.
- Gate `pro` mode: call `has_role` or check `subscriptions.status = 'active'` for the caller; if not subscribed, throw `PRO_REQUIRED` → UI toast with "Upgrade" action → `/pricing`.
- Model choice stays `gpt-4.1-mini`. Set `maxTokens`: 220 for standard, 700 for pro. Temperature 0.85 standard, 0.9 pro.
- Post-process: trim, strip leading "Prompt:" / code fences / surrounding quotes so only the usable prompt is returned.

## Pricing page (`src/routes/pricing.tsx`)

- Update Monthly tier copy: "200 credits + unlocks Pro Studio Prompt mode".
- Free + Pack tiers: Standard mode only.

## Data / policy

- No new tables. Reuse `subscriptions` (active row = Pro access) and existing credit RPCs.
- Server-side subscription check inside the handler — never trust the client-sent `mode`.

## Out of scope

- No changes to auth, Paddle integration, or existing security scan fixes.
- No changes to randomizer, save/history, or landing page.

## Files touched

- `src/lib/prompt.functions.ts` — add `mode`, gating, two system prompts, per-mode cost + max tokens, output sanitizer.
- `src/lib/prompt-options.ts` — add `AVOID_PRESETS` list; export `PROMPT_MODES`.
- `src/components/PromptBuilder.tsx` — Avoid-words chips + optional custom textarea; title maxLength 80.
- `src/routes/_authenticated/app.tsx` — two-button CTA, Pro gating UI, subscription query, updated toasts.
- `src/lib/credits.functions.ts` (or new `subscription.functions.ts`) — `getMySubscription()` server fn returning `{ isPro: boolean }`.
- `src/routes/pricing.tsx` — mention Pro Studio unlock on Monthly tier.
