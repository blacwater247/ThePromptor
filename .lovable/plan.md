## Goal

1. First 10 prompts are free with **no signup** — tracked in the browser.
2. On the 11th attempt, show a wall asking the user to sign up. After they sign up, the existing $5 pack kicks in as the next paid step (existing paywall in the authenticated app already handles this).
3. Tighten mobile layout on the landing page and the app header.

## Scope

### 1. Public generator (no signup for the first 10)

- Move the generator UI out from behind auth so signed-out users can use it.
  - New route: `src/routes/app.tsx` (public) renders the generator.
  - Keep `src/routes/_authenticated/app.tsx` for authenticated flows (credits, packs, Pro Studio). Public route shares the same `PromptBuilder` + `PromptPreview` components but with signed-out-specific logic.
  - Alternative (simpler): keep one route, remove the `_authenticated` gate for `/app`, branch behavior in-component based on `useAuth().user`. We'll use this simpler approach and delete `src/routes/_authenticated/app.tsx` after moving its content to `src/routes/app.tsx`.

- Signed-out behavior:
  - Track free-prompt usage in `localStorage` under `blacure.freePrompts.v1` = `{ used: number }`. Limit = 10.
  - Standard "Generate" is enabled while `used < 10`. Pro Studio stays locked (requires signup + Monthly).
  - Randomize / Clear / Save-locally all work without an account.
  - After each successful generation, increment `used`.
  - Header credit chip becomes "X of 10 free prompts left" for guests; "Sign in" button replaces Account/Sign-out.

- Signed-in behavior: unchanged (credits, subscription, packs).

- Server function `generatePrompt` currently requires auth (uses `requireSupabaseAuth` for credit debit). Add a sibling `generatePromptGuest` server function with **no** auth middleware that:
  - Accepts the same inputs (minus `mode` — guests are Standard only).
  - Rate-limits by IP (simple in-memory or DB table `guest_prompt_usage(ip, count, day)`) to prevent abuse: max 15/day/IP as a soft cap on top of the browser 10-limit.
  - Calls the same AI generation code path, returns `{ prompt }` with no `balance`.
  - Never debits credits.
  - Rejects `mode: "pro"`.
  - Public route calls `generatePromptGuest`; authenticated route keeps calling `generatePrompt`.

### 2. Signup wall after 10

- When guest hits limit, show a modal / inline card in the generator:
  - Title: "You've used your 10 free prompts"
  - Body: "Create a free account to keep going. After that, top up 20 more for $5 or go unlimited monthly."
  - Buttons: "Create account" → `/auth`, "See pricing" → `/pricing`.
- Existing paid flow ($5 Pack via `credits_pack_20_onetime`) is unchanged and takes over automatically once signed in.

### 3. Pricing copy

`src/routes/pricing.tsx` Free tier:
- `prompts`: "10 prompts — no signup"
- `features[0]`: "10 free prompts, no account needed"
- CTA for Free tier links to `/app` (not `/auth`).

Landing hero (`src/routes/index.tsx`) already says "no card required" — change to "no signup, no card required".

### 4. Mobile layout tightening

Audited pages: `/`, `/app`, `/pricing`.

- **Landing (`src/routes/index.tsx`)**
  - Nav: hide "Pricing" text link on very small screens if it wraps, or shrink to icon. Currently `sm:inline` already hides Sign-in — keep, but reduce nav `py-5` → `py-4` on mobile so hero moves up.
  - Hero: reduce mobile heading from `text-5xl` → `text-4xl` on `<sm`; reduce logo from `h-32 w-32` → `h-24 w-24` on `<sm`; reduce hero vertical padding `py-16` → `py-10` on mobile.
  - CTAs stack full-width on mobile (`w-full sm:w-auto` on both buttons).
  - Feature grid already responsive — leave.

- **App page (`src/routes/app.tsx`)**
  - Header action row wraps awkwardly on ~360–400px widths (credits chip + 4 buttons). Group buttons into a right-side flex that wraps to a second row cleanly, and drop the second-row icon-only Sign-out into the Account menu on `<sm` (or keep but ensure `gap-1.5` and `flex-wrap` so nothing overflows).
  - Reduce H1 from `text-3xl sm:text-5xl` → `text-2xl sm:text-5xl` on mobile.
  - Generate button row: add `w-full sm:w-auto` to primary + Pro Studio buttons on `<sm` so they stack instead of squishing.

- **Pricing (`src/routes/pricing.tsx`)** — already single-column on mobile, no changes needed beyond Free tier copy.

## Technical notes

- Auth-gated routes stay under `_authenticated/` (account, subscription). Only `/app` moves out.
- `generatePromptGuest` server function lives in `src/lib/prompt.functions.ts` next to existing `generatePrompt`. No middleware, `.inputValidator()` enforces Standard mode.
- Guest rate-limit table (optional but recommended):
  ```sql
  create table public.guest_prompt_usage (
    ip inet not null,
    day date not null default current_date,
    count int not null default 0,
    primary key (ip, day)
  );
  grant select, insert, update on public.guest_prompt_usage to service_role;
  alter table public.guest_prompt_usage enable row level security;
  -- no policies: only the server function (service_role) writes it
  ```
  Server function loads `supabaseAdmin` inside the handler to bump the counter.
- `client_state` shows viewport 1174 wide — no live mobile screenshot to diff against. We'll drive Playwright at 390×844 after implementation to verify the mobile layout claims.
- No changes to Stripe products or webhooks.

## Files touched

- `src/routes/app.tsx` — new public generator page (or move from `_authenticated/app.tsx`).
- `src/routes/_authenticated/app.tsx` — delete (contents merged into public with auth branching).
- `src/lib/prompt.functions.ts` — add `generatePromptGuest`.
- `src/routes/index.tsx` — hero + nav mobile tweaks, copy tweak.
- `src/routes/pricing.tsx` — Free tier copy + CTA target.
- `supabase/migrations/<ts>_guest_prompt_usage.sql` — rate-limit table (with GRANT + RLS enable).

## Verification

- `bun add`-free change; typecheck must pass.
- Playwright at 390×844: load `/`, `/app`, `/pricing`, screenshot each — confirm no horizontal overflow and CTAs stack.
- Manual: use `/app` while signed out, generate 10 times, confirm wall appears on 11th and points to `/auth`.
