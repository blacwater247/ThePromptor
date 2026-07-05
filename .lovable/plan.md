## Goal

Enforce the intended free-tier behavior: **10 free prompts, once. When they're gone, block the Generate button and show an upgrade modal offering the $5 pack or $19.99/mo plan.** No auto-refill anywhere.

## Findings from the current app

- Free grant already works correctly: `handle_new_user` inserts 20 credits (10 Standard prompts × 2 credits) with `ON CONFLICT (reason, ref) DO NOTHING` on `signup_bonus`, so it can never re-grant.
- No cron, trigger, or function refills `credits_balance`. The only positive deltas in the DB come from `signup_bonus` (once) and `purchase_pack` (Stripe webhook). Balance does **not** actually reset — users who felt it "reset" had bought packs.
- The real gap: when a signed-in user with `balance < 2` clicks Generate, the server throws `INSUFFICIENT_CREDITS` and it surfaces as a plain toast. There's no clear "buy a pack or subscribe" moment.

## Changes

### 1. `src/components/PromptBuilder.tsx` — client-side gate
- Read `balance` and `unlimited` (subscriber flag) from the existing `getMyCredits` + `getMySubscription` queries already used elsewhere on `/app`; pass them in as props from `src/routes/app.tsx` (which already loads both).
- When user is signed in, not a subscriber, and `balance < 2` (Standard cost):
  - Disable the Generate button, change its label to "Out of free prompts".
  - Open an `<UpgradeModal />` on click instead of calling the server fn.
- Pro Studio button already gated by `isPro`; keep as-is.

### 2. New `src/components/UpgradeModal.tsx`
- shadcn `Dialog`. Copy: "You've used your 10 free prompts. Grab a pack or go unlimited to keep generating."
- Two CTAs linking to `/pricing`:
  - "Buy 20 prompts — $2" (existing `credits_pack_20_onetime`)
  - "Go unlimited — $19.99/mo"
- Secondary link: "See all plans".

### 3. `src/routes/app.tsx` — surface the same state
- If signed in, not subscriber, `balance < 2`: render a persistent amber banner above the builder ("You're out of free prompts — [Upgrade]") in addition to the modal, so it's obvious on page load.

### 4. Server safety net (already correct, verify only)
- `src/lib/prompt.functions.ts` already throws `INSUFFICIENT_CREDITS` via `spend_credits` RPC before generation; keep the client-side gate + server enforcement both in place.
- No DB migration needed — confirmed no refill logic exists.

## Out of scope
- Guest generator on `/` (not tied to per-user free credits).
- Pricing page copy changes.
- Subscriber rate limit (already 60/hr).

## Verify
1. As a user with `balance = 0`: reload `/app` → amber banner visible, Generate button disabled and labeled "Out of free prompts", clicking opens the upgrade modal.
2. Buy the $2 pack → webhook grants 40 credits → banner and modal disappear, Generate re-enables.
3. Subscribe monthly → unlimited path bypasses the gate regardless of balance.
