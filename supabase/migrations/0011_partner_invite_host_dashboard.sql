-- B2B Partner Portal — adds a private Host Dashboard + guest RSVPs for
-- partner-created client invites (/p/:slug), matching what a consumer's own
-- Invitation Builder invite already gets (see 0006_consumer_invites.sql's
-- host_token / 0007_consumer_rsvps_and_reminders.sql's `rsvps` table).
--
-- Until now `/p/:slug` had no RSVP/Wishes Wall/host-dashboard concept at all
-- (see B2B-PARTNER-PORTAL-SETUP.md's "Not yet built") — this is that,
-- deliberately built as a partner-side TWIN of the consumer feature rather
-- than reusing it, to keep 0001's "CRITICAL, by design" isolation guarantee
-- intact: no ALTER on `invites`/`rsvps`, no FK pointing at them, nothing in
-- api/_lib/partnerHandlers.js/partners.js ever imports from
-- api/_lib/invites.js or api/_lib/rsvps.js. See api/_lib/partners.js's own
-- (duplicated) generateHostToken()/tokensMatch() for the code-level half of
-- that same isolation call.
--
-- Run this against the same Supabase project 0001-0010 already ran against
-- (Supabase Dashboard → SQL Editor → paste and run, or `supabase db push`).

-- ---------------------------------------------------------------------------
-- partner_invites.host_token — the private Host Dashboard's only access
-- control (/p/:slug/host/:hostToken), same model as invites.host_token:
-- generated once at creation (see createClientInvite() in
-- api/_lib/partnerHandlers.js), returned to the caller exactly once, never
-- exposed by any other read (rowToPartnerInvite() stays an explicit
-- allowlist that excludes it — see api/_lib/partners.js). Purely additive,
-- nullable: existing partner invites created before this column simply have
-- no dashboard link until recreated.
-- ---------------------------------------------------------------------------
alter table partner_invites
  add column if not exists host_token text unique;

-- ---------------------------------------------------------------------------
-- partner_rsvps — a structural twin of the consumer `rsvps` table
-- (0007_consumer_rsvps_and_reminders.sql), foreign-keyed to `partner_invites`
-- instead. Note the FK type: partner_invites.id is uuid (unlike invites.id,
-- which is bigint) — invite_id here is uuid to match.
-- ---------------------------------------------------------------------------
create table if not exists partner_rsvps (
  id bigint generated always as identity primary key,
  invite_id uuid not null references partner_invites (id) on delete cascade,
  guest_name text not null,
  guest_email text,
  attendance text not null,       -- 'joyfully' | 'regretfully' (RsvpForm.jsx's own copy, stored verbatim)
  guest_count integer not null default 0,
  song text,
  advice text,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists partner_rsvps_invite_id_idx on partner_rsvps (invite_id);

alter table partner_rsvps enable row level security;
-- No policies: locked to the service-role key, same trust model as every
-- other table in this file.

-- ---------------------------------------------------------------------------
-- spend_partner_credit_for_invite — replaces the version in
-- 0005_partner_invite_family_names.sql with one that also accepts and
-- stores host_token. Same atomicity/locking behavior as before — only the
-- parameter list and the final insert grew.
--
-- IMPORTANT (see 0004's own note on this): `create or replace function`
-- only replaces a function whose parameter list is IDENTICAL to the
-- existing one — adding a trailing parameter creates a stale overload
-- instead of replacing it, which breaks PostgREST's function resolution
-- (PGRST203). The explicit `drop function` below, targeting 0005's exact
-- 22-parameter signature, prevents that from recurring here.
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
  p_bride_parents text default null,
  p_host_token text default null
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
    bride_parents, host_token, credit_transaction_id
  ) values (
    p_partner_id, p_slug, p_template_id, p_couple_names, p_wedding_date, p_wedding_time,
    p_venue, p_location_url, p_message, p_event_title,
    coalesce(p_photos, '[]'::jsonb), coalesce(p_events, '[]'::jsonb),
    p_bg_song_title, p_bg_song_artist, p_bg_song_album_art, p_bg_song_preview_url,
    p_client_email, p_client_phone, p_groom_name, p_groom_parents, p_bride_name,
    p_bride_parents, p_host_token, v_tx.id
  )
  returning * into v_invite;

  return v_invite;
end;
$$;

-- Drop the stale 22-parameter overload from 0005 — see the IMPORTANT note
-- above. No CREATE here, just removing what shouldn't still exist alongside
-- the 23-parameter version this migration just created.
drop function if exists spend_partner_credit_for_invite(
  uuid, text, text, text, text, text, text, text, text, text, jsonb, jsonb, text, text, text, text, text, text, text, text, text, text
);
