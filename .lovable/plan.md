## Change Monthly tier to Unlimited

Switch the $19.99/month plan from a 200-credit cap to unlimited prompts (Standard + Pro Studio), while keeping Free (10 prompts) and the $2 Pack (20 prompts) unchanged.

### Pricing page (`src/routes/pricing.tsx`)
- Monthly tier:
  - `prompts`: "Unlimited prompts + Pro Studio"
  - Features: "Unlimited Standard prompts", "Unlimited Pro Studio prompts", "Priority generation", "Cancel any time"
- Update the small footnote to clarify: credits only apply to Free and Pack; Monthly is unlimited.

### Server logic (`src/lib/prompt.functions.ts` + `credits.functions.ts`)
- Before spending credits, check active subscription (reuse the existing `subscriptions.status = 'active'` lookup already used for Pro gating).
- If subscriber → skip `spend_credits` / `refund_credits` entirely for both `standard` and `pro` modes. No credit deduction, no refund on failure.
- If not subscriber → existing 2/6 credit flow unchanged.
- Add a lightweight per-user rate limit for subscribers (e.g. 60 generations / hour) to prevent abuse. Implemented in-memory in the server fn is not durable; instead add a `generations_log` insert (user_id, created_at) and count last hour via the admin client. If over limit → friendly "Slow down" error, no credit charge.

### UI (`src/routes/_authenticated/app.tsx`)
- If user is subscribed: hide credit-cost labels on the two buttons ("2 credits" / "6 credits") and show "Included" instead. Header credit balance stays visible but add an "Unlimited" badge when subscribed.

### Data
- New table `public.generations_log (id uuid pk, user_id uuid, mode text, created_at timestamptz default now())` with RLS (user can select own; insert via service_role only) and appropriate GRANTs. Index on `(user_id, created_at desc)`.

### Out of scope
- No changes to Free tier, Pack tier, auth, Paddle setup, randomizer, or landing page.
- No change to credit grant on signup (still 20 credits = 10 free prompts).

### Files touched
- `src/routes/pricing.tsx` — copy + features
- `src/lib/prompt.functions.ts` — subscription bypass + rate-limit check
- `src/routes/_authenticated/app.tsx` — button labels + unlimited badge
- New migration — `generations_log` table + policies + grants
