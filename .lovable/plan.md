## What happened

Stripe delivered two live `checkout.session.completed` events for your $2 credit-pack purchases, but the webhook returned without granting credits:

```
[warn] [webhook] no lookup_key on session line items cs_live_a1Mk3L5S0K1rd3Gtmp0zQn1wpZo6kvVEuFG0cL44FN6bLqDhXqKgR4WElG
[warn] [webhook] no lookup_key on session line items cs_live_a1g2zcu6bIuWW8BOLej0ieHImo8e4RvmlSYmX5GG8TONqJItnWnnO5nANI
```

Stripe does not expand `line_items` in webhook payloads by default, so `session.line_items.data` is empty. Our handler had a `console.warn` + early-return in exactly that case, so no `grant_credits` was ever called. `payment_intent.succeeded` also never arrived (Checkout with `managed_payments` doesn't guarantee it), so the fallback never ran either. Your DB shows no `purchase_pack` rows — confirmed.

## Fix

### 1. Harden the webhook (`src/routes/api/public/payments/webhook.ts`)

Rewrite `handleCheckoutCompleted` so it always resolves the price when `mode === "payment"`:

1. If `session.line_items` isn't expanded, call `stripe.checkout.sessions.listLineItems(session.id, { expand: ["data.price"] })`.
2. Resolve the lookup key in this order: `price.lookup_key` → `price.metadata.lovable_external_id` → look up `session.metadata.price_id` we stamped in `createCheckoutSession`.
3. Call `grant_credits` with `_ref = "stripe:{session.id}"` (unique constraint on `(reason, ref)` guarantees idempotency across retries).
4. Keep `payment_intent.succeeded` as a secondary path; use ref `stripe:{env}:{intent.id}` — different from the session ref so both paths are independently idempotent but won't double-grant because we'll switch the session path to use the `payment_intent` id as the ref too (see below).

To make both paths truly non-duplicating, use `stripe:pi:{payment_intent_id}` as the canonical ref in both handlers. `checkout.session.completed` exposes `session.payment_intent`; `payment_intent.succeeded` exposes `intent.id`. Same ref → unique constraint blocks the second grant.

### 2. Retro-grant the two missing purchases

After the webhook fix ships, insert the two grants directly using the same ref scheme so a future Stripe replay is a no-op. For each of the two sessions above, look up its `payment_intent`, then call `grant_credits(user_id, 40, 'purchase_pack', 'stripe:pi:{pi_id}')`. The user is `7522002e-40be-4570-912b-b8707fd2dc7e` (only paying user in the table). Net: +80 credits.

I'll fetch the two `payment_intent` ids from Stripe in the migration/insert step so the refs match what future webhook retries would use.

### 3. Verification

- Redeploy → the account page shows +80 credits and two `Credit pack purchase` rows in Recent activity.
- Server logs: no more `no lookup_key on session line items` warnings on the next test purchase.
- Buy one more $2 pack with test card `4242 4242 4242 4242` in sandbox to confirm the new path grants 40 credits end-to-end.

## Technical notes

- `stripe.checkout.sessions.listLineItems` is a single extra API call per pack purchase — cheap and reliable. Expanding via `expand: ["data.line_items"]` in the webhook payload itself is not possible (Stripe controls webhook shape).
- We keep the `env` filter and the `?env=` query parameter routing untouched.
- No schema changes. `credit_transactions` unique `(reason, ref)` already enforces idempotency.
- No client-side changes.
