# Auto-popup Buy Credits box after 10 free prompts

## Goal
The moment a guest uses their 10th free prompt, the "Buy credits" upgrade box pops up automatically — on both the Prompt Builder and the Lyrics Builder — instead of only showing a small toast and an inline banner.

## Current state (verified)
- `src/routes/app.tsx` and `src/routes/lyrics.tsx`: after the 10th guest generation only a toast fires; a signup card appears inline on the page (no popup).
- `src/components/UpgradeModal.tsx` already exists with the right copy ("You've used your 10 free prompts", Buy 20 prompts — $5, Go unlimited — $19.99/mo) and already auto-opens for signed-in users who run out of credits. It is not wired to guests.

## Changes

1. **Pop the modal on the 10th free prompt** (`src/routes/app.tsx`)
   - After a guest generation completes and the counter reaches 10, call `setShowUpgradeModal(true)` (replacing the toast-only behavior).
   - When a guest who is already at the limit clicks Generate again, open the UpgradeModal popup (keep the inline wall too).

2. **Same behavior in Lyrics Builder** (`src/routes/lyrics.tsx`)
   - Import and render `UpgradeModal`; open it when the guest hits/exceeds the shared 10-prompt limit (the counter is shared between both tools).

3. **Make the modal guest-aware** (`src/components/UpgradeModal.tsx`)
   - Add an optional `isGuest` prop. For guests, add a "Create free account" button linking to `/auth` (credits purchases require an account) above the two paid options; copy becomes "Create a free account, then grab a pack or go unlimited."
   - Signed-in users keep the existing two-button layout unchanged.

## Technical notes
- No new files besides edits to the three files above; no database or payment changes.
- The free counter never resets — after purchase the user is signed in and spends credits, so the guest modal stops applying.

## Verification
- Build check, then Playwright: set localStorage `blacure.freePrompts.v1` to 9, generate once, confirm the popup appears with the $5 / $19.99 options and sign-in button; confirm it also appears on the Lyrics page and when clicking Generate again at the limit.
