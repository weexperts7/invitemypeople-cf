-- Super Admin Template Price Management — per-template price overrides.
--
-- Deliberately stores ONLY overrides, not a row per template: the existing
-- global price (getActivePrice() in src/data/sale.js — the launch-sale
-- price while its window is open, PRICING.shagunPrice once it closes)
-- already IS the correct default for every template today. A template with
-- no row here just keeps using that same dynamic default forever, exactly
-- as it does right now — nothing changes for it. An admin only needs to
-- write a row for a template whose price should genuinely differ from that
-- default; setting `price` here pins that one template's price until an
-- admin resets it (deleting its row), even across the sale window opening
-- or closing.
--
-- template_key matches BUILDER_TEMPLATES[].id (src/data/builderTemplates.js
-- — e.g. "wedding-rajasthani-royal"), the same id already threaded through
-- the whole create/checkout flow (CreateInvitePage.jsx -> PaymentModal.jsx
-- -> POST /api/create-order -> POST /api/invites). Not a foreign key: that
-- catalog is plain JS data, not a database table.
--
-- Access model, matching every other table in this app (see
-- 0006_consumer_invites.sql's header): RLS on, no policies. Only the
-- service_role key (server-side, api/_lib/supabase.js) can read or write —
-- reads for the public checkout price lookup go through GET
-- /api/template-prices (see api/_lib/templatePrices.js), never a direct
-- client-side Supabase call.

create table if not exists public.template_prices (
  id bigint generated always as identity primary key,
  template_key text not null unique,
  -- Denormalized display name (BUILDER_TEMPLATES[].name at the time it was
  -- set) purely so the admin pricing page can render a human-readable list
  -- without cross-referencing the JS catalog for a row that might be for a
  -- template renamed or removed since — never read for anything else.
  name text,
  -- Rupees, matching PRICING.price/shagunPrice's own unit (see
  -- src/data/pricing.js) — NOT paise. Converted to paise only at the very
  -- last step, in POST /api/create-order, the same place that already
  -- happens for the global price today.
  price integer not null check (price > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keeps updated_at honest on every UPDATE — same pattern as
-- partners_set_updated_at() in 0001_b2b_partner_portal.sql.
create or replace function template_prices_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists template_prices_updated_at on template_prices;
create trigger template_prices_updated_at
  before update on template_prices
  for each row
  execute function template_prices_set_updated_at();

alter table public.template_prices enable row level security;
-- No policies: locked to the service-role key. See the file header.
