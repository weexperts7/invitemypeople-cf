# B2B Partner Portal setup

The Partner Portal lets a sweet shop or wedding box business apply, get
manually approved, buy bundles of invite credits, spend them creating
white-labeled wedding invites for their own clients, and share the result.
It's the first feature in this repo with real user accounts — everything
else (RSVPs, consumer invites, the Host Dashboard) is either public or
token-gated, with no login system at all.

**Nothing about the B2C consumer flow was touched to build this** — no
existing template component, no `CreateInvitePage.jsx`/`PaymentModal.jsx`
checkout code, and no `invites`/`rsvps` table schema changed. Every
partner-portal table, route, and page is net-new. See "How isolation was
kept" at the bottom for exactly how.

```
Public          POST /api/partners/signup              apply (creates a pending_approval account)
Public          POST /api/partners/logo                 upload a logo (used by the signup form)
Partner (auth)  GET  /api/partners/me                    profile + status + credits_remaining
Partner (auth)  POST /api/partners/profile               update business name/address/phone/logo
Partner (auth)  GET  /api/partners/credits                credits_remaining + ledger history
Partner (auth)  POST /api/partners/purchase/create-order  start buying a credit package
Partner (auth)  POST /api/partners/purchase/verify        confirm payment, credit instantly
Partner (auth)  GET  /api/partners/invites                list this partner's client invites
Partner (auth)  POST /api/partners/invites                spend 1 credit, create a client invite
Public          GET  /api/partners/invites/:slug          the shareable invite itself
Admin (auth)    GET  /api/admin/partners?status=…          list applications
Admin (auth)    POST /api/admin/partners/approve           status -> active
Admin (auth)    POST /api/admin/partners/reject            status -> rejected
```

Frontend routes: `/partners/signup`, `/partners/login`, `/partners/pending`,
`/partners/dashboard`, `/admin/login`, `/admin/partners`, and the public
shareable invite at `/p/:slug`.

Every partner-portal route shares **one** implementation
(`api/_lib/partnerHandlers.js`), imported by both the Vercel Serverless
Functions and `server/index.js`'s Express registrations — there's no
flat-file dev fallback for a real login system, so **you need a real
Supabase project configured even for `npm run dev`** to work on this
feature.

## One-time setup

### 1. Run the migration

In your Supabase project → **SQL Editor** → paste and run
`supabase/migrations/0001_b2b_partner_portal.sql`. It creates three NEW
tables and touches nothing else:

- `partners` — one row per business, keyed 1:1 to a Supabase Auth user
  (`auth.users`): `business_name`, `address`, `phone`, `email`, `logo_url`,
  approval `status` (`pending_approval` → `active`/`rejected`/`suspended`),
  and `credits_remaining`.
- `partner_credit_transactions` — the append-only ledger backing that
  balance (purchases, spends, refunds, manual adjustments).
- `partner_invites` — a partner's client wedding invites, entirely separate
  from the consumer `invites` table.

Plus two Postgres functions that are the *only* way credits or invites are
ever written, so two requests for the same partner can never race each
other into a lost update or a credit spent with no invite to show for it:

- `apply_partner_credit_transaction(...)` — purchases/refunds/adjustments.
- `spend_partner_credit_for_invite(...)` — deducts 1 credit and creates the
  `partner_invites` row in the same locked transaction.

All three tables have RLS enabled with **zero** policies — locked to the
service-role key, same as `invites`/`rsvps`. The browser's Supabase Auth
session (see below) is only ever used for login; every actual read/write of
partner data goes through this app's own `/api/partners/*` and
`/api/admin/*` routes.

Then also run `supabase/migrations/0002_b2b_partner_invite_richness.sql` —
purely additive columns on `partner_invites` (`event_title`, `photos`,
`events`, `bg_song_*`) plus a replacement `spend_partner_credit_for_invite()`
that accepts them. This is what lets a partner-generated `/p/:slug`
invitation render through the exact same `InvitationExperience` component
tree a consumer's `/i/:slug` invitation does (see
`PartnerCreateInvitePage.jsx` / `PartnerInviteViewerPage.jsx`) — photos,
additional events, background music, and all — instead of the old bare
themed card.

### 2. Create the Storage buckets

Supabase Dashboard → **Storage** → New bucket, twice, both public:

- `partner-logos` — a partner's own business logo (signup form + branding
  settings). Deliberately separate from the consumer `invite-photos`
  bucket (see `INVITES-SETUP.md`).
- `partner-invite-photos` — photos a partner uploads while building a
  *client's* invite (`PartnerCreateInvitePage.jsx`, via
  `POST /api/partners/photos`). Also deliberately separate from both
  `invite-photos` and `partner-logos`.

### 3. Environment variables

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
checkout and order-confirmation email — same Razorpay account, same Brevo
sender, no new payment or email vendor.

### 4. Create your first admin login

Sign up as a partner at `/partners/signup` with the same email you put in
`ADMIN_EMAILS`, then log in at `/admin/login` with those credentials — no
separate admin-signup flow exists (or needs to). Approve your own pending
application from `/admin/partners` to get an active test partner account,
buy a test credit package, and generate a test client invite.

## Known placeholder: credit package pricing

`src/data/partnerPackages.js` ships with three example tiers (10/50/100
credits) so the purchase flow works end-to-end, but the actual tiers and
pricing haven't been finalized. Update that one file once they are — the
purchase-order and verification endpoints re-derive the charge from a
package's `id` there (never trust a client-sent amount, same rule
`sale.js` already enforces for the consumer checkout), and every purchase
snapshots its own price/credits into `partner_credit_transactions` at the
time it's made, so changing a tier there never rewrites past purchases.

## How isolation was kept

The CRITICAL constraint on this feature was: don't touch B2C templates,
checkout flows, or database structures. Concretely:

- **No schema change to `invites`/`rsvps`.** Partner invites live in the
  new `partner_invites` table, not as rows in `invites`.
- **`CreateInvitePage.jsx`/`PaymentModal.jsx`/`GeneratedInvitePage.jsx`
  untouched; the shared template components got one additive prop.**
  `PartnerCreateInvitePage.jsx` gives partners the SAME builder UX a
  consumer gets on `/create` (style picker + fields on the left, live
  preview on the right), and `PartnerInviteViewerPage.jsx` (`/p/:slug`)
  renders through the exact same `InvitationExperience` component tree
  `/i/:slug` does — both real reuse, not a hand-built approximation, so a
  partner invite genuinely looks and behaves like a consumer one. The only
  change to that shared component was adding `showRsvp` (default `true`,
  so every existing caller renders exactly as before) — the Partner
  Portal is the one caller that sets it `false`, since `/p/:slug` doesn't
  have guest RSVP/Wishes Wall yet (see "Not yet built" below).
  `PhotoUploader.jsx`/`LiveInvitePreview.jsx` similarly gained optional,
  backward-compatible props (`endpoint`/`token`, `showRsvp`) rather than
  being forked.
- **No B2C checkout flow reused.** Partner credit purchases call the same
  Razorpay *account* (same keys, same "real-time payment gateway" the site
  already integrates), but through their own
  `/api/partners/purchase/*` endpoints — `/api/create-order` and
  `/api/verify-payment` (the consumer routes) are never called.
- **No B2C table or storage bucket touched.** Partner invites/photos live
  in their own `partner_invites` row and `partner-invite-photos` bucket,
  written through their own `/api/partners/*` endpoints — never the
  consumer `invites`/`rsvps` tables or `invite-photos` bucket. What's
  reused from the consumer side is code, not data: `builderTemplates.js`
  (the same style catalog `/create` itself reads), `buildWeddingExperienceTemplate.js`
  (a pure `{ names, date, venue, ... } → template props` formatter with no
  I/O), and small utilities (`slugify.js`, `formatInviteDateTime.js`,
  `cleanEvents.js`, `photoUpload.js`'s constants).

## Not yet built

Guest RSVP / a Wishes Wall for partner-created invites — the spec asked
for a shareable invite link and a white-label viewer, not guest RSVPs, so
`/p/:slug` renders `InvitationExperience` with `showRsvp={false}` for now
(everything else — envelope reveal, timeline, gallery, background music —
is the real thing). Adding RSVPs
later would mean either a fully separate `partner_invite_rsvps` table (to
keep the same isolation guarantee above) or a deliberate decision to let
partner invites share the consumer `rsvps` table — worth a explicit call
before building it, not an assumption.
