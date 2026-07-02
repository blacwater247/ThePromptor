## Blacure Prompt Pack Vol. 1 — $2 Downloadable PDF

Sell the 12 curated prompts as a one-time $2 purchase. After Stripe checkout completes, the buyer gets a "Download Pack" button on their Account page that streams a polished PDF of all 12 prompts.

### 1. Generate the PDF asset
- Build `/mnt/documents/blacure-prompt-pack-v1.pdf` once using ReportLab with the Blacure dark/gold aesthetic:
  - Cover page: gold "Blacure" wordmark, "Prompt Pack — Volume 1", subtitle "12 Ready-to-Use AI Music Prompts".
  - One prompt per section: gold numbered title (e.g. "01 · Southern Roots Funk-House Storytelling"), body in clean serif with proper paragraph spacing, thin gold divider between prompts.
  - Footer: "© Blacure · thepromptor.life" + page numbers.
- Visual QA every page (convert to images, inspect for overflow/alignment), then commit the final PDF to `public/downloads/blacure-prompt-pack-v1.pdf` so it ships with the app.

### 2. Stripe product
- Create new price `prompt_pack_vol1` — $2.00 USD one-time, product "Blacure Prompt Pack — Volume 1", tax code `txcd_10000000` (general digital goods).

### 3. Entitlement tracking
- New table `public.pack_purchases` (id, user_id, pack_slug, stripe_session_id unique, environment, created_at) with RLS `select own` + service_role manage, plus GRANTs.
- Webhook (`src/routes/api/public/payments/webhook.ts`): in `handleCheckoutCompleted`, when the resolved `lookup_key === "prompt_pack_vol1"`, insert into `pack_purchases` (idempotent on `stripe_session_id`) instead of granting credits. Keep the existing `credits_pack_20_onetime` branch untouched.

### 4. Secure download endpoint
- `src/routes/api/public/downloads/prompt-pack-v1.ts` — server route that:
  1. Verifies Supabase bearer (reject 401 without it).
  2. Confirms a row exists in `pack_purchases` for that user + `pack_slug = 'prompt_pack_vol1'`.
  3. Streams the PDF from `public/downloads/blacure-prompt-pack-v1.pdf` with `Content-Disposition: attachment`.
- Backfill: manually insert a purchase row for the user's earlier $2 buys if they should also get the pack (confirm with user first).

### 5. UI
- **Pricing page**: new tier card "Prompt Pack Vol. 1 — $2 · 12 ready-to-use prompts, instant PDF download" with a "Buy Pack" button that launches embedded Stripe checkout for `prompt_pack_vol1`.
- **Account page**: new "Downloads" section listing owned packs with a "Download PDF" button (calls the secure endpoint). Empty state links to pricing.
- **Landing page**: small callout under features — "Grab the Prompt Pack Vol. 1 →".

### 6. Test plan
1. Buy the pack with card `4242 4242 4242 4242` (any future exp, any CVC, any ZIP).
2. Confirm `pack_purchases` row appears via Account page → Downloads.
3. Click "Download PDF" — file downloads, opens cleanly, 12 prompts formatted correctly.
4. Sign out / sign in as a different user → Downloads section is empty, direct hit to `/api/public/downloads/prompt-pack-v1` returns 403.

### Open question
Do the existing two $2 credit-pack purchases on your account also entitle you to the Vol. 1 PDF (I'll backfill), or is the pack strictly for new "Prompt Pack" purchases going forward?
