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
