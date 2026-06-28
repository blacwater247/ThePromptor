
## Goal

Gate prompt generation behind a credit system and let users pay to top up or subscribe.

**Pricing**
- 10 free prompts on signup (one-time, = 20 credits)
- Pay-as-you-go: **$2.00 for 20 prompts** (40 credits)
- Monthly subscription: **$19.99/mo for 200 credits** (= 100 prompts)
- **1 prompt = 2 credits** (every successful generation deducts 2)

## Prerequisites (require user action before I build)

1. **Lovable Cloud** must be enabled (for auth, DB, secure credit ledger). The app currently has no auth — credits can't be securely tracked per-user without it.
2. **Pro plan** on Lovable (required for payments).
3. **Payment provider**: I recommend **Paddle** (merchant of record, handles global VAT/tax automatically for a digital AI tool sold worldwide; both one-time and subscription supported). I'll run `recommend_payment_provider` to confirm fit before enabling.

## Plan

### 1. Enable Cloud + Auth
- Turn on Lovable Cloud.
- Add a simple email/password (and Google) auth flow with a gated `/app` route (`_authenticated` layout).
- On first signup, seed the user with **20 credits** (the 10 free prompts).

### 2. Credits data model (Cloud / Supabase)
- `profiles` (user_id, email, created_at)
- `credits_balance` (user_id PK, balance int, updated_at) — current credit total
- `credit_transactions` (id, user_id, delta int, reason enum: `signup_bonus | purchase_pack | subscription_grant | prompt_spend | refund`, ref text, created_at) — full audit log
- `subscriptions` (user_id, provider_customer_id, provider_sub_id, status, current_period_end, plan)
- RLS: users read their own rows only. All writes go through SECURITY DEFINER RPC `spend_credits(amount)` and `grant_credits(amount, reason, ref)` so the client can never inflate balance.
- `user_roles` + `has_role` for admin (per platform rules).

### 3. Spend gate on generation
- `generatePrompt` server fn: require auth, call `spend_credits(2)` BEFORE the AI call inside a transaction. If balance < 2 → throw a typed "insufficient_credits" error. If the AI call fails, refund the 2 credits (insert compensating transaction).
- UI shows current balance in the app header and disables **Generate Prompt** at 0–1 credits with a "Buy credits" CTA.

### 4. Payments (Paddle)
- Enable Paddle via `enable_paddle_payments`.
- Create two products:
  - **Prompt Pack 20** — one-time $2.00 → grants 40 credits
  - **Promptor Monthly** — $19.99/mo → grants 200 credits on initial purchase and on each renewal
- Checkout flow: "Buy credits" / "Upgrade" buttons open Paddle checkout sessions tied to the signed-in user.
- Webhook at `src/routes/api/public/paddle-webhook.ts`:
  - Verify Paddle signature (HMAC, timing-safe)
  - On `transaction.completed` for the pack → `grant_credits(40, 'purchase_pack', tx_id)` (idempotent on tx_id)
  - On `subscription.activated` and `subscription.renewed` → `grant_credits(200, 'subscription_grant', event_id)` (idempotent)
  - On `subscription.canceled` → mark sub canceled; do not revoke already-granted credits

### 5. UI changes
- **Header (in `/app`)**: avatar menu, credits badge (e.g. "⚡ 18 credits"), "Buy credits" button.
- **New `/pricing` route**: three cards — Free (10 prompts), Pack ($2 / 20 prompts), Monthly ($19.99 / 100 prompts). Each with checkout button. Reuse gold/black brand styling.
- **Landing page**: add a "Pricing" link in nav and a pricing section/CTA above the footer.
- **Insufficient credits**: toast + modal pointing to /pricing.
- **Account page** (`/account`): show balance, recent credit transactions, active subscription + manage/cancel link (Paddle customer portal).

### 6. Copy + SEO
- `/pricing` head(): unique title, meta description, canonical, og tags.
- Update landing subtitle to mention "Start with 10 free prompts".

## Technical notes

- Credit math is server-side only via Postgres RPCs; client never writes to balance tables.
- All grants are idempotent keyed by Paddle event/transaction ID to survive webhook retries.
- Refund-on-failure path covers AI gateway 429/402/network errors so users aren't charged credits for failed generations.
- Subscription credits are **granted, not metered** — on renewal the user gets +200 (they don't roll over by default; confirm below).

## Open questions

1. **Auth methods** — email/password only, or also Google sign-in?
2. **Subscription credit rollover** — when a subscriber renews with leftover credits, do unused credits **roll over** or **reset to 200**? (Default I'll use: roll over / accumulate, since they paid for them.)
3. **Free prompts trigger** — 10 free on signup only, or also "try before signup" (anonymous, IP-throttled)? Anonymous is abusable; I recommend signup-gated.
4. **Provider confirmation** — OK to proceed with Paddle, or do you want Stripe?
