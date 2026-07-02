## Button audit — issues found

### 1. `src/routes/_authenticated/app.tsx` — Pro Studio button copy is misleading
Both Pro Studio buttons (header + builder card) show "Pro Studio Prompt (6 credits)" when the user is not subscribed. Clicking triggers a "PRO subscription required" toast — the "6 credits" label implies credits can pay for it, which they can't.

**Fix:** When `!isPro`, label the button "Unlock Pro Studio" (keep the Lock icon + PRO badge). Keep "Pro Studio Prompt" / "Pro Studio" wording when `isPro`.

### 2. `src/routes/pricing.tsx` — CTAs don't do what they say
- "Buy 20 prompts" and "Subscribe monthly" both link to `/app`, not checkout. Since payments aren't wired yet, the labels overpromise.
- Meta description still says "$19.99/month for 100 prompts" (outdated — it's unlimited now).

**Fix:**
- Rename Pack CTA to "Coming soon" and Monthly CTA to "Coming soon" (disabled Button, no Link) until Paddle/Stripe is enabled. Keep Free tier CTA → `/auth`.
- Update meta description to reflect "unlimited monthly".
- Keep the existing footnote clarifying checkout is being set up.

### 3. `src/components/PromptPreview.tsx` — brand mismatch in loading text
Line 78 says "Composing your Suno-ready prompt…" — the brand rule is no Suno references in UI.

**Fix:** Change to "Composing your studio-ready prompt…".

### 4. `src/routes/index.tsx` — "Sign in" link always points to `/auth`
Signed-in users see "Sign in" even though they're authenticated. Low priority but worth fixing while we're here.

**Fix:** Use `useAuth` hook (already in project) — when there's a session, hide "Sign in" and change "Open Generator" behavior stays the same (goes to `/app`, which is auth-gated and redirects if needed). If unauthenticated, keep "Sign in" as is.

### Buttons verified as correct (no change)
- Landing hero buttons: "Launch The Promptor" → `/app`; "See how it works" → `#features` anchor. ✅
- App header/builder: Generate (standard), Randomize Vibe, Clear Form, Buy credits, Sign out, Home. ✅
- PromptPreview: Copy, Save (only shown when prompt exists), Delete/Copy per saved item, click-title to reuse. ✅
- Pricing "Get started free" → `/auth`. ✅

### Files to edit
- `src/routes/_authenticated/app.tsx` — Pro Studio labels
- `src/routes/pricing.tsx` — CTA disabled state + meta description
- `src/components/PromptPreview.tsx` — loading text
- `src/routes/index.tsx` — conditional Sign in link

No backend / server function changes. Purely UI copy + interaction correctness.
