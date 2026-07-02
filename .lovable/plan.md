## Goal
Show the Prompt Pack Vol. 1 promo section at the bottom of the Promptor page (`/app`), so users see it right after using the generator.

## Changes
1. **`src/routes/_authenticated/app.tsx`** — Add a new section rendered below the existing Prompt Builder / Preview two-column grid:
   - Pack cover image (`blacure-pack-vol1.png`)
   - Title "Blacure Prompt Pack — Volume 1", short description, $2.00 price
   - Primary CTA: if the user already owns the pack → "Download PDF" (calls `getPackDownloadUrl` from `src/lib/packs.functions.ts`); otherwise → "Buy Pack — $2" that opens the existing Stripe embedded checkout for the `prompt_pack_vol1` price.
   - Uses existing `StripeEmbeddedCheckout` component and `listMyPacks` server fn for ownership check (same pattern as `account.tsx` / `pricing.tsx`).
   - Styled with existing dark/gold tokens; responsive (image left, copy right on md+, stacked on mobile).

2. **`src/routes/pricing.tsx`** — Leave the pack section on pricing untouched (still discoverable there). No other changes.

## Notes
- Frontend only; no backend, schema, or Stripe changes.
- Ownership check is cheap and matches the pattern already used in `account.tsx`.