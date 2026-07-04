## robots.txt

Already present at `public/robots.txt` with the exact content requested (User-agent, Allow, Sitemap). No change needed — it's served at `/robots.txt`.

## Submit Comment form

Add a clean, mobile-friendly comment form matching the existing Blacure dark/gold aesthetic (card, brand-gradient button, shadcn Input/Textarea).

**UI**
- New component `src/components/CommentForm.tsx` with fields: Name, Email, Comment.
- Client-side validation with zod (name 1–100, email format, comment 1–2000).
- Submit button shows loading state; on success shows toast + inline message: "Thank you. Your comment has been submitted." On failure: "Something went wrong. Please try again."
- Place the section on the landing page (`src/routes/index.tsx`) above the footer, in a `<section id="contact">` with heading "Leave a comment".

**Backend (secure, no exposed keys)**
- Use Lovable Emails (built-in). Requires setting up an email domain first — a setup dialog will appear so you can pick a sender subdomain (e.g. `notify.thepromptor.life`).
- After the domain is set, scaffold transactional email infrastructure and add one template `comment-notification` that renders Name/Email/Comment.
- Add a server function `submitComment` (`src/lib/comments.functions.ts`) that:
  - validates input server-side with zod,
  - enqueues the email to `Blacsam@Blacure.com` via the transactional send route,
  - returns `{ ok: true }` or throws.
- No database write (per your instruction — no storage).
- No API keys in the frontend; the server function runs on the Worker.

## Prerequisite you'll need to complete

You'll be prompted to set up an email sender domain (adds NS records at your DNS provider). Emails start sending once DNS verifies; the form will work end-to-end after that.
