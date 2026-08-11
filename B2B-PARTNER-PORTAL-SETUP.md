# B2B Partner Portal setup

The Partner Portal lets a business apply, get manually approved, buy
bundles of invite credits, spend them creating branded invites for their
own clients, and set white-label branding (logo/colors). It's the first
feature in this repo with real user accounts — everything else (RSVPs,
invites, the Host Dashboard) is either public or token-gated, with no
login system at all.

```
Public          POST /api/partners/signup            apply (creates a pending account)
Partner (auth)  GET  /api/partners/me                 profile + status + credit balance
Partner (auth)  POST /api/partners/branding            update white-label fields
Partner (auth)  GET  /api/partners/credits             balance + ledger
Partner (auth)  POST /api/partners/purchase/create-order   start buying a credit package
Partner (auth)  POST /api/partners/purchase/verify      confirm payment, credit the ledger
Admin (auth)    GET  /api/admin/partners?status=…       list applications
Admin (auth)    POST /api/admin/partners/approve        approve a pending partner
Admin (auth)    POST /api/admin/partners/reject          reject a pending partner
```

Frontend routes: `/partners/signup`, `/partners/login`, `/partners/pending`,
`/partners/dashboard`, `/admin/login`, `/admin/partners`.

Unlike the invites/RSVP split between `server/index.js` (local dev, flat
JSON file) and `api/*.js` (production, Supabase), every partner-portal route
shares **one** implementation (`api/_lib/partnerHandlers.js`), imported by
both the Vercel Serverless Functions and `server/index.js`'s Express
registrations. There's no flat-file dev fallback for a real login system —
**you need a real Supabase project configured even for `npm run dev`** to
work on this feature.

## One-time setup

### 1. Run the migration

In your Supabase project → **SQL Editor** → paste and run
`supabase/migrations/0001_b2b_partner_portal.sql`. It creates:

- `partners` — one row per business, keyed 1:1 to a Supabase Auth user
  (`auth.users`), with approval `status`, white-label branding fields, and
  a denormalized `credit_balance`.
- `partner_credit_transactions` — the append-only ledger backing that
  balance (purchases, spends, refunds, manual adjustments).
- `apply_partner_credit_transaction(...)` — a Postgres function that's the
  *only* way `credit_balance` ever changes, so two requests for the same
  partner can never race each other into a lost update.

Both tables have RLS enabled with **zero** policies — locked to the
service-role key, same as `invites`/`rsvps`. The browser's Supabase Auth
session (see below) is only ever used for login; every actual read/write of
partner data goes through this app's own `/api/partners/*` and
`/api/admin/*` routes.

### 2. Environment variables

Add to `.env` (local) and your Vercel project's environment variables
(production) — see `.env.example` for the full comments:

```
SUPABASE_URL=...                 # already needed for invites/rsvps
SUPABASE_SERVICE_ROLE_KEY=...    # already needed for invites/rsvps
VITE_SUPABASE_URL=...            # NEW — same project, public anon-key client
VITE_SUPABASE_ANON_KEY=...       # NEW — Project Settings → API
ADMIN_EMAILS=you@example.com     # NEW — comma-separated admin allowlist
```

`RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `VITE_RAZORPAY_KEY_ID` and
`BREVO_API_KEY` / `EMAIL_FROM` are reused as-is from the existing consumer
checkout and order-confirmation email — no new payment or email vendor.

### 3. Create your first admin login

Sign up as a partner at `/partners/signup` with the same email you put in
`ADMIN_EMAILS`, then log in at `/admin/login` with those credentials — no
separate admin-signup flow exists (or needs to). You can approve your own
pending partner application from `/admin/partners` once logged in, if you
want an approved test partner account too.

## Known placeholder: credit package pricing

`src/data/partnerPackages.js` ships with three example tiers (10/50/100
credits) so the purchase flow works end-to-end, but the actual tiers,
pricing, and "what a credit unlocks" business rules haven't been finalized.
Update that one file once they are — both the purchase-order and
verification endpoints re-derive the charge from a package's `id` there
(never trust a client-sent amount, same rule `sale.js` already enforces for
the consumer checkout), and every purchase snapshots its own price/credits
into `partner_credit_transactions` at the time it's made, so changing a
tier there never rewrites past purchases.

Not yet wired up: spending a credit to actually create a white-labeled
invite through the existing Invitation Builder (`/create`) — today a
partner can sign up, get approved, buy credits, and set branding, but the
builder itself doesn't yet know how to consume a partner's credit instead
of charging Razorpay directly, or stamp a partner's branding onto the
invite it generates. That's the natural next slice once the credit model
above is finalized.
