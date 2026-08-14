-- =============================================================================
-- MASTER DEV BOOTSTRAP — every table, policy, and function, in one script
-- =============================================================================
-- Combines all 7 files in supabase/migrations/ into a single script, in the
-- exact chronological order they were written, for bootstrapping a brand-new
-- Supabase DEV project in one paste:
--
--   0001_b2b_partner_portal.sql
--   0002_b2b_partner_invite_richness.sql
--   0003_b2b_partner_invite_client_contact.sql
--   0004_b2b_partner_invite_drop_stale_overloads.sql
--   0005_partner_invite_family_names.sql
--   0006_consumer_invites.sql
--   0007_consumer_rsvps_and_reminders.sql
--
-- This is a literal concatenation, not a re-derived "final state" rewrite —
-- every statement below is byte-for-byte what's in the numbered file it's
-- copied from, in the same order. That matters for one non-obvious reason:
-- 0002/0003 each add trailing parameters to spend_partner_credit_for_invite()
-- via `create or replace function`, which — because the parameter list
-- changed — creates a stale duplicate overload instead of replacing the
-- function, rather than the single evolving function it looks like. 0004
-- exists specifically to drop those stale overloads. Running these 7 files'
-- statements in this exact order (as this script does) reproduces and then
-- self-corrects that history, landing on the same correct end state
-- production is in today. Reordering or skipping files would not.
--
-- Run this ONCE, top to bottom, in the new DEV project's SQL Editor. It is
-- NOT meant to live in supabase/migrations/ itself (running it there too,
-- alongside the 7 files it's built from, would just redundantly re-apply
-- everything — harmless since every statement is idempotent, but pointless).
-- For any project after this initial bootstrap, prefer applying the 7
-- numbered files individually (or `supabase db push`) so future schema
-- changes stay tracked file-by-file.
--
-- What this does NOT do (see each source file's own header, and
-- INVITES-SETUP.md / MUSIC-SETUP.md / RSVPS-AND-REMINDERS-SETUP.md /
-- B2B-PARTNER-PORTAL-SETUP.md for the full detail):
--   1. Environment variables — SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
--      SPOTIFY_CLIENT_ID/SECRET, BREVO_API_KEY, EMAIL_FROM, RAZORPAY_*,
--      ADMIN_EMAILS — set these in the DEV project's Vercel env / .env.
--   2. Deploying the `send-event-reminders` Supabase Edge Function and
--      scheduling it with pg_cron — needs this project's own project-ref
--      and service-role key, so it's a manual step, not SQL to check in.
--
-- Access model throughout: RLS is enabled on every table with ZERO
-- policies for anon/authenticated. Every read/write goes through Vercel
-- Serverless Functions using the service-role key, which bypasses RLS
-- entirely — see each section below for why.
-- =============================================================================


-- =============================================================================
-- SOURCE: supabase/migrations/0001_b2b_partner_portal.sql
-- =============================================================================

-- B2B Partner Portal — sweet shop / wedding box creator accounts, branding,
-- and the credit ledger backing their invite purchases.
--
-- Run this against the same Supabase project the `invites`/`rsvps` tables
-- already live in (Supabase Dashboard → SQL Editor → paste and run, or
-- `supabase db push` if you have the CLI linked).
--
-- CRITICAL, by design: this migration creates three NEW tables and touches
-- NOTHING that already exists — no ALTER on `invites`/`rsvps`, no new
-- columns, no new foreign keys pointing at them, no trigger installed on
-- them. Partner-created invites live entirely in their own `partner_invites`
-- table below and render through their own viewer route (/p/:slug — see
-- src/pages/partners/PartnerInviteViewerPage.jsx), never touching the
-- consumer `invites` table, GeneratedInvitePage.jsx, or any B2C template
-- component. See B2B-PARTNER-PORTAL-SETUP.md for the full picture.
--
-- Auth: partner accounts are real Supabase Auth users (auth.users), created
-- via the service-role Admin API in POST /api/partners/signup — see
-- api/_lib/partners.js. `partners.id` IS the auth.users.id (shared primary
-- key, not a separate FK column) so a partner row and its login are always
-- 1:1 and cascade-delete together.
--
-- Access model: every partner-portal Serverless Function (api/partners/*,
-- api/admin/*) reads/writes through the service-role client (see
-- api/_lib/supabase.js), exactly like the existing invites/rsvps routes —
-- never the client-side anon key. RLS is enabled on all three tables below
-- with ZERO policies for anon/authenticated, so even though the browser now
-- also holds a Supabase Auth session (for login/signup), PostgREST can't be
-- used to read or write partner data directly with it — only the server's
-- service-role key can, which bypasses RLS entirely.

-- ---------------------------------------------------------------------------
-- partners — one row per partner business, keyed by its Supabase Auth user.
-- ---------------------------------------------------------------------------
create table if not exists partners (
  id uuid primary key references auth.users (id) on delete cascade,

  business_name text not null,
  address text not null,
  phone text not null,
  email text not null unique,

  -- Uploaded at signup via POST /api/partners/logo (Supabase Storage
  -- bucket `partner-logos` — see B2B-PARTNER-PORTAL-SETUP.md for the
  -- one-time bucket setup, same "create it once by hand" step INVITES-
  -- SETUP.md already documents for the `invite-photos` bucket). A
  -- deliberately SEPARATE bucket, never the consumer one.
  logo_url text,

  -- Approval workflow (see /api/admin/partners/*). New signups always start
  -- 'pending_approval' — see api/partners/signup.js — and only an
  -- admin-approve/reject call ever moves them out of it.
  status text not null default 'pending_approval'
    check (status in ('pending_approval', 'active', 'rejected', 'suspended')),
  rejected_reason text,
  approved_at timestamptz,
  -- The approving/rejecting admin's email (from ADMIN_EMAILS, not a
  -- separate admins table — see api/_lib/auth.js) for an audit trail.
  reviewed_by text,

  -- Denormalized running balance, kept in lockstep with
  -- partner_credit_transactions by the ONLY two places that ever change
  -- it: apply_partner_credit_transaction() (purchases/refunds/manual
  -- adjustments) and spend_partner_credit_for_invite() (spending 1 credit
  -- to create a client invite) — both below. Avoids a SUM() over the whole
  -- ledger on every dashboard load.
  credits_remaining integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists partners_status_idx on partners (status);

-- Keeps updated_at honest on every UPDATE without every call site having to
-- remember to set it itself.
create or replace function partners_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists partners_updated_at on partners;
create trigger partners_updated_at
  before update on partners
  for each row
  execute function partners_set_updated_at();

alter table partners enable row level security;
-- No policies: locked to the service-role key. See the file header.

-- ---------------------------------------------------------------------------
-- partner_credit_transactions — append-only ledger backing credits_remaining.
-- ---------------------------------------------------------------------------
-- `credits` is signed (positive for a package purchase or a manual top-up,
-- negative for spending a credit on a client invite or a manual deduction)
-- so credits_remaining is always just "the running sum" — see
-- apply_partner_credit_transaction()/spend_partner_credit_for_invite()
-- below, the only two places that ever insert here.
--
-- package_id/amount_paise describe a *purchase*-type row and are null for
-- every other type. package_id is a plain string key, not a foreign key —
-- packages are defined in code (src/data/partnerPackages.js), the same way
-- src/data/sale.js defines the consumer invite price, so pricing can change
-- without a migration; amount_paise snapshots what was actually charged at
-- purchase time so a later price change never rewrites this row's history.
create table if not exists partner_credit_transactions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references partners (id) on delete cascade,
  type text not null check (type in ('purchase', 'consumption', 'adjustment', 'refund')),
  credits integer not null,
  balance_after integer not null,

  package_id text,
  amount_paise integer,
  razorpay_order_id text,
  razorpay_payment_id text,

  -- Set when a 'consumption' row was spent creating a specific client
  -- invite — lets the ledger UI link "−1 credit" straight to the
  -- partner_invites row it paid for.
  invite_slug text,

  note text,
  created_at timestamptz not null default now()
);

create index if not exists partner_credit_transactions_partner_idx
  on partner_credit_transactions (partner_id, created_at desc);

alter table partner_credit_transactions enable row level security;
-- No policies: locked to the service-role key. See the file header.

-- ---------------------------------------------------------------------------
-- partner_invites — client wedding invites a partner generates by spending
-- a credit. Deliberately its OWN table, not a row in the consumer `invites`
-- table — see the file header's "CRITICAL, by design" note. Rendered at
-- /p/:slug (src/pages/partners/PartnerInviteViewerPage.jsx), a page that
-- imports nothing from the B2C template/viewer code path.
-- ---------------------------------------------------------------------------
create table if not exists partner_invites (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references partners (id) on delete cascade,
  slug text not null unique,

  -- Which src/data/templatesData.js wedding template's palette/look to
  -- theme the viewer with — read-only reference to that file's `id`s, not
  -- a foreign key (that data is plain code, not a table).
  template_id text,

  couple_names text not null,
  wedding_date text not null,
  wedding_time text,
  venue text not null,
  location_url text,
  message text,

  -- The ledger row that paid for this invite — set atomically together
  -- with this row by spend_partner_credit_for_invite() below.
  credit_transaction_id uuid references partner_credit_transactions (id),

  created_at timestamptz not null default now()
);

create index if not exists partner_invites_partner_idx
  on partner_invites (partner_id, created_at desc);

alter table partner_invites enable row level security;
-- No policies: locked to the service-role key. See the file header.

-- ---------------------------------------------------------------------------
-- apply_partner_credit_transaction — the ONLY way credits_remaining ever
-- changes for a *purchase* (or a manual adjustment/refund). Called via
-- supabase.rpc() from recordCreditTransaction() in api/_lib/partners.js.
-- `for update` below takes a row lock on the partner for the duration of
-- the transaction, so a purchase-verify retry racing another write for the
-- same partner waits instead of silently losing an update.
-- ---------------------------------------------------------------------------
create or replace function apply_partner_credit_transaction(
  p_partner_id uuid,
  p_type text,
  p_credits integer,
  p_package_id text default null,
  p_amount_paise integer default null,
  p_razorpay_order_id text default null,
  p_razorpay_payment_id text default null,
  p_invite_slug text default null,
  p_note text default null
)
returns partner_credit_transactions
language plpgsql
as $$
declare
  v_balance integer;
  v_row partner_credit_transactions;
begin
  select credits_remaining into v_balance from partners where id = p_partner_id for update;
  if v_balance is null then
    raise exception 'partner % not found', p_partner_id;
  end if;

  v_balance := v_balance + p_credits;
  if v_balance < 0 then
    raise exception 'insufficient credits for partner %', p_partner_id;
  end if;

  update partners set credits_remaining = v_balance where id = p_partner_id;

  insert into partner_credit_transactions (
    partner_id, type, credits, balance_after, package_id, amount_paise,
    razorpay_order_id, razorpay_payment_id, invite_slug, note
  ) values (
    p_partner_id, p_type, p_credits, v_balance, p_package_id, p_amount_paise,
    p_razorpay_order_id, p_razorpay_payment_id, p_invite_slug, p_note
  )
  returning * into v_row;

  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- spend_partner_credit_for_invite — the ONLY way a partner_invites row is
-- ever created. Deducts exactly 1 credit and inserts the invite in the same
-- locked transaction (see apply_partner_credit_transaction()'s comment for
-- why `for update` matters) so a partner can never end up with an invite
-- that wasn't actually paid for by a credit, or a credit deducted with no
-- invite to show for it — both happen atomically or neither does. Raises
-- if the partner isn't 'active' or has 0 credits_remaining; the caller
-- (api/_lib/partnerHandlers.js's createClientInvite) turns that into a
-- 402/403 response.
-- ---------------------------------------------------------------------------
create or replace function spend_partner_credit_for_invite(
  p_partner_id uuid,
  p_slug text,
  p_template_id text,
  p_couple_names text,
  p_wedding_date text,
  p_wedding_time text,
  p_venue text,
  p_location_url text,
  p_message text
)
returns partner_invites
language plpgsql
as $$
declare
  v_status text;
  v_balance integer;
  v_tx partner_credit_transactions;
  v_invite partner_invites;
begin
  select status, credits_remaining into v_status, v_balance
    from partners where id = p_partner_id for update;

  if v_status is null then
    raise exception 'partner % not found', p_partner_id;
  end if;
  if v_status <> 'active' then
    raise exception 'partner % is not active', p_partner_id;
  end if;
  if v_balance < 1 then
    raise exception 'insufficient credits for partner %', p_partner_id;
  end if;

  v_balance := v_balance - 1;
  update partners set credits_remaining = v_balance where id = p_partner_id;

  insert into partner_credit_transactions (
    partner_id, type, credits, balance_after, invite_slug, note
  ) values (
    p_partner_id, 'consumption', -1, v_balance, p_slug,
    'Spent 1 credit creating an invite for ' || p_couple_names
  )
  returning * into v_tx;

  insert into partner_invites (
    partner_id, slug, template_id, couple_names, wedding_date, wedding_time,
    venue, location_url, message, credit_transaction_id
  ) values (
    p_partner_id, p_slug, p_template_id, p_couple_names, p_wedding_date, p_wedding_time,
    p_venue, p_location_url, p_message, v_tx.id
  )
  returning * into v_invite;

  return v_invite;
end;
$$;

-- =============================================================================
-- SOURCE: supabase/migrations/0002_b2b_partner_invite_richness.sql
-- =============================================================================

-- B2B Partner Portal — brings a partner-created client invite up to the
-- same richness a consumer's own Invitation Builder submission has (photos,
-- additional events, background music, an optional Function Name), so
-- /p/:slug can render through the exact same InvitationExperience component
-- tree /i/:slug does instead of the old bare themed card. See
-- PartnerCreateInvitePage.jsx / PartnerInviteViewerPage.jsx.
--
-- Run this against the same Supabase project 0001_b2b_partner_portal.sql
-- already ran against (Supabase Dashboard → SQL Editor → paste and run, or
-- `supabase db push`).
--
-- Purely additive: new nullable/defaulted columns on the existing
-- `partner_invites` table only — no ALTER on `invites`/`rsvps`, no
-- consumer table touched. Still isolated, per 0001's file header.

alter table partner_invites
  add column if not exists event_title text,
  add column if not exists photos jsonb not null default '[]'::jsonb,
  add column if not exists events jsonb not null default '[]'::jsonb,
  add column if not exists bg_song_title text,
  add column if not exists bg_song_artist text,
  add column if not exists bg_song_album_art text,
  add column if not exists bg_song_preview_url text;

-- Note on `template_id`: going forward this stores a builder template id
-- from src/data/builderTemplates.js (e.g. "wedding-rajasthani-royal") —
-- what TemplateStyleSelector/getBuilderTemplateById/
-- buildWeddingExperienceTemplate all key off — rather than the old raw
-- src/data/templatesData.js id. No column change needed, just a change in
-- what the application writes into it; see PartnerCreateInvitePage.jsx.

-- ---------------------------------------------------------------------------
-- spend_partner_credit_for_invite — replaces the version in
-- 0001_b2b_partner_portal.sql with one that also accepts and stores the new
-- columns above. Same atomicity/locking behavior as before (see that
-- file's comment) — only the parameter list and the final insert grew.
-- ---------------------------------------------------------------------------
create or replace function spend_partner_credit_for_invite(
  p_partner_id uuid,
  p_slug text,
  p_template_id text,
  p_couple_names text,
  p_wedding_date text,
  p_wedding_time text,
  p_venue text,
  p_location_url text,
  p_message text,
  p_event_title text default null,
  p_photos jsonb default '[]'::jsonb,
  p_events jsonb default '[]'::jsonb,
  p_bg_song_title text default null,
  p_bg_song_artist text default null,
  p_bg_song_album_art text default null,
  p_bg_song_preview_url text default null
)
returns partner_invites
language plpgsql
as $$
declare
  v_status text;
  v_balance integer;
  v_tx partner_credit_transactions;
  v_invite partner_invites;
begin
  select status, credits_remaining into v_status, v_balance
    from partners where id = p_partner_id for update;

  if v_status is null then
    raise exception 'partner % not found', p_partner_id;
  end if;
  if v_status <> 'active' then
    raise exception 'partner % is not active', p_partner_id;
  end if;
  if v_balance < 1 then
    raise exception 'insufficient credits for partner %', p_partner_id;
  end if;

  v_balance := v_balance - 1;
  update partners set credits_remaining = v_balance where id = p_partner_id;

  insert into partner_credit_transactions (
    partner_id, type, credits, balance_after, invite_slug, note
  ) values (
    p_partner_id, 'consumption', -1, v_balance, p_slug,
    'Spent 1 credit creating an invite for ' || p_couple_names
  )
  returning * into v_tx;

  insert into partner_invites (
    partner_id, slug, template_id, couple_names, wedding_date, wedding_time,
    venue, location_url, message, event_title, photos, events,
    bg_song_title, bg_song_artist, bg_song_album_art, bg_song_preview_url,
    credit_transaction_id
  ) values (
    p_partner_id, p_slug, p_template_id, p_couple_names, p_wedding_date, p_wedding_time,
    p_venue, p_location_url, p_message, p_event_title,
    coalesce(p_photos, '[]'::jsonb), coalesce(p_events, '[]'::jsonb),
    p_bg_song_title, p_bg_song_artist, p_bg_song_album_art, p_bg_song_preview_url,
    v_tx.id
  )
  returning * into v_invite;

  return v_invite;
end;
$$;

-- =============================================================================
-- SOURCE: supabase/migrations/0003_b2b_partner_invite_client_contact.sql
-- =============================================================================

-- B2B Partner Portal — adds the client's email/phone to a partner-created
-- invite, so the person the invite is actually for (not the partner) can be
-- emailed their live link the moment it's generated, the same way a
-- consumer host gets an order-confirmation email today (see
-- buildOrderConfirmationEmail() in src/utils/email.js). See
-- PartnerCreateInvitePage.jsx / api/_lib/partnerHandlers.js.
--
-- Run this against the same Supabase project 0001/0002 already ran against
-- (Supabase Dashboard → SQL Editor → paste and run, or `supabase db push`).
--
-- Purely additive: new nullable columns on the existing `partner_invites`
-- table only, same as 0002. Required-ness (both fields must be present) is
-- enforced at the API layer (api/_lib/partnerHandlers.js's createClientInvite,
-- mirroring how host_email is required on POST /api/invites but isn't a
-- NOT NULL column on `invites` either — see INVITES-SETUP.md) rather than a
-- NOT NULL constraint here, so this migration never has to backfill any
-- invite created before this column existed.

alter table partner_invites
  add column if not exists client_email text,
  add column if not exists client_phone text;

-- ---------------------------------------------------------------------------
-- spend_partner_credit_for_invite — replaces the version in
-- 0002_b2b_partner_invite_richness.sql with one that also accepts and
-- stores client_email/client_phone. Same atomicity/locking behavior as
-- before — only the parameter list and the final insert grew.
-- ---------------------------------------------------------------------------
create or replace function spend_partner_credit_for_invite(
  p_partner_id uuid,
  p_slug text,
  p_template_id text,
  p_couple_names text,
  p_wedding_date text,
  p_wedding_time text,
  p_venue text,
  p_location_url text,
  p_message text,
  p_event_title text default null,
  p_photos jsonb default '[]'::jsonb,
  p_events jsonb default '[]'::jsonb,
  p_bg_song_title text default null,
  p_bg_song_artist text default null,
  p_bg_song_album_art text default null,
  p_bg_song_preview_url text default null,
  p_client_email text default null,
  p_client_phone text default null
)
returns partner_invites
language plpgsql
as $$
declare
  v_status text;
  v_balance integer;
  v_tx partner_credit_transactions;
  v_invite partner_invites;
begin
  select status, credits_remaining into v_status, v_balance
    from partners where id = p_partner_id for update;

  if v_status is null then
    raise exception 'partner % not found', p_partner_id;
  end if;
  if v_status <> 'active' then
    raise exception 'partner % is not active', p_partner_id;
  end if;
  if v_balance < 1 then
    raise exception 'insufficient credits for partner %', p_partner_id;
  end if;

  v_balance := v_balance - 1;
  update partners set credits_remaining = v_balance where id = p_partner_id;

  insert into partner_credit_transactions (
    partner_id, type, credits, balance_after, invite_slug, note
  ) values (
    p_partner_id, 'consumption', -1, v_balance, p_slug,
    'Spent 1 credit creating an invite for ' || p_couple_names
  )
  returning * into v_tx;

  insert into partner_invites (
    partner_id, slug, template_id, couple_names, wedding_date, wedding_time,
    venue, location_url, message, event_title, photos, events,
    bg_song_title, bg_song_artist, bg_song_album_art, bg_song_preview_url,
    client_email, client_phone, credit_transaction_id
  ) values (
    p_partner_id, p_slug, p_template_id, p_couple_names, p_wedding_date, p_wedding_time,
    p_venue, p_location_url, p_message, p_event_title,
    coalesce(p_photos, '[]'::jsonb), coalesce(p_events, '[]'::jsonb),
    p_bg_song_title, p_bg_song_artist, p_bg_song_album_art, p_bg_song_preview_url,
    p_client_email, p_client_phone, v_tx.id
  )
  returning * into v_invite;

  return v_invite;
end;
$$;

-- =============================================================================
-- SOURCE: supabase/migrations/0004_b2b_partner_invite_drop_stale_overloads.sql
-- =============================================================================

-- Fixes PostgREST error PGRST203 ("Could not choose the best candidate
-- function") on spend_partner_credit_for_invite(), surfaced as a 500
-- "could not create the invite" from POST /api/partners/invites.
--
-- Root cause: `create or replace function` only replaces a function whose
-- parameter list is IDENTICAL to the existing one. 0002_b2b_partner_invite_
-- richness.sql and 0003_b2b_partner_invite_client_contact.sql each added
-- new trailing parameters to spend_partner_credit_for_invite() instead of
-- keeping the same signature, so Postgres kept the prior version(s) around
-- as separate overloads of the same function name rather than replacing
-- them. PostgREST can't disambiguate overloads whose REQUIRED parameters
-- are identical and only their OPTIONAL (default-valued) parameters differ
-- — exactly this shape — so every call now fails with "Could not choose
-- the best candidate function" instead of reaching the current version.
--
-- Fix: explicitly drop the stale overloads by their exact original
-- signatures, leaving only the current 18-parameter version (uuid, slug,
-- template_id, couple_names, wedding_date, wedding_time, venue,
-- location_url, message, event_title, photos, events, bg_song_title,
-- bg_song_artist, bg_song_album_art, bg_song_preview_url, client_email,
-- client_phone) that 0003 already created. No CREATE here — that version
-- is already live; this migration only removes what shouldn't still exist
-- alongside it.

-- The original 9-parameter version from 0001_b2b_partner_portal.sql.
drop function if exists spend_partner_credit_for_invite(
  uuid, text, text, text, text, text, text, text, text
);

-- The 16-parameter version from 0002_b2b_partner_invite_richness.sql.
drop function if exists spend_partner_credit_for_invite(
  uuid, text, text, text, text, text, text, text, text, text, jsonb, jsonb, text, text, text, text
);

-- =============================================================================
-- SOURCE: supabase/migrations/0005_partner_invite_family_names.sql
-- =============================================================================

-- B2B Partner Portal — adds groom's/bride's name + parents ("family name")
-- capture to a partner-created client invite, matching the same fields
-- added to the consumer `invites` table (see INVITES-SETUP.md's own new
-- "groom_name/groom_parents/bride_name/bride_parents" section). Fixes: the
-- WelcomeSplash.jsx family-name cards (couple.people — see
-- src/data/templatesData.js for the shape every demo template already
-- ships) rendered empty for every real invite, consumer or partner, because
-- nothing upstream ever collected or persisted this data — see
-- src/utils/buildWeddingExperienceTemplate.js.
--
-- Run this against the same Supabase project 0001-0004 already ran against
-- (Supabase Dashboard → SQL Editor → paste and run, or `supabase db push`).
--
-- Purely additive: new nullable columns on the existing `partner_invites`
-- table only, same as 0002/0003. All four optional — enforced nowhere,
-- same as every other detail field here.

alter table partner_invites
  add column if not exists groom_name text,
  add column if not exists groom_parents text,
  add column if not exists bride_name text,
  add column if not exists bride_parents text;

-- ---------------------------------------------------------------------------
-- spend_partner_credit_for_invite — replaces the version in
-- 0003_b2b_partner_invite_client_contact.sql with one that also accepts and
-- stores groom_name/groom_parents/bride_name/bride_parents. Same
-- atomicity/locking behavior as before — only the parameter list and the
-- final insert grew.
--
-- IMPORTANT (see 0004_b2b_partner_invite_drop_stale_overloads.sql):
-- `create or replace function` only replaces a function whose parameter
-- list is IDENTICAL to the existing one — adding trailing parameters
-- creates a stale overload instead of replacing it, which breaks
-- PostgREST's function resolution (PGRST203). The explicit `drop function`
-- below, targeting 0003's exact 18-parameter signature, prevents that from
-- recurring here.
-- ---------------------------------------------------------------------------
create or replace function spend_partner_credit_for_invite(
  p_partner_id uuid,
  p_slug text,
  p_template_id text,
  p_couple_names text,
  p_wedding_date text,
  p_wedding_time text,
  p_venue text,
  p_location_url text,
  p_message text,
  p_event_title text default null,
  p_photos jsonb default '[]'::jsonb,
  p_events jsonb default '[]'::jsonb,
  p_bg_song_title text default null,
  p_bg_song_artist text default null,
  p_bg_song_album_art text default null,
  p_bg_song_preview_url text default null,
  p_client_email text default null,
  p_client_phone text default null,
  p_groom_name text default null,
  p_groom_parents text default null,
  p_bride_name text default null,
  p_bride_parents text default null
)
returns partner_invites
language plpgsql
as $$
declare
  v_status text;
  v_balance integer;
  v_tx partner_credit_transactions;
  v_invite partner_invites;
begin
  select status, credits_remaining into v_status, v_balance
    from partners where id = p_partner_id for update;

  if v_status is null then
    raise exception 'partner % not found', p_partner_id;
  end if;
  if v_status <> 'active' then
    raise exception 'partner % is not active', p_partner_id;
  end if;
  if v_balance < 1 then
    raise exception 'insufficient credits for partner %', p_partner_id;
  end if;

  v_balance := v_balance - 1;
  update partners set credits_remaining = v_balance where id = p_partner_id;

  insert into partner_credit_transactions (
    partner_id, type, credits, balance_after, invite_slug, note
  ) values (
    p_partner_id, 'consumption', -1, v_balance, p_slug,
    'Spent 1 credit creating an invite for ' || p_couple_names
  )
  returning * into v_tx;

  insert into partner_invites (
    partner_id, slug, template_id, couple_names, wedding_date, wedding_time,
    venue, location_url, message, event_title, photos, events,
    bg_song_title, bg_song_artist, bg_song_album_art, bg_song_preview_url,
    client_email, client_phone, groom_name, groom_parents, bride_name,
    bride_parents, credit_transaction_id
  ) values (
    p_partner_id, p_slug, p_template_id, p_couple_names, p_wedding_date, p_wedding_time,
    p_venue, p_location_url, p_message, p_event_title,
    coalesce(p_photos, '[]'::jsonb), coalesce(p_events, '[]'::jsonb),
    p_bg_song_title, p_bg_song_artist, p_bg_song_album_art, p_bg_song_preview_url,
    p_client_email, p_client_phone, p_groom_name, p_groom_parents, p_bride_name,
    p_bride_parents, v_tx.id
  )
  returning * into v_invite;

  return v_invite;
end;
$$;

-- Drop the stale 18-parameter overload from 0003 — see the IMPORTANT note
-- above. No CREATE here, just removing what shouldn't still exist
-- alongside the 22-parameter version this migration just created.
drop function if exists spend_partner_credit_for_invite(
  uuid, text, text, text, text, text, text, text, text, text, jsonb, jsonb, text, text, text, text, text, text
);

-- =============================================================================
-- SOURCE: supabase/migrations/0006_consumer_invites.sql
-- =============================================================================

-- Consumer: the `invites` table + its Storage bucket.
--
-- THIS TABLE ALREADY EXISTS IN PRODUCTION but was never checked in as a
-- migration file — it was only ever documented as copy-pasteable SQL in
-- INVITES-SETUP.md ("One-time setup") and its later "Add the ... column"
-- addenda (photos, event_title/events, host_*, bg_song_*, groom_*/bride_*),
-- run by hand against production's Supabase SQL Editor over several
-- sessions. This file captures that same final column set as a proper,
-- trackable migration, for the first time, so a fresh project (like a new
-- DEV Supabase project) can be bootstrapped with one `supabase db push`
-- instead of hand-copying SQL out of markdown docs.
--
-- Safe to run against the existing production project too — every
-- statement is idempotent (`if not exists`), so it's a no-op there.
--
-- Powers: the Invitation Builder (`/create`) and the live `/i/:slug` pages
-- it generates — see api/invites/index.js (POST), api/invites/[slug].js
-- (GET), api/photos.js (photo uploads). `rsvps`/`invites_due_for_reminder()`
-- (which reference this table) are in 0007_consumer_rsvps_and_reminders.sql.
--
-- Access model, matching the B2B tables in 0001-0005: RLS on, no policies.
-- Only the service_role key (server-side, api/_lib/supabase.js) bypasses
-- RLS — the public/anon key this project never uses gets zero access either way.

create table if not exists public.invites (
  id bigint generated always as identity primary key,
  slug text not null unique,
  occasion text,
  template_id text,
  template_name text,
  names text not null,
  date text not null,
  time text,
  venue text not null,
  location_url text,
  message text,
  amount integer not null default 0,
  payment_id text,
  payment_status text not null default 'pending',

  -- Invitation Builder photo uploads (api/photos.js) — public URLs only,
  -- the actual files live in the invite-photos Storage bucket below.
  photos text[] default '{}',

  -- Multiple event/function support (CreateInvitePage.jsx "Additional Events").
  event_title text,
  events jsonb default '[]'::jsonb,

  -- Host contact capture, private Host Dashboard, 4-hour reminder email
  -- (see 0007_consumer_rsvps_and_reminders.sql). host_token is the *only*
  -- access control for /i/:slug/host/:hostToken — there's no login system
  -- anywhere in this app.
  host_name text,
  host_email text,
  host_token text unique,
  reminder_sent_at timestamptz,

  -- Background Music Selection (MUSIC-SETUP.md) — a host's Spotify pick,
  -- played on /i/:slug when the envelope opens.
  bg_song_title text,
  bg_song_artist text,
  bg_song_album_art text,
  bg_song_preview_url text,

  -- "Family Details" (CreateInvitePage.jsx) — optional groom's/bride's
  -- name + parents, rendered as cards under the couple's names on
  -- WelcomeSplash.jsx (couple.people).
  groom_name text,
  groom_parents text,
  bride_name text,
  bride_parents text,

  created_at timestamptz not null default now()
);

-- Locked down by default: RLS on, no policies. Only the service_role key
-- (server-side only, used by the Serverless Functions) bypasses RLS.
alter table public.invites enable row level security;

-- ---------------------------------------------------------------------------
-- Storage: invite-photos bucket.
-- Source: INVITES-SETUP.md ("1b. Create the invite-photos Storage bucket").
-- Public read (so /i/:slug, viewed by anyone, can load images directly);
-- only the service-role key can write (api/photos.js) — same trust model
-- as the table above.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('invite-photos', 'invite-photos', true)
on conflict (id) do nothing;

-- =============================================================================
-- SOURCE: supabase/migrations/0007_consumer_rsvps_and_reminders.sql
-- =============================================================================

-- Consumer: the `rsvps` table + the 4-hour reminder-window function.
--
-- THIS TABLE/FUNCTION ALREADY EXIST IN PRODUCTION but, like `invites`
-- (see 0006_consumer_invites.sql), were never checked in as a migration
-- file — only documented as copy-pasteable SQL in
-- RSVPS-AND-REMINDERS-SETUP.md ("2. Create the rsvps table", "3. Create
-- the reminder-window function"). This file captures that same state as a
-- proper, trackable migration. Safe to run against production too —
-- `create table if not exists` / `create or replace function` are both
-- no-ops there.
--
-- Requires 0006_consumer_invites.sql to have run first (rsvps.invite_id
-- references invites.id).
--
-- Powers: guest RSVPs on `/i/:slug` (api/rsvps/index.js), the private Host
-- Dashboard (`/i/:slug/host/:hostToken`, api/invites/[slug]/host.js), the
-- Wishes Wall (api/wishes.js — reads guest_name/message/created_at from
-- this same table where message <> '', there is no separate "wishes"
-- table), and the send-event-reminders Edge Function (deployed/scheduled
-- separately — see RSVPS-AND-REMINDERS-SETUP.md's "4. Deploy the Edge
-- Function" / "5. Schedule it with pg_cron"; that step needs this
-- project's own project-ref and service-role key, so it's a manual,
-- per-project step rather than something this migration can do for you).

create table if not exists public.rsvps (
  id bigint generated always as identity primary key,
  -- invites.id is bigint, not uuid — matching that type here (rather than a
  -- uuid) is a compatibility necessity: a uuid FK can't reference a bigint PK.
  invite_id bigint not null references public.invites (id) on delete cascade,
  guest_name text not null,
  guest_email text,
  attendance text not null,       -- 'joyfully' | 'regretfully' (RsvpForm.jsx's own copy, stored verbatim)
  guest_count integer not null default 0,
  song text,
  advice text,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists rsvps_invite_id_idx on public.rsvps (invite_id);

alter table public.rsvps enable row level security;
-- No policies, same trust model as `invites` — only the service_role key
-- (Vercel Serverless Functions + the reminder Edge Function) can touch it.

-- ---------------------------------------------------------------------------
-- invites_due_for_reminder — every invite whose primary event starts within
-- the next 4 hours, has a host_email, is paid, and hasn't had its reminder
-- sent yet. Called by the send-event-reminders Edge Function.
--
-- Design notes (see RSVPS-AND-REMINDERS-SETUP.md for the full writeup):
--  - Invites with no `time` set are permanently skipped.
--  - The window is intentionally wide; the Edge Function *claims* each
--    invite (reminder_sent_at = now() where ... is null) before sending —
--    that's what guarantees no double-send, not the window's tightness.
--  - v1 only covers the invite's primary event (date/time columns), not
--    each entry in the `events` jsonb array (Haldi/Sangeet/etc).
-- ---------------------------------------------------------------------------
create or replace function public.invites_due_for_reminder()
returns setof public.invites
language sql
stable
as $$
  select *
  from public.invites
  where time is not null and time <> ''
    and host_email is not null and host_email <> ''
    and payment_status = 'paid'
    and reminder_sent_at is null
    and ((date || ' ' || time)::timestamp at time zone 'Asia/Kolkata')
        <= now() + interval '4 hours'
    and ((date || ' ' || time)::timestamp at time zone 'Asia/Kolkata') > now()
  order by (date || ' ' || time)::timestamp asc;
$$;

revoke execute on function public.invites_due_for_reminder() from anon, authenticated;
