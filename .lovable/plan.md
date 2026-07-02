# Payments setup — Stripe (seamless, Lovable-managed)

Great — since you mentioned Stripe, I'll use **Lovable's built-in Stripe payments**. You don't need to paste any API keys or wire up a Stripe account manually; Lovable provisions a sandbox instantly and you claim/link your Stripe account when you're ready to go live.

## Tax handling (I'll set this up by default)
Blacure is a digital SaaS product, so I'll enable Stripe's **full compliance handling** (`managed_payments`). Stripe becomes merchant of record for transactions in ~80 supported buyer countries — they handle tax compliance, fraud, disputes, and transaction-level customer support. Cost: **+3.5%** on top of base Stripe fees. You can turn this off or change it per transaction later.

## What happens on approval
1. **Enable Stripe** via `enable_stripe_payments`. You'll get a short form (email defaults to your Lovable email, editable). Sandbox is live immediately.
2. **Create products** in Stripe (with tax codes for compliance):
   - **Pack** — $2 one-time → grants **40 credits** (20 prompts). Tax code: SaaS/digital service.
   - **Monthly** — $19.99/month recurring → unlimited Standard + Pro Studio. Tax code: SaaS subscription.
3. **Checkout flow**:
   - Server function `createCheckoutSession` (authenticated) → creates a Stripe Checkout Session with `managed_payments: { enabled: true }`, `client_reference_id = user_id`, success/cancel URLs to `/app` and `/pricing`.
   - Public webhook route `src/routes/api/public/stripe-webhook.ts` → verifies Stripe signature, handles:
     - `checkout.session.completed` (Pack) → `grant_credits(user_id, 40, 'pack_purchase', session_id)` (idempotent via existing unique `reason+ref`).
     - `customer.subscription.created / updated / deleted` → upsert `subscriptions` row (status, current_period_end, stripe_customer_id, stripe_subscription_id).
     - `invoice.paid` for renewals → refresh subscription period end.
4. **Wire pricing UI** (`src/routes/pricing.tsx`):
   - Replace both "Coming soon" buttons with active CTAs that call `createCheckoutSession({ plan: 'pack' | 'monthly' })` and redirect to Stripe.
   - Free tier CTA stays → `/auth`.
   - Add a small "Manage subscription" link in the app header for active subscribers (Stripe Billing Portal session).
5. **Test in sandbox** with Stripe test cards, verify credits + subscription flip correctly. Then you claim your Stripe account to go live.

## Confirm
Ready for me to enable Stripe now? Once you click Approve, I'll trigger the enable form for you to fill in.
