-- B2B Partner Portal — adds `greeting_line` to `partner_invites`, the same
-- buyer-customizable override for the hero's opening invocation
-- (WelcomeSplash.jsx's greeting.line — "Shubh Vivah"/"Radhe Radhe"/
-- "Rab Rakha") that 0012_invites_greeting_line.sql added to the consumer
-- `invites` table. PartnerCreateInvitePage.jsx's own "Opening Greeting"
-- field saves this; falls back to the selected template's own stock line
-- when left blank (see buildWeddingExperienceTemplate.js, shared by both
-- GeneratedInvitePage.jsx and PartnerInviteViewerPage.jsx).
--
-- Run this against the same Supabase project 0001-0012 already ran
-- against.

alter table partner_invites add column if not exists greeting_line text;

-- ---------------------------------------------------------------------------
-- spend_partner_credit_for_invite — replaces the 23-parameter version in
-- 0011_partner_invite_host_dashboard.sql with one that also accepts and
-- stores greeting_line. Same atomicity/locking behavior as before — only
-- the parameter list and the final insert grew.
--
-- IMPORTANT (see 0004's own note on this): `create or replace function`
-- only replaces a function whose parameter list is IDENTICAL to the
-- existing one — adding a trailing parameter creates a stale overload
-- instead of replacing it, which breaks PostgREST's function resolution
-- (PGRST203). The explicit `drop function` below, targeting 0011's exact
-- 23-parameter signature, prevents that from recurring here.
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
  p_host_token text default null,
  p_greeting_line text default null
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
    bride_parents, host_token, greeting_line, credit_transaction_id
  ) values (
    p_partner_id, p_slug, p_template_id, p_couple_names, p_wedding_date, p_wedding_time,
    p_venue, p_location_url, p_message, p_event_title,
    coalesce(p_photos, '[]'::jsonb), coalesce(p_events, '[]'::jsonb),
    p_bg_song_title, p_bg_song_artist, p_bg_song_album_art, p_bg_song_preview_url,
    p_client_email, p_client_phone, p_groom_name, p_groom_parents, p_bride_name,
    p_bride_parents, p_host_token, p_greeting_line, v_tx.id
  )
  returning * into v_invite;

  return v_invite;
end;
$$;

-- Drop the stale 23-parameter overload from 0011 — see the IMPORTANT note
-- above. No CREATE here, just removing what shouldn't still exist alongside
-- the 24-parameter version this migration just created.
drop function if exists spend_partner_credit_for_invite(
  uuid, text, text, text, text, text, text, text, text, text, jsonb, jsonb, text, text, text, text, text, text, text, text, text, text, text
);
