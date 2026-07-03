## Root cause

The credit-check on the server disagrees with the credit UI on the client about whether a user has an active subscription.

- UI (`src/routes/_authenticated/app.tsx` → `getMySubscription`) filters `subscriptions` by the **client** Stripe environment (`getStripeEnvironment()` — derived from `VITE_PAYMENTS_CLIENT_TOKEN`, i.e. `pk_test_*` → `sandbox`, `pk_live_*` → `live`).
- Server (`src/lib/prompt.functions.ts`) queries `subscriptions` for the user with **no environment filter** — it just takes the latest row.

The one subscriber in the DB has `environment = 'sandbox'` and `status = 'active'`. If that same account is used on a build where the client resolves to `live` (or the two ever diverge), the client shows the "credits" chip and calls Generate, while the server sees an active sandbox sub and takes the "subscriber = unlimited" branch:

```ts
// prompt.functions.ts (current)
const { data: subRows } = await context.supabase
  .from("subscriptions")
  .select("status, current_period_end, cancel_at_period_end")
  .eq("user_id", context.userId)
  .order("created_at", { ascending: false })
  .limit(1);
const isSubscriber = isSubscriptionActive(subRows?.[0]);
// ...
if (!isSubscriber) { spend_credits(...) }  // never runs → balance never moves
```

That matches exactly what the logs show for user `7522002e…`: many `generations_log` rows after `2026-07-03 16:02`, zero matching `credit_transactions` in that same window, balance frozen at 82.

## Fix

Align the server's subscription check with the client's:

1. **`src/lib/prompt.functions.ts`**
   - Add `environment: "sandbox" | "live"` to the `InputSchema` (required).
   - In the subscription query, add `.eq("environment", data.environment)` so only the same-env sub counts as "unlimited".

2. **`src/routes/_authenticated/app.tsx`**
   - In `handleGenerate`, pass `environment: getStripeEnvironment()` in the `generatePrompt({ data: { ... } })` call so client and server agree.

3. No DB migration, no UI redesign, no other files changed.

## Result

- Subscriber whose sub matches the current environment: still unlimited, no deduction (unchanged).
- Non-subscriber (or subscriber viewing the other environment's app): server hits `spend_credits`, balance drops by 2 per Standard prompt, UI updates from the returned `balance`. The "prompts" counter (`Math.floor(balance / 2)`) then decreases as expected.

## Out of scope

- Refactoring `getStripeEnvironment()` or the sandbox/live split.
- Any change to Pro Studio gating, refund path, or rate limit.
