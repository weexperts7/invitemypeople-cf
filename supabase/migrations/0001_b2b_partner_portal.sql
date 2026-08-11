-- B2B Partner Portal — partners, branding, and the credit ledger.
--
-- Run this against the same Supabase project the `invites`/`rsvps` tables
-- already live in (Supabase Dashboard → SQL Editor → paste and run, or
-- `supabase db push` if you have the CLI linked). There's no earlier
-- migration file for `invites`/`rsvps` in this repo — those were created by
-- hand in the dashboard — so this is the first schema captured as SQL;
-- worth doing here since the partner portal has enough moving pieces
-- (5 tables' worth of relationships in 2 tables) to be worth versioning.
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
-- never the client-side anon key. RLS is enabled on both tables below with
-- ZERO policies for anon/authenticated, so even though the browser now also
-- holds a Supabase Auth session (for login/signup), PostgREST can't be used
-- to read or write partner data directly with it — only the server's
-- service-role key can, which bypasses RLS entirely. This keeps the same
-- "server owns every write" shape the rest of the app already relies on.

-- ---------------------------------------------------------------------------
-- partners — one row per partner business, keyed by its Supabase Auth user.
-- ---------------------------------------------------------------------------
create table if not exists partners (
  id uuid primary key references auth.users (id) on delete cascade,
  business_name text not null,
  contact_name text not null,
  email text not null unique,
  phone text,

  -- Approval workflow (see /api/admin/partners/*). New signups always start
  -- 'pending' — see api/partners/signup.js — and only an admin-approve/
  -- reject call ever moves them out of it.
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'suspended')),
  rejected_reason text,
  approved_at timestamptz,
  -- The approving/rejecting admin's email (from ADMIN_EMAILS, not a
  -- separate admins table — see api/_lib/auth.js) for an audit trail.
  reviewed_by text,

  -- White-label branding — applied to invites this partner creates once
  -- approved. All optional; unset fields fall back to this app's own
  -- branding wherever they're read (see brandingApi.js on the frontend).
  brand_display_name text,
  brand_logo_url text,
  brand_primary_color text,
  brand_secondary_color text,

  -- Denormalized running balance, kept in lockstep with
  -- partner_credit_transactions by every write in api/_lib/partners.js's
  -- recordCreditTransaction() (never written directly anywhere else) —
  -- avoids a SUM() over the whole ledger on every dashboard load.
  credit_balance integer not null default 0,

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
-- partner_credit_transactions — append-only ledger backing credit_balance.
-- ---------------------------------------------------------------------------
-- `credits` is signed (positive for a package purchase or a manual top-up,
-- negative for spending a credit or a manual deduction) so credit_balance is
-- always just "the running sum" — see recordCreditTransaction() in
-- api/_lib/partners.js, the only place that ever inserts here.
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

  -- Set when a 'consumption' row was spent creating a specific invite —
  -- lets the ledger UI link "−1 credit" straight to the invite it paid for.
  invite_slug text,

  note text,
  created_at timestamptz not null default now()
);

create index if not exists partner_credit_transactions_partner_idx
  on partner_credit_transactions (partner_id, created_at desc);

alter table partner_credit_transactions enable row level security;
-- No policies: locked to the service-role key. See the file header.

-- ---------------------------------------------------------------------------
-- apply_partner_credit_transaction — the ONLY way credit_balance ever
-- changes. Called via supabase.rpc() from recordCreditTransaction() in
-- api/_lib/partners.js (purchases, consumption, refunds, manual
-- adjustments all go through it) instead of the server doing a
-- read-balance-then-write-both-rows round trip, so two requests for the
-- same partner arriving at once (a purchase-verify retry racing a credit
-- spend, say) can't both read the same starting balance and silently lose
-- one update — `for update` below takes a row lock on the partner for the
-- duration of the transaction, so the second caller waits for the first to
-- finish instead of racing it.
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
  select credit_balance into v_balance from partners where id = p_partner_id for update;
  if v_balance is null then
    raise exception 'partner % not found', p_partner_id;
  end if;

  v_balance := v_balance + p_credits;
  if v_balance < 0 then
    raise exception 'insufficient credits for partner %', p_partner_id;
  end if;

  update partners set credit_balance = v_balance where id = p_partner_id;

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
