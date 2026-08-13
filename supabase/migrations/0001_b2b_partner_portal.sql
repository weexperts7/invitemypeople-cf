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
